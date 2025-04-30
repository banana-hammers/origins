// filepath: /Users/ryaneves/code-projects/origins/src/lib/materialMapping.ts
import { supabase } from './supabaseClient';
import { generateEmbedding } from './openaiService';

/**
 * Maps a description to a material in the database using keyword matching and vector similarity
 * @param description The material description to map
 * @returns Object containing success status, mapped material data, and the matching method used
 */
export async function mapItemToMaterial(description: string) {
  // First try exact keyword matching
  const { data: exactMatches, error: keywordError } = await supabase
    .from('materials_demo')
    .select('id, sku, description, price, unit')
    .ilike('description', `%${description}%`)
    .limit(1);

  if (keywordError) {
    return {
      success: false,
      error: keywordError.message,
    };
  }

  if (exactMatches && exactMatches.length > 0) {
    return {
      success: true,
      data: exactMatches[0],
      method: 'keyword',
      confidence: 1.0,
    };
  }

  // If no exact match, try vector similarity
  const embeddingResult = await generateEmbedding(description);
  
  if (!embeddingResult.success) {
    return {
      success: false,
      error: 'Failed to generate embedding',
    };
  }

  const { data: vectorMatches, error: vectorError } = await supabase.rpc('match_materials', {
    query_embedding: embeddingResult.data,
    similarity_threshold: 0.85,
    match_count: 1,
  });

  if (vectorError) {
    return {
      success: false,
      error: vectorError.message,
    };
  }

  if (vectorMatches && vectorMatches.length > 0) {
    return {
      success: true,
      data: vectorMatches[0],
      method: 'vector',
      confidence: vectorMatches[0].similarity,
    };
  }

  return {
    success: false,
    error: 'No matching material found',
  };
}

/**
 * Batch maps multiple items to materials
 * @param items Array of item descriptions to map
 * @returns Array of mapping results with original descriptions
 */
export async function batchMapItems(items: { description: string; quantity?: number }[]) {
  const results = await Promise.all(
    items.map(async (item) => {
      const result = await mapItemToMaterial(item.description);
      return {
        originalDescription: item.description,
        quantity: item.quantity || 1,
        ...result,
      };
    })
  );

  return results;
}