'use client';

import { useState, useMemo } from 'react';
import { Business, Category } from '@/types';
import BusinessCard from './BusinessCard';
import { Search, Filter } from 'lucide-react';

interface BusinessDirectoryProps {
  businesses: Business[];
  categories: Category[];
  onBusinessSelect?: (business: Business) => void;
  hideFilters?: boolean;
}

export default function BusinessDirectory({ 
  businesses, 
  categories, 
  onBusinessSelect,
  hideFilters = false
}: BusinessDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showChamberOnly, setShowChamberOnly] = useState(false);

  // Use passed businesses directly if filters are hidden
  const filteredBusinesses = useMemo(() => {
    if (hideFilters) {
      return businesses;
    }
    
    return businesses.filter((business) => {
      // Search filter
      const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory;

      // Chamber member filter
      const matchesChamber = !showChamberOnly || business.isChamberMember;

      return matchesSearch && matchesCategory && matchesChamber;
    });
  }, [businesses, searchTerm, selectedCategory, showChamberOnly, hideFilters]);

  // Sort businesses: Chamber members first, then alphabetically
  const sortedBusinesses = useMemo(() => {
    return [...filteredBusinesses].sort((a, b) => {
      if (a.isChamberMember && !b.isChamberMember) return -1;
      if (!a.isChamberMember && b.isChamberMember) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredBusinesses]);

  return (
    <div className="space-y-8">
      {/* Header - only show if filters are visible */}
      {!hideFilters && (
        <div className="text-center">
          <h2 className="text-3xl font-poppins font-bold text-stone-700 mb-3">Business Directory</h2>
          <p className="text-stone-600 text-lg">
            Discover local businesses and Chamber members on Pleasure Island
          </p>
        </div>
      )}

      {/* Filters */}
      {!hideFilters && (
        <div className="bg-white rounded-2xl shadow-lg shadow-stone-200/50 p-6 space-y-6 border border-stone-200/50">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search businesses, descriptions, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-stone-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-stone-700 placeholder-stone-400"
          />
        </div>

        {/* Category and Chamber filters */}
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-stone-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-stone-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-stone-700"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showChamberOnly}
              onChange={(e) => setShowChamberOnly(e.target.checked)}
              className="rounded border-stone-300 text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span className="text-sm text-stone-700 font-medium">Chamber Members Only</span>
          </label>
        </div>
      </div>
      )}

      {/* Results count */}
      {!hideFilters && (
        <div className="text-stone-600 text-center">
          Showing <span className="font-semibold text-stone-700">{sortedBusinesses.length}</span> of <span className="font-semibold text-stone-700">{businesses.length}</span> businesses
        </div>
      )}

      {/* Business grid */}
      <div className={`grid gap-6 ${hideFilters ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {sortedBusinesses.map((business) => (
          <BusinessCard
            key={business.id}
            business={business}
            onClick={() => onBusinessSelect?.(business)}
          />
        ))}
      </div>

      {/* No results */}
      {sortedBusinesses.length === 0 && (
        <div className="text-center py-16">
          <p className="text-stone-500 text-xl mb-2">No businesses found matching your criteria.</p>
          <p className="text-stone-400 text-sm">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}