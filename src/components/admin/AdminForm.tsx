'use client';

import { useState, useEffect } from 'react';
import { Business } from '@/types';
import { Save, Trash2, X } from 'lucide-react';

interface AdminFormProps {
  shop: Business | null;
  coordinates: [number, number] | null;
  onSave: (shopData: Partial<Business>) => void;
  onDelete: () => void;
  onClear: () => void;
}

export default function AdminForm({
  shop,
  coordinates,
  onSave,
  onDelete,
  onClear,
}: AdminFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    hours: '',
    website: '',
    phone: '',
  });

  // Initialize form when shop changes
  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name,
        description: shop.description,
        address: shop.address,
        hours: shop.hours,
        website: shop.website || '',
        phone: shop.phone || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        address: '',
        hours: '',
        website: '',
        phone: '',
      });
    }
  }, [shop]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Shop name is required');
      return;
    }

    if (!coordinates) {
      alert('Please select a location on the map');
      return;
    }

    onSave(formData);
    // Don't clear form - keep it showing the saved data
    // The parent component will handle form state after successful save
  };

  const handleClear = () => {
    onClear();
    setFormData({
      name: '',
      description: '',
      address: '',
      hours: '',
      website: '',
      phone: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-stone-800">
        {shop ? 'Edit Shop' : 'Add New Shop'}
      </h3>

      {coordinates && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800">
          <div className="font-mono text-xs">
            📍 {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Shop Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Unique Boutique"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Short description of the shop"
          rows={2}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Address
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Street address"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Hours
        </label>
        <input
          type="text"
          name="hours"
          value={formData.hours}
          onChange={handleChange}
          placeholder="e.g., 10am-6pm Daily"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Website
        </label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(910) 555-1234"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={!coordinates}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-300 text-white font-medium py-2 rounded-lg transition-colors text-sm"
        >
          <Save size={16} />
          {shop ? 'Update' : 'Create'}
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="flex-1 flex items-center justify-center gap-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium py-2 rounded-lg transition-colors text-sm"
        >
          <X size={16} />
          Clear
        </button>
      </div>

      {shop && (
        <button
          type="button"
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors text-sm mt-2"
        >
          <Trash2 size={16} />
          Delete Shop
        </button>
      )}
    </form>
  );
}
