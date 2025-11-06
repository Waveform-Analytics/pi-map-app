'use client';

import { Business } from '@/types';
import { MapPin } from 'lucide-react';

interface ShopsListProps {
  shops: Business[];
  selectedShopId: string | null;
  onShopSelect: (shop: Business) => void;
}

export default function ShopsList({
  shops,
  selectedShopId,
  onShopSelect,
}: ShopsListProps) {
  const sortedShops = [...shops].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-stone-800 mb-4">
        Shops ({shops.length})
      </h3>
      
      <div className="space-y-2 max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
        {sortedShops.map((shop, index) => (
          <button
            key={shop.id}
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
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
