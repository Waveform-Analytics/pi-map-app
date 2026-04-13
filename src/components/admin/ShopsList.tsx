'use client';

import { useRef, useEffect } from 'react';
import { Business } from '@/types';
import { MapPin } from 'lucide-react';

interface ShopsListProps {
  shops: Business[];
  selectedShopId: string | null;
  onShopSelect: (shop: Business) => void;
}

function getMissingFields(shop: Business): string[] {
  const missing: string[] = [];
  if (!shop.address) missing.push('address');
  if (!shop.phone) missing.push('phone');
  if (shop.coordinates[0] === 0 && shop.coordinates[1] === 0) missing.push('location');
  return missing;
}

export default function ShopsList({
  shops,
  selectedShopId,
  onShopSelect,
}: ShopsListProps) {
  const sortedShops = [...shops].sort((a, b) => a.name.localeCompare(b.name));
  const shopRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    if (selectedShopId && shopRefs.current[selectedShopId]) {
      shopRefs.current[selectedShopId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedShopId]);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-stone-800 mb-4">
        Shops ({shops.length})
      </h3>

      <div className="space-y-2 max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
        {sortedShops.map((shop, index) => {
          const missing = getMissingFields(shop);
          return (
            <button
              key={shop.id}
              ref={(el) => { shopRefs.current[shop.id] = el; }}
              onClick={() => onShopSelect(shop)}
              className={`w-full text-left p-3 rounded-lg transition-all border-2 ${
                selectedShopId === shop.id
                  ? 'bg-blue-50 border-blue-500 shadow-md'
                  : 'bg-stone-50 border-transparent hover:bg-stone-100 hover:border-stone-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-stone-800 text-sm truncate">
                    {shop.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                    <MapPin size={12} />
                    <span className="font-mono truncate">
                      {shop.coordinates[0].toFixed(4)}, {shop.coordinates[1].toFixed(4)}
                    </span>
                  </div>
                  {missing.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {missing.map((field) => (
                        <span
                          key={field}
                          className="text-[10px] text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded"
                        >
                          no {field}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
