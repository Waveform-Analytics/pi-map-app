'use client';

import { useState } from 'react';
import MapComponent from '@/components/map/MapComponent';
import BusinessDirectory from '@/components/business/BusinessDirectory';
import { Business } from '@/types';

// Import data
import businessesData from '@/data/businesses.json';
import categoriesData from '@/data/categories.json';

export default function Home() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'directory'>('map');

  const businesses = businessesData as Business[];
  const categories = categoriesData;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-stone-50 to-blue-50 shadow-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-poppins font-bold text-stone-700">Pleasure Island Map</h1>
              <p className="text-stone-600 text-lg mt-2 font-medium">Your friendly guide to Carolina Beach, Kure Beach & Fort Fisher</p>
            </div>
            
            {/* Tab Navigation */}
            <nav className="flex space-x-3">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-8 py-4 text-base font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === 'map'
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                    : 'text-stone-600 hover:text-sky-600 hover:bg-white/70 bg-white/50'
                }`}
              >
                Map View
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-8 py-4 text-base font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === 'directory'
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                    : 'text-stone-600 hover:text-sky-600 hover:bg-white/70 bg-white/50'
                }`}
              >
                Business Directory
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'map' ? (
          <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-200/50">
            <MapComponent 
              businesses={businesses}
              onBusinessClick={setSelectedBusiness}
            />
          </div>
        ) : (
          <BusinessDirectory
            businesses={businesses}
            categories={categories}
            onBusinessSelect={setSelectedBusiness}
          />
        )}
      </main>

      {/* Welcome Message for new users */}
      {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-br from-sky-50 to-emerald-50 border border-sky-200 rounded-2xl p-6 max-w-sm shadow-xl shadow-sky-500/20">
          <h3 className="font-poppins font-semibold text-stone-700 mb-2">Welcome to Pleasure Island Map!</h3>
          <p className="text-stone-600 text-sm">
            To see the interactive map, you'll need to add your Mapbox API key. 
            Check the map component for setup instructions.
          </p>
        </div>
      )}
    </div>
  );
}
