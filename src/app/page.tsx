'use client';

import { useState, useMemo, useEffect } from 'react';
import MapComponent from '@/components/map/MapComponent';
import BusinessDirectory from '@/components/business/BusinessDirectory';
import { Business } from '@/types';

// Import data
import businessesData from '@/data/businesses.json';
import categoriesData from '@/data/categories.json';

export default function Home() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showChamberOnly, setShowChamberOnly] = useState(false);

  // Handle business selection from map or directory
  const handleBusinessSelect = (business: Business | null) => {
    setSelectedBusiness(business);
    setSelectedBusinessId(business?.id || null);
  };

  const businesses = businessesData as Business[];
  const categories = categoriesData;

  // Unified filter logic
  const filteredBusinesses = useMemo(() => {
    const filtered = businesses.filter((business) => {
      // Enhanced search: include category names
      const categoryName = categories.find(cat => cat.id === business.category)?.name || '';
      const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory;
      const matchesChamber = !showChamberOnly || business.isChamberMember;
      
      return matchesSearch && matchesCategory && matchesChamber;
    });
    
    // Clear selection if the currently selected business is no longer visible
    if (selectedBusinessId && !filtered.some(b => b.id === selectedBusinessId)) {
      setSelectedBusinessId(null);
      setSelectedBusiness(null);
    }
    
    return filtered;
  }, [businesses, searchTerm, selectedCategory, showChamberOnly, selectedBusinessId, categories]);

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
      {/* Header */}
      <header className="bg-gradient-to-r from-stone-50 to-blue-50 shadow-sm border-b border-stone-200">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-poppins font-bold text-stone-700">Pleasure Island Map</h1>
              <p className="text-stone-600 text-lg mt-2 font-medium">Your friendly guide to Carolina Beach, Kure Beach &amp; Fort Fisher</p>
            </div>
            
            {/* Unified Filters */}
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <input
                type="text"
                placeholder="Search businesses, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showChamberOnly}
                  onChange={(e) => setShowChamberOnly(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                />
                <span className="text-stone-700 font-medium">Chamber Members Only</span>
              </label>
              
              <span className="text-stone-600 text-sm">
                Showing {filteredBusinesses.length} of {businesses.length} businesses
              </span>
              
              {selectedBusiness && (
                <button
                  onClick={() => handleBusinessSelect(null)}
                  className="text-sky-600 hover:text-sky-700 text-sm underline"
                >
                  Clear selection ({selectedBusiness.name})
                </button>
              )}
            </div>
          </div>
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
              categories={categories}
              selectedBusinessId={selectedBusinessId}
              onBusinessSelect={handleBusinessSelect}
              hideFilters={true}
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
