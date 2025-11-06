'use client';

import { useState, useEffect } from 'react';
import MapComponent from '@/components/map/MapComponent';
import BusinessDirectory from '@/components/business/BusinessDirectory';
import { Business } from '@/types';

// Import data
import businessesData from '@/data/businesses.json';

export default function Home() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  // Handle business selection from map or directory
  const handleBusinessSelect = (business: Business | null) => {
    setSelectedBusiness(business);
    setSelectedBusinessId(business?.id || null);
  };

  const businesses = businessesData as Business[];

  const filteredBusinesses = businesses;

  // Clear selection if the currently selected business is no longer visible
  useEffect(() => {
    if (selectedBusinessId && !filteredBusinesses.some(b => b.id === selectedBusinessId)) {
      setSelectedBusinessId(null);
      setSelectedBusiness(null);
    }
  }, [selectedBusinessId, filteredBusinesses]);

  // ESC key to clear selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedBusinessId) {
        handleBusinessSelect(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBusinessId]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Image Header */}
      <header className="bg-white shadow-sm">
        <div className="relative w-full">
          <img 
            src="/pop-and-shop-poster.png" 
            alt="Pleasure Island Pop and Shop - Saturday, Nov 22nd, 11am-5pm" 
            className="w-full h-auto object-contain max-h-[40vh] sm:max-h-[50vh]"
          />
          
          {/* Clear selection button overlay */}
          {selectedBusiness && (
            <div className="absolute top-4 right-4">
              <button
                onClick={() => handleBusinessSelect(null)}
                className="bg-white/90 backdrop-blur-sm text-sky-600 hover:text-sky-700 text-sm px-3 py-2 rounded-lg shadow-md border hover:bg-white transition-all"
              >
                Clear selection ({selectedBusiness.name})
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Side by Side Layout */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)] lg:h-[calc(100vh-240px)]">
          {/* Map Section */}
          <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-200/50 h-[50vh] lg:h-full">
            <MapComponent 
              businesses={filteredBusinesses}
              selectedBusinessId={selectedBusinessId}
              onBusinessClick={handleBusinessSelect}
            />
          </div>
          
          {/* Directory Section */}
          <div className="overflow-y-auto h-[50vh] lg:h-full bg-white rounded-2xl shadow-xl shadow-stone-200/50 p-6 border border-stone-200/50">
            <BusinessDirectory
              businesses={filteredBusinesses}
              selectedBusinessId={selectedBusinessId}
              onBusinessSelect={handleBusinessSelect}
            />
          </div>
        </div>
      </main>

      {/* Welcome Message for new users */}
      {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-br from-sky-50 to-emerald-50 border border-sky-200 rounded-2xl p-6 max-w-sm shadow-xl shadow-sky-500/20">
          <h3 className="font-poppins font-semibold text-stone-700 mb-2">Welcome to Pleasure Island Map!</h3>
          <p className="text-stone-600 text-sm">
            To see the interactive map, you&apos;ll need to add your Mapbox API key. 
            Check the map component for setup instructions.
          </p>
        </div>
      )}
    </div>
  );
}
