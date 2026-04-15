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
  const shopsRef = useRef<Business[]>([]);
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

    // Sort alphabetically — same order as ShopsList
    const sorted = [...shops].sort((a, b) => a.name.localeCompare(b.name));

    // Add markers for each shop
    sorted.forEach((shop, index) => {
      const isSelected = shop.id === selectedShopId;
      const isInactive = shop.active === false;
      const isSponsor = shop.isSponsor === true;

      // Color: inactive = gray, sponsor = amber, regular = blue
      let bgClass: string;
      if (isInactive) {
        bgClass = isSelected ? 'bg-stone-500 shadow-lg shadow-stone-400/50' : 'bg-stone-400 shadow-md';
      } else if (isSponsor) {
        bgClass = isSelected ? 'bg-amber-600 shadow-lg shadow-amber-400/50' : 'bg-amber-500 shadow-md hover:bg-amber-600';
      } else {
        bgClass = isSelected ? 'bg-blue-600 shadow-lg shadow-blue-400/50' : 'bg-blue-500 shadow-md hover:bg-blue-600';
      }

      const markerElement = document.createElement('div');
      markerElement.style.width = isSelected ? '40px' : '32px';
      markerElement.style.height = isSelected ? '40px' : '32px';
      markerElement.style.cursor = 'grab';
      markerElement.style.userSelect = 'none';
      markerElement.style.opacity = isInactive ? '0.5' : '1';
      markerElement.className = `rounded-full flex items-center justify-center font-bold text-white text-sm transition-all ${bgClass}`;
      markerElement.textContent = (index + 1).toString();

      // Create marker WITHOUT draggable property
      const marker = new mapboxgl.Marker({
        element: markerElement,
      })
        .setLngLat(shop.coordinates)
        .addTo(map.current!);

      // Drag with movement threshold — distinguishes clicks from drags
      markerElement.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        let startX = e.clientX;
        let startY = e.clientY;
        let dragStarted = false;
        let lastCoords: [number, number] | null = null;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          if (!map.current) return;

          // Only enter drag mode after 4px of movement
          if (!dragStarted) {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            if (Math.abs(dx) + Math.abs(dy) < 4) return;
            dragStarted = true;
            dragStateRef.current.isDragging = true;
            dragStateRef.current.shopId = shop.id;
            markerElement.style.cursor = 'grabbing';
            markerElement.style.opacity = '0.8';
            map.current.dragPan.disable();
            startX = moveEvent.clientX;
            startY = moveEvent.clientY;
            return;
          }

          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;
          startX = moveEvent.clientX;
          startY = moveEvent.clientY;

          const screenPos = map.current.project(marker.getLngLat());
          const newLngLat = map.current.unproject(
            new mapboxgl.Point(screenPos.x + deltaX, screenPos.y + deltaY)
          );
          lastCoords = [newLngLat.lng, newLngLat.lat];
          marker.setLngLat(lastCoords);
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);

          if (dragStarted) {
            dragStateRef.current.isDragging = false;
            dragStateRef.current.shopId = null;
            markerElement.style.cursor = 'grab';
            markerElement.style.opacity = isInactive ? '0.5' : '1';
            if (map.current) map.current.dragPan.enable();
            if (lastCoords) onMarkerDrag(shop.id, lastCoords);
          }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      });

      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!dragStateRef.current.isDragging) {
          onMarkerClick(shop);
        }
      });

      // Store references
      markersRef.current[shop.id] = marker;
      markerElementsRef.current[shop.id] = markerElement;
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

  // Keep shops ref in sync for flyTo lookups
  useEffect(() => { shopsRef.current = shops; }, [shops]);

  // Pan/zoom to selected shop
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedShopId) return;
    const shop = shopsRef.current.find(s => s.id === selectedShopId);
    if (!shop) return;
    map.current.easeTo({
      center: shop.coordinates,
      zoom: Math.max(map.current.getZoom(), 15),
      duration: 600,
    });
  }, [selectedShopId, mapLoaded]);

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
