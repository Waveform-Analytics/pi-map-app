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
          {business.isChamberMember && (
            <span className="inline-block bg-gradient-to-r from-rose-400 to-rose-500 text-white text-xs px-3 py-1.5 rounded-full mb-3 shadow-sm font-medium">
              Chamber Member
            </span>
          )}
        </div>
      </div>

      <p className="text-stone-600 text-sm mb-4 line-clamp-2 leading-relaxed">{business.description}</p>

      <div className="space-y-3 text-sm text-stone-500">
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 flex-shrink-0 text-sky-500" />
          <span className="truncate">{business.address}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 flex-shrink-0 text-emerald-500" />
          <span>{business.hours}</span>
        </div>

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

      {business.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {business.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="bg-stone-100 text-stone-600 text-xs px-3 py-1.5 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
          {business.tags.length > 3 && (
            <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-medium">
              +{business.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}