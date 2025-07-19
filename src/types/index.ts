export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  coordinates: [number, number]; // [lng, lat]
  address: string;
  hours: string;
  website?: string;
  phone?: string;
  isChamberMember: boolean;
  logo?: string;
  tags: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  coordinates?: [number, number];
  category: string;
  website?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}