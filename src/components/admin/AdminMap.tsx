'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Business } from '@/types';

import 'mapbox-gl/dist/mapbox-gl.css';

interface AdminMapProps {
  shops: Business[];
  selectedShopId: string | null;
  formCoordinates: [number, number] | null;
  onMapClick: (coordinates: [number, number]) => void;
  onMarkerDrag: (shopId: string, coordinates: [number, number]) => void;
  onMarkerClick: (shop: Business) => void;
}

export default function AdminMap({
  shops,
  selectedShopId,
  formCoordinates,
  onMapClick,
  onMarkerDrag,
  onMarkerClick,
}: AdminMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const markerElementsRef = useRef<{ [key: string]: HTMLDivElement }>({});
  const tempMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const dragStateRef = useRef<{
    isDragging: boolean;
    shopId: string | null;
    startX: number;
    startY: number;
  }>({
    isDragging: false,
    shopId: null,
    startX: 0,
    startY: 0,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error('Mapbox access token is required');
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-77.8868, 34.0581],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Handle map click to place new marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      // Don't place marker if we're dragging
      if (dragStateRef.current.isDragging) return;
      
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      onMapClick(coords);
    };

    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
    };
  }, [mapLoaded, onMapClick]);

  // Update markers for shops
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    markerElementsRef.current = {};

    // Add markers for each shop
    shops.forEach((shop, index) => {
      const isSelected = shop.id === selectedShopId;
      
      const markerElement = document.createElement('div');
      markerElement.style.width = isSelected ? '40px' : '32px';
      markerElement.style.height = isSelected ? '40px' : '32px';
      markerElement.style.cursor = 'grab';
      markerElement.style.userSelect = 'none';
      markerElement.className = `rounded-full flex items-center justify-center font-bold text-white text-sm transition-all ${
        isSelected 
          ? 'bg-blue-600 shadow-lg shadow-blue-400/50' 
          : 'bg-blue-500 shadow-md hover:bg-blue-600'
      }`;
      markerElement.textContent = (index + 1).toString();

      // Create marker WITHOUT draggable property
      const marker = new mapboxgl.Marker({
        element: markerElement,
      })
        .setLngLat(shop.coordinates)
        .addTo(map.current!);

      // Manual drag handlers
      let isDragging = false;
      let startX = 0;
      let startY = 0;

      markerElement.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        dragStateRef.current.isDragging = true;
        dragStateRef.current.shopId = shop.id;
        markerElement.style.cursor = 'grabbing';
        markerElement.style.opacity = '0.8';
        
        // Disable map dragging during marker drag
        if (map.current) {
          map.current.dragPan.disable();
        }
      });

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !map.current) return;

        // Get current marker position on screen
        const mapCanvas = map.current.getCanvas();
        const rect = mapCanvas.getBoundingClientRect();
        
        // Calculate delta
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Update start position for next move
        startX = e.clientX;
        startY = e.clientY;
        
        // Convert screen delta to lngLat
        const mapCenterLngLat = map.current.project(marker.getLngLat());
        const newScreenPos = {
          x: mapCenterLngLat.x + deltaX,
          y: mapCenterLngLat.y + deltaY,
        };
        
        const newLngLat = map.current.unproject(newScreenPos);
        const coords: [number, number] = [newLngLat.lng, newLngLat.lat];
        
        marker.setLngLat(coords);
        onMarkerDrag(shop.id, coords);
      };

      const handleMouseUp = () => {
        isDragging = false;
        dragStateRef.current.isDragging = false;
        dragStateRef.current.shopId = null;
        markerElement.style.cursor = 'grab';
        markerElement.style.opacity = '1';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Re-enable map dragging
        if (map.current) {
          map.current.dragPan.enable();
        }
      };

      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!dragStateRef.current.isDragging) {
          onMarkerClick(shop);
        }
      });

      // Store references
      markersRef.current[shop.id] = marker;
      markerElementsRef.current[shop.id] = markerElement;

      // Add global mouse listeners when drag starts
      const addMouseListeners = () => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      };

      markerElement.addEventListener('mousedown', addMouseListeners, { once: false });
    });
  }, [shops, selectedShopId, mapLoaded, onMarkerDrag, onMarkerClick]);

  // Show temporary marker for form coordinates
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    if (formCoordinates && !selectedShopId) {
      const markerElement = document.createElement('div');
      markerElement.style.width = '28px';
      markerElement.style.height = '28px';
      markerElement.className = 'bg-emerald-500 rounded-full shadow-lg flex items-center justify-center';
      
      const innerDiv = document.createElement('div');
      innerDiv.style.width = '12px';
      innerDiv.style.height = '12px';
      innerDiv.className = 'bg-white rounded-full';
      markerElement.appendChild(innerDiv);

      tempMarkerRef.current = new mapboxgl.Marker({ element: markerElement })
        .setLngLat(formCoordinates)
        .addTo(map.current!);
    }
  }, [formCoordinates, selectedShopId, mapLoaded]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Mapbox token required</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full" />;
}
