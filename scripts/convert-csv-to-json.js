const fs = require('fs');
const path = require('path');

// Helper function to categorize businesses based on name and description
function categorizeBusinesses(name, description) {
  const nameLC = name.toLowerCase();
  const descLC = description.toLowerCase();
  
  // Coffee shops and cafes
  if (nameLC.includes('coffee') || nameLC.includes('cafe') || 
      descLC.includes('coffee') || nameLC.includes('grind')) {
    return 'coffee';
  }
  
  // Bars and breweries
  if (nameLC.includes('bar') || nameLC.includes('brewery') || nameLC.includes('distillery') || 
      nameLC.includes('beverage') || descLC.includes('beer') || descLC.includes('wine') || 
      descLC.includes('cocktails') || descLC.includes('tiki')) {
    return 'bar';
  }
  
  // Dessert and sweets
  if (nameLC.includes('fudge') || nameLC.includes('cobbler') || nameLC.includes('pancake') ||
      descLC.includes('fudge') || descLC.includes('ice cream') || descLC.includes('dessert')) {
    return 'dessert';
  }
  
  // Attractions and entertainment
  if (nameLC.includes('pier') || descLC.includes('pier') || descLC.includes('attraction')) {
    return 'attraction';
  }
  
  // Everything else is restaurant
  return 'restaurant';
}

// Helper function to generate tags based on business info
function generateTags(name, description, category) {
  const tags = [];
  const nameLC = name.toLowerCase();
  const descLC = description.toLowerCase();
  
  // Add category as first tag
  tags.push(category);
  
  // Food type tags
  if (descLC.includes('seafood')) tags.push('seafood');
  if (descLC.includes('steaks') || descLC.includes('steak')) tags.push('steaks');
  if (descLC.includes('italian')) tags.push('italian');
  if (descLC.includes('asian') || descLC.includes('sushi') || descLC.includes('hibachi')) tags.push('asian');
  if (descLC.includes('taco') || descLC.includes('mexican')) tags.push('mexican');
  if (descLC.includes('bbq') || descLC.includes('smokehouse')) tags.push('bbq');
  if (descLC.includes('pizza')) tags.push('pizza');
  if (descLC.includes('wings')) tags.push('wings');
  if (descLC.includes('oysters')) tags.push('oysters');
  
  // Atmosphere tags
  if (descLC.includes('waterfront') || descLC.includes('ocean') || descLC.includes('harbor')) tags.push('waterfront');
  if (descLC.includes('boardwalk')) tags.push('boardwalk');
  if (descLC.includes('casual')) tags.push('casual');
  if (descLC.includes('fine') || descLC.includes('polished')) tags.push('fine-dining');
  if (descLC.includes('family')) tags.push('family-friendly');
  if (descLC.includes('live music')) tags.push('live-music');
  if (descLC.includes('craft')) tags.push('craft');
  if (descLC.includes('local')) tags.push('local');
  if (descLC.includes('fresh')) tags.push('fresh');
  if (descLC.includes('homemade')) tags.push('homemade');
  
  // Location tags
  if (descLC.includes('carolina beach') || nameLC.includes('cb')) tags.push('carolina-beach');
  if (descLC.includes('kure beach')) tags.push('kure-beach');
  
  // Remove duplicates and limit to 6 tags
  return [...new Set(tags)].slice(0, 6);
}

// Helper function to generate business hours (placeholder since not in CSV)
function generateHours(category) {
  switch (category) {
    case 'coffee':
      return 'Daily: 6am-6pm';
    case 'bar':
      return 'Daily: 4pm-2am';
    case 'dessert':
      return 'Daily: 11am-10pm';
    case 'attraction':
      return 'Daily: 8am-8pm';
    default:
      return 'Daily: 11am-10pm';
  }
}

// Read and parse CSV file
function parseCSV() {
  const csvPath = path.join(__dirname, '../src/data/resto-tour-db.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  const businesses = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    // Parse CSV line properly handling quoted values
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    // Skip empty lines
    if (values.length < headers.length || !values[0]) continue;
    
    const name = values[0];
    const address = values[1];
    const url = values[2];
    const latitude = Math.round(parseFloat(values[4]) * 1000000) / 1000000; // Round to 6 decimal places
    const longitude = Math.round(parseFloat(values[5]) * 1000000) / 1000000; // Round to 6 decimal places
    const description = values[6] || '';
    const phone = values[7] || '';
    
    // Skip if missing critical data
    if (!name || !latitude || !longitude) continue;
    
    const category = categorizeBusinesses(name, description);
    const tags = generateTags(name, description, category);
    
    // Debug specific coordinates that are problematic
    if (name === 'Carolina Beach Pier') {
      console.log(`DEBUG ${name}: CSV lat=${latitude}, lng=${longitude}`);
      console.log(`DEBUG ${name}: Final coords=[${longitude}, ${latitude}]`);
    }

    const business = {
      id: (i).toString(),
      name: name,
      category: category,
      description: description,
      coordinates: [longitude, latitude], // [lng, lat] format for Mapbox
      address: address + ', Carolina Beach, NC 28428',
      hours: generateHours(category),
      website: url && url !== 'https://www.facebook.com/' ? url : undefined,
      phone: phone || undefined,
      isChamberMember: true, // All businesses in this CSV are Chamber members
      tags: tags
    };
    
    businesses.push(business);
  }
  
  return businesses;
}

// Convert and save
try {
  console.log('Converting CSV to JSON...');
  const businesses = parseCSV();
  
  console.log(`Found ${businesses.length} businesses`);
  
  // Save to businesses.json
  const outputPath = path.join(__dirname, '../src/data/businesses.json');
  fs.writeFileSync(outputPath, JSON.stringify(businesses, null, 2));
  
  console.log(`✅ Successfully converted and saved ${businesses.length} businesses to ${outputPath}`);
  
  // Show sample of converted data
  console.log('\nSample converted business:');
  console.log(JSON.stringify(businesses[0], null, 2));
  
  // Show category breakdown
  const categoryCount = {};
  businesses.forEach(b => {
    categoryCount[b.category] = (categoryCount[b.category] || 0) + 1;
  });
  
  console.log('\nCategory breakdown:');
  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });
  
} catch (error) {
  console.error('Error converting CSV:', error);
}