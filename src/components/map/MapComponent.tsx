'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Business } from '@/types';

import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  businesses: Business[];
  selectedBusinessId?: string | null;
  onBusinessClick?: (business: Business | null) => void;
}

export default function MapComponent({ businesses, selectedBusinessId, onBusinessClick }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Check if we have a Mapbox token
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error('Mapbox access token is required. Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file');
      return;
    }

    mapboxgl.accessToken = token;

    // Initialize map centered on Pleasure Island (Carolina Beach), NC
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-77.8868, 34.0581], // Carolina Beach/Pleasure Island coordinates
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Add click handler to clear selection when clicking empty space
    map.current.on('click', () => {
      onBusinessClick?.(null);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [onBusinessClick, selectedBusinessId]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each business
    businesses.forEach((business) => {
      const isSelected = business.id === selectedBusinessId;
      const hasSelection = selectedBusinessId !== null;
      
      // Create marker with proper color and size based on state
      const marker = new mapboxgl.Marker({
        color: business.isChamberMember ? '#f43f5e' : '#0284c7',
        scale: isSelected ? 1.2 : 0.8
      })
        .setLngLat(business.coordinates)
        .addTo(map.current!);

      // Store marker reference with business ID for easier management
      markersRef.current.push(marker);

      // Add click handler to the marker element
      const markerElement = marker.getElement();
      markerElement.style.cursor = 'pointer';
      
      // Visual feedback based on selection state
      if (isSelected) {
        // Selected marker: glow + on top
        markerElement.style.filter = 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.6))';
        markerElement.style.zIndex = '1000';
        markerElement.style.opacity = '1';
      } else if (hasSelection) {
        // Other markers when something is selected: faded
        markerElement.style.filter = 'none';
        markerElement.style.zIndex = '1';
        markerElement.style.opacity = '0.4';
      } else {
        // No selection: normal state
        markerElement.style.filter = 'none';
        markerElement.style.zIndex = '1';
        markerElement.style.opacity = '1';
      }
      
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Toggle behavior: if clicking the same marker, deselect
        if (isSelected) {
          onBusinessClick?.(null);
        } else {
          onBusinessClick?.(business);
        }
      });
    });
  }, [businesses, mapLoaded, selectedBusinessId, onBusinessClick]);

  // Center map on selected business
  useEffect(() => {
    if (!map.current || !selectedBusinessId) return;
    
    const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
    if (selectedBusiness) {
      map.current.flyTo({
        center: selectedBusiness.coordinates,
        zoom: Math.max(map.current.getZoom(), 14),
        essential: true
      });
    }
  }, [selectedBusinessId, businesses]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold mb-2">Map Configuration Required</h3>
          <p className="text-gray-600 mb-4">
            Please add your Mapbox access token to get started:
          </p>
          <ol className="text-left text-sm text-gray-600 space-y-1">
            <li>1. Create a free account at <a href="https://mapbox.com" className="text-blue-600">mapbox.com</a></li>
            <li>2. Get your access token from your Mapbox dashboard</li>
            <li>3. Create a <code className="bg-gray-200 px-1">.env.local</code> file in your project root</li>
            <li>4. Add: <code className="bg-gray-200 px-1">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here</code></li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
}