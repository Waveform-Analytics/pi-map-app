'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Business } from '@/types';
import businessesData from '@/data/businesses.json';
import AdminMap from '@/components/admin/AdminMap';
import AdminForm from '@/components/admin/AdminForm';
import ShopsList from '@/components/admin/ShopsList';

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Business[]>([]);
  const [selectedShop, setSelectedShop] = useState<Business | null>(null);
  const [formCoordinates, setFormCoordinates] = useState<[number, number] | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize shops from JSON
  useEffect(() => {
    setShops(businessesData as Business[]);
  }, []);

  // Persist shops array to src/data/businesses.json via API
  const saveToFile = async (updatedShops: Business[]) => {
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedShops),
      });
      if (!res.ok) throw new Error('Failed to save');
    } catch {
      setSuccessMessage('⚠ Changes are in memory but failed to save to file');
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Dev-only check
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      window.location.href = '/';
    }
  }, []);

  const handleShopSelect = useCallback((shop: Business) => {
    setSelectedShop(shop);
    setFormCoordinates(shop.coordinates);
  }, []);

  // Sorted shop list for arrow key navigation (same order as ShopsList)
  const sortedShops = useMemo(
    () => [...shops].sort((a, b) => a.name.localeCompare(b.name)),
    [shops]
  );

  // Arrow key navigation through shops
  const handleKeyNav = useCallback(
    (e: KeyboardEvent) => {
      if (sortedShops.length === 0) return;
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

      // Don't capture if user is typing in a form field
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      e.preventDefault();

      const currentIndex = selectedShop
        ? sortedShops.findIndex((s) => s.id === selectedShop.id)
        : -1;

      let nextIndex: number;
      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex < sortedShops.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : sortedShops.length - 1;
      }

      handleShopSelect(sortedShops[nextIndex]);
    },
    [sortedShops, selectedShop, handleShopSelect]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [handleKeyNav]);

  const handleMapClick = (coordinates: [number, number]) => {
    setFormCoordinates(coordinates);
    setSelectedShop(null);
  };

  const handleMarkerDrag = (shopId: string, newCoordinates: [number, number]) => {
    const updatedShops = shops.map(shop =>
      shop.id === shopId
        ? { ...shop, coordinates: newCoordinates }
        : shop
    );
    setShops(updatedShops);

    if (selectedShop?.id === shopId) {
      setSelectedShop({ ...selectedShop, coordinates: newCoordinates });
    }
    saveToFile(updatedShops);
  };

  const handleSaveShop = (shopData: Partial<Business>) => {
    if (!formCoordinates) {
      alert('Please select a location on the map');
      return;
    }

    if (selectedShop) {
      // Update existing shop
      const updatedShop: Business = {
        ...selectedShop,
        ...shopData,
        coordinates: formCoordinates,
      };

      const updatedShops = shops.map(shop =>
        shop.id === selectedShop.id ? updatedShop : shop
      );
      setShops(updatedShops);

      // Keep the shop selected with updated data
      setSelectedShop(updatedShop);
      setSuccessMessage(`✓ ${shopData.name} updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      saveToFile(updatedShops);
    } else {
      // Add new shop
      const newShop: Business = {
        id: (Math.max(...shops.map(s => parseInt(s.id)), 0) + 1).toString(),
        name: shopData.name || '',
        description: shopData.description || '',
        address: shopData.address || '',
        hours: shopData.hours || '',
        coordinates: formCoordinates,
        website: shopData.website,
        phone: shopData.phone,
      };
      const updatedShops = [...shops, newShop];
      setShops(updatedShops);

      // Select the new shop
      setSelectedShop(newShop);
      setSuccessMessage(`✓ ${newShop.name} created successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      saveToFile(updatedShops);
    }
  };

  const handleDeleteShop = () => {
    if (!selectedShop) return;
    if (!confirm(`Delete "${selectedShop.name}"?`)) return;
    
    const updatedShops = shops.filter(shop => shop.id !== selectedShop.id);
    setShops(updatedShops);
    setSelectedShop(null);
    setFormCoordinates(null);
    setSuccessMessage(`✓ "${selectedShop.name}" deleted`);
    setTimeout(() => setSuccessMessage(null), 3000);
    saveToFile(updatedShops);
  };

  const handleClear = () => {
    setSelectedShop(null);
    setFormCoordinates(null);
  };

  const handleExportJSON = () => {
    if (shops.length === 0) {
      alert('No shops to export!');
      return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `businesses-${timestamp}.json`;
    
    const dataStr = JSON.stringify(shops, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    setSuccessMessage(`✓ Downloaded ${filename} to your Downloads folder`);
    setTimeout(() => setSuccessMessage(null), 5000);
    
    // Also show browser alert as backup
    setTimeout(() => {
      alert(`File downloaded: ${filename}\n\nCheck your Downloads folder!`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-stone-800 to-stone-700 text-white shadow-lg">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Shop Admin</h1>
              <p className="text-stone-300 text-sm">Manage Pleasure Island shops</p>
              {successMessage && (
                <p className="text-emerald-300 text-sm mt-2 font-medium animate-pulse">
                  {successMessage}
                </p>
              )}
            </div>
            <button
              onClick={handleExportJSON}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              ⬇ Export JSON
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
          {/* Map Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <AdminMap
              shops={shops}
              selectedShopId={selectedShop?.id || null}
              formCoordinates={formCoordinates}
              onMapClick={handleMapClick}
              onMarkerDrag={handleMarkerDrag}
              onMarkerClick={handleShopSelect}
            />
          </div>

          {/* List & Form Section */}
          <div className="flex flex-col gap-6 min-h-0">
            {/* Shops List */}
            <div className="bg-white rounded-xl shadow-lg p-6 overflow-y-auto flex-1 min-h-0">
              <ShopsList
                shops={shops}
                selectedShopId={selectedShop?.id || null}
                onShopSelect={handleShopSelect}
              />
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-lg p-6 overflow-y-auto flex-shrink-0 max-h-[50vh]">
              <AdminForm
                shop={selectedShop}
                coordinates={formCoordinates}
                onSave={handleSaveShop}
                onDelete={handleDeleteShop}
                onClear={handleClear}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
