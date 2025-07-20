# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Pleasure Island map app

The Pleasure Island Chamber of Commerce wants to build a web application centered around a digital map of Pleasure Island, NC (near Wilmington NC). The vision is to create a beautiful, user-friendly, and community-centered web app that showcases Chamber member businesses, local events, and points of interest in a way that is more curated, welcoming, and locally flavored than Google or Apple Maps.

I want visitors to feel like they've met a friendly and super knowledgeable local who is giving them tips on things to do and where to go, etc. 

## Core Features

### Interactive map
- Use mapbox, leave the door open to later adding custom map tiles via mapbox studio but start with one of the available defaults
- Filterable layers or icons by category (e.g., beach, boardwalk, coffee, retail, gas, events)
- Mobile friendly: pinch to zoom, "you are here" dot via GPS
- Clickable pins that show business name, description, logo, hours, and any website or social links

### Business Directory
- Search and filter by category, tags, and open hours
- Featured Chamber members appear first or with a badge
- Nice card layout: logo/image, short bio, website button, location link (though I'm not sure how to ensure this plays nice with the main map - do we link to the map for example? Does this sort of overlap with the interactive map features above?)

### Events and highlights
- Carousel or list of upcoming events - not sure where this would fit best. is it its own specific page? Does it come up first or do we have a link to it from the map page? 
- Seasonal features like "Fall spotlights" or "Restaurant week", etc
- Optional calendar view or daily/weekly highlights

### "Local flavor" additions (just a few suggestions)
- Custom map tiles (eventually), icons, and branding for a warm and welcoming feel
- "photo of the week" or "meet a local" blurbs
- History of our town(s)
- Could link to it via QR codes around town

## Technology Stack

### Frontend
- **Next.js 15** with React + TypeScript - Full-stack framework with excellent Vercel integration
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Mapbox GL JS** - Interactive maps with custom styling capabilities
- **Lucide React** - Beautiful, customizable icons

### Backend & Data
- **Static JSON files** initially (in `/data` folder)
- **Supabase** for future database needs (PostgreSQL with real-time features)
- **Vercel Functions** for any API endpoints when needed

### Development Tools
- **ESLint + Prettier** - Code formatting and linting
- **TypeScript** - Type safety
- **Vercel** - Deployment and hosting

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
│   ├── map/            # Map-related components
│   ├── business/       # Business directory components
│   └── ui/             # Generic UI components
├── data/               # Static JSON data files
│   ├── businesses.json
│   ├── events.json
│   └── categories.json
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## Mapbox Integration

- Get API key from Mapbox and add to `.env.local` as `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- Use `mapbox-gl` for map rendering
- Consider Mapbox Studio for custom map styles later
- Default map center: Carolina Beach/Pleasure Island, NC coordinates (includes Carolina Beach, Kure Beach, and Fort Fisher area)

## Data Structure

### Business Data Format
```typescript
interface Business {
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
```

## Current Status

### ✅ MVP Complete
The proof-of-concept MVP is built and functional! The app runs on **port 3001** (http://localhost:3001) to avoid conflicts with other development projects.

### What's Working
- **Unified Map & Directory View** - Map and business directory displayed side-by-side with shared filters
- **Interactive Mapbox map** centered on Pleasure Island (Carolina Beach, Kure Beach, Fort Fisher)
- **Business markers** with detailed popups showing hours, contact info, and descriptions
  - Only one popup open at a time
  - Click outside to close popups
  - Pink markers for Chamber members, blue for others
- **Business directory** integrated on same page as map
- **Unified filtering system** that controls both map markers and directory listings:
  - Search by business name or description
  - Filter by category
  - Chamber members only toggle
  - Live result count
- **Responsive layout** - Stacked on mobile, side-by-side on desktop
- **Sample data** includes real Pleasure Island businesses:
  - Britt's Donut Shop (Carolina Beach institution since 1939)
  - NC Aquarium at Fort Fisher
  - SeaWitch Cafe & Tiki Bar (Kure Beach)
  - Carolina Beach State Park
  - And more authentic local spots

### Next Development Priorities
1. **Visual improvements** - Current functionality works but needs styling polish
2. **Events system** - Add events data structure and display
3. **Enhanced filtering** - Add more filter options (open now, distance, etc.)
4. **Mobile optimization** - Improve responsive design and touch interactions
5. **Custom map styling** - Eventually move to custom Mapbox tiles for local branding

### Development Notes
- App configured for port 3001 to avoid port conflicts
- Mapbox token configured in `.env.local`
- Uses actual Pleasure Island business data and coordinates
- Ready for Vercel deployment when needed

### ⚠️ Important Technical Notes

#### Mapbox Coordinate Issue Resolution
**CRITICAL:** When creating Mapbox markers, coordinates must be passed directly as `business.coordinates` array to the `.setLngLat()` method. 

❌ **DO NOT** create new arrays or use Number() conversions:
```javascript
// This causes marker sliding/projection issues:
const coords = [Number(business.coordinates[0]), Number(business.coordinates[1])];
marker.setLngLat(coords);
```

✅ **Correct approach:**
```javascript
// Use coordinates directly from JSON:
marker.setLngLat(business.coordinates);
```

This issue manifested as markers appearing in wrong locations and "sliding" during zoom operations. The root cause was that creating new coordinate arrays (even with identical values) breaks Mapbox's internal coordinate handling. 

## Project Memory Notes

- Keep the CLAUDE.md file up to date with the progress of the project, including if things change.