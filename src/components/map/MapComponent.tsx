'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Business } from '@/types';

import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
}

export default function MapComponent({ businesses, onBusinessClick }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add markers for each business
    businesses.forEach((business) => {
      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'business-marker';
      markerElement.style.cssText = `
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: ${business.isChamberMember ? 'linear-gradient(135deg, #fb7185, #f43f5e)' : 'linear-gradient(135deg, #0ea5e9, #0284c7)'};
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
        position: relative;
      `;

      // Create popup content
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        className: 'custom-popup'
      }).setHTML(`
        <div class="p-4 max-w-sm" style="font-family: Inter, sans-serif;">
          <h3 class="font-bold text-xl text-stone-700 mb-2" style="font-family: Poppins, sans-serif;">${business.name}</h3>
          ${business.isChamberMember ? '<span class="inline-block bg-gradient-to-r from-rose-400 to-rose-500 text-white text-xs px-3 py-1.5 rounded-full mb-3 shadow-sm font-medium">Chamber Member</span>' : ''}
          <p class="text-sm text-stone-600 mb-3 leading-relaxed">${business.description}</p>
          <div class="text-sm text-stone-500 space-y-2">
            <div><strong>Hours:</strong> ${business.hours}</div>
            <div><strong>Address:</strong> ${business.address}</div>
            ${business.website ? `<div><a href="${business.website}" target="_blank" class="text-sky-600 hover:text-sky-700 hover:underline transition-colors">Visit Website</a></div>` : ''}
            ${business.phone ? `<div><strong>Phone:</strong> <a href="tel:${business.phone}" class="text-sky-600 hover:text-sky-700 transition-colors">${business.phone}</a></div>` : ''}
          </div>
        </div>
      `);

      // Create marker and add to map
      new mapboxgl.Marker(markerElement)
        .setLngLat(business.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler
      markerElement.addEventListener('click', () => {
        onBusinessClick?.(business);
      });
    });
  }, [businesses, mapLoaded, onBusinessClick]);

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