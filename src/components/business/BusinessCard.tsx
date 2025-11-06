import { Business } from '@/types';
import { ExternalLink, Phone, Clock, MapPin } from 'lucide-react';

interface BusinessCardProps {
  business: Business;
  onClick?: () => void;
}

export default function BusinessCard({ business, onClick }: BusinessCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg shadow-stone-200/50 hover:shadow-xl hover:shadow-stone-300/50 transition-all duration-200 p-6 cursor-pointer border border-stone-200/50 hover:border-sky-200 transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-poppins font-bold text-xl text-stone-700 mb-2">{business.name}</h3>
        </div>
      </div>

      <p className="text-stone-600 text-sm mb-4 line-clamp-2 leading-relaxed">{business.description}</p>

      <div className="space-y-3 text-sm text-stone-500">
        {business.address && (
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 flex-shrink-0 text-sky-500" />
            <span className="truncate">{business.address}</span>
          </div>
        )}
        
        {business.hours && (
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 flex-shrink-0 text-emerald-500" />
            <span>{business.hours}</span>
          </div>
        )}

        {business.phone && (
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 flex-shrink-0 text-sky-500" />
            <a 
              href={`tel:${business.phone}`} 
              className="text-sky-600 hover:text-sky-700 hover:underline transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {business.phone}
            </a>
          </div>
        )}

        {business.website && (
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 flex-shrink-0 text-sky-500" />
            <a 
              href={business.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sky-600 hover:text-sky-700 hover:underline truncate transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Visit Website
            </a>
          </div>
        )}
      </div>

    </div>
  );
}