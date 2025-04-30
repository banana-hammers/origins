// filepath: /Users/ryaneves/code-projects/origins/scripts/seed-materials.js
/**
 * Seed script for the materials_demo table
 * 
 * This script is meant to be run manually with the Supabase CLI:
 * supabase functions serve seed-materials
 * 
 * Or deployed as an Edge Function and run once:
 * supabase functions deploy seed-materials
 */

// Example materials data for roofing contractors
const materials = [
  {
    sku: 'SHG-ARB-30',
    description: 'Architectural Shingles - Autumn Brown (30 yr)',
    category: 'Shingles',
    price: 89.75,
    unit: 'SQUARE',
  },
  {
    sku: 'SHG-DSG-30',
    description: 'Designer Shingles - Slate Gray (30 yr)',
    category: 'Shingles',
    price: 102.50,
    unit: 'SQUARE',
  },
  {
    sku: 'SHG-WTR-LTM',
    description: 'Weather-Tek Ridge Shingles - Lifetime',
    category: 'Shingles',
    price: 45.25,
    unit: 'BUNDLE',
  },
  {
    sku: 'UND-SYN-15',
    description: 'Synthetic Underlayment (15 lb)',
    category: 'Underlayment',
    price: 79.95,
    unit: 'ROLL',
  },
  {
    sku: 'UND-FLT-30',
    description: 'Felt Underlayment (30 lb)',
    category: 'Underlayment',
    price: 28.50,
    unit: 'ROLL',
  },
  {
    sku: 'FLS-ALM-8IN',
    description: 'Aluminum Step Flashing (8 inch)',
    category: 'Flashing',
    price: 3.25,
    unit: 'EACH',
  },
  {
    sku: 'FLS-GAL-24',
    description: 'Galvanized Valley Flashing (24 inch)',
    category: 'Flashing',
    price: 18.75,
    unit: 'LINEAR_FT',
  },
  {
    sku: 'FLS-DRP-10',
    description: 'Drip Edge Flashing (10 ft)',
    category: 'Flashing',
    price: 12.99,
    unit: 'PIECE',
  },
  {
    sku: 'VNT-RDG-4FT',
    description: 'Ridge Vent (4 ft sections)',
    category: 'Ventilation',
    price: 15.50,
    unit: 'PIECE',
  },
  {
    sku: 'VNT-SFT-16',
    description: 'Soffit Vents (16 x 8 inch)',
    category: 'Ventilation',
    price: 9.99,
    unit: 'EACH',
  },
  {
    sku: 'ICE-WAT-3FT',
    description: 'Ice and Water Shield (3 ft x 33.3 ft)',
    category: 'Waterproofing',
    price: 69.95,
    unit: 'ROLL',
  },
  {
    sku: 'FAS-ROF-1.5',
    description: 'Roofing Nails (1.5 inch galvanized)',
    category: 'Fasteners',
    price: 28.50,
    unit: 'BOX',
  },
  {
    sku: 'FAS-ROF-2',
    description: 'Roofing Nails (2 inch galvanized)',
    category: 'Fasteners',
    price: 32.75,
    unit: 'BOX',
  },
  {
    sku: 'CEM-PLT-GAL',
    description: 'Plastic Roof Cement (1 gallon)',
    category: 'Adhesives',
    price: 14.95,
    unit: 'GALLON',
  },
  {
    sku: 'CEM-ROF-10',
    description: 'Roofing Cement (10 oz. tube)',
    category: 'Adhesives',
    price: 5.99,
    unit: 'EACH',
  },
  {
    sku: 'TRP-BLU-20',
    description: 'Blue Tarp (20 ft x 20 ft)',
    category: 'Protection',
    price: 24.99,
    unit: 'EACH',
  },
  {
    sku: 'WP-DECK-4X8',
    description: 'Exterior Plywood Decking (4x8 ft, 5/8 inch)',
    category: 'Wood Products',
    price: 42.50,
    unit: 'SHEET',
  },
  {
    sku: 'SFS-4X4-PT',
    description: 'Pressure Treated 4x4 (8 ft)',
    category: 'Wood Products',
    price: 18.99,
    unit: 'EACH',
  },
  {
    sku: 'SFS-2X4-PT',
    description: 'Pressure Treated 2x4 (8 ft)',
    category: 'Wood Products',
    price: 8.75,
    unit: 'EACH',
  },
  {
    sku: 'GPT-5GAL-WHT',
    description: 'Gutter Paint (5 gallon, White)',
    category: 'Paint',
    price: 89.95,
    unit: 'BUCKET',
  },
];

/**
 * Creates the vector embedding for material descriptions
 * Note: This is a placeholder that would call OpenAI in a real implementation
 */
function createFakeEmbedding(text) {
  // In reality, this would call the OpenAI API to get real embeddings
  const hash = Array.from(text).reduce((acc, char) => {
    return (acc << 5) - acc + char.charCodeAt(0) >>> 0;
  }, 0);
  
  // Generate a deterministic but random-looking embedding
  const embedding = [];
  let value = hash;
  for (let i = 0; i < 1536; i++) {
    value = (value * 1664525 + 1013904223) % 4294967296;
    embedding.push((value / 4294967296) * 2 - 1); // Range between -1 and 1
  }
  
  return embedding;
}

/**
 * Main seed function
 */
async function seedMaterials(client) {
  console.log('Starting to seed materials_demo table...');
  
  // Check if materials table is empty
  const { count, error: countError } = await client
    .from('materials_demo')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    throw new Error(`Failed to check materials table: ${countError.message}`);
  }
  
  if (count > 0) {
    console.log(`Materials table already has ${count} items. Skipping seeding.`);
    return { skipped: true, count };
  }
  
  console.log(`Adding ${materials.length} materials to database...`);
  
  // Prepare materials with embeddings
  const materialsWithEmbeddings = materials.map(material => ({
    ...material,
    embedding: createFakeEmbedding(material.description),
  }));
  
  // Insert materials in chunks to avoid request size limits
  const chunkSize = 5;
  for (let i = 0; i < materialsWithEmbeddings.length; i += chunkSize) {
    const chunk = materialsWithEmbeddings.slice(i, i + chunkSize);
    const { error } = await client
      .from('materials_demo')
      .insert(chunk);
    
    if (error) {
      throw new Error(`Failed to insert materials (chunk ${i}): ${error.message}`);
    }
    
    console.log(`Inserted chunk ${i / chunkSize + 1}/${Math.ceil(materialsWithEmbeddings.length / chunkSize)}`);
  }
  
  console.log('Successfully seeded materials_demo table.');
  return { success: true, count: materials.length };
}

// Example usage for direct execution:
// seedMaterials(supabase).then(console.log).catch(console.error);

export { seedMaterials };