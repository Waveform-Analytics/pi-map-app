'use client';

import { useMemo, useRef, useEffect } from 'react';
import { Business } from '@/types';
import BusinessCard from './BusinessCard';

interface BusinessDirectoryProps {
  businesses: Business[];
  selectedBusinessId?: string | null;
  onBusinessSelect?: (business: Business | null) => void;
}

export default function BusinessDirectory({ 
  businesses, 
  selectedBusinessId,
  onBusinessSelect
}: BusinessDirectoryProps) {
  // Sort businesses alphabetically
  const sortedBusinesses = useMemo(() => {
    return [...businesses].sort((a, b) => a.name.localeCompare(b.name));
  }, [businesses]);

  // Ref for business elements
  const businessRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Scroll to selected business when selectedBusinessId changes
  useEffect(() => {
    if (selectedBusinessId && businessRefs.current[selectedBusinessId]) {
      const element = businessRefs.current[selectedBusinessId];
      element?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'start'
      });
    }
  }, [selectedBusinessId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-poppins font-bold text-stone-700 mb-2">Participating Shops</h2>
      </div>

      {/* Results count */}
      <div className="text-stone-600 text-center text-sm">
        <span className="font-semibold text-stone-700">{sortedBusinesses.length}</span> shops to visit!
      </div>

      {/* Business list */}
      <div className="space-y-4">
        {sortedBusinesses.map((business) => {
          const isSelected = business.id === selectedBusinessId;
          return (
            <div
              key={business.id}
              ref={(el) => { businessRefs.current[business.id] = el; }}
              className={`transition-all duration-200 ${
                isSelected 
                  ? 'bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-400 rounded-2xl p-2' 
                  : ''
              }`}
            >
              <BusinessCard
                business={business}
                onClick={() => {
                  // Toggle behavior: if clicking the same card, deselect
                  if (isSelected) {
                    onBusinessSelect?.(null);
                  } else {
                    onBusinessSelect?.(business);
                  }
                }}
              />
            </div>
          );
        })}
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