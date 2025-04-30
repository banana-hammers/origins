import { supabase } from './supabaseClient';

interface EstimateItem {
  material_id?: string | null;
  description: string;
  quantity?: number;
  unit?: string;
  material_price?: number;
  labor_price?: number;
  confidence?: number;
}

/**
 * Creates a new estimate with the provided items
 * @param projectId The project ID to create the estimate for (optional)
 * @param userId The user ID creating the estimate
 * @param items Array of items to add to the estimate
 * @returns The ID of the created estimate
 */
export async function createEstimate(projectId: string | null, userId: string, items: EstimateItem[]) {
  // Calculate totals
  const totalMaterial = items.reduce(
    (sum, item) => sum + (item.material_price || 0) * (item.quantity || 1),
    0
  );
  const totalLabor = items.reduce(
    (sum, item) => sum + (item.labor_price || 0) * (item.quantity || 1),
    0
  );

  // Create estimate record
  const { data: estimate, error: estimateError } = await supabase
    .from('project_estimate_options')
    .insert({
      project_id: projectId, // This can be null
      created_by: userId,
      is_draft: true,
      total_material: totalMaterial,
      total_labor: totalLabor,
    })
    .select()
    .single();

  if (estimateError) throw estimateError;

  // Create estimate items
  const estimateItems = items.map((item, index) => ({
    estimate_id: estimate.id,
    material_id: item.material_id,
    description: item.description,
    quantity: item.quantity || 1,
    unit: item.unit,
    material_price: item.material_price || 0,
    labor_price: item.labor_price || 0,
    confidence: item.confidence || 1.0,
    sort_order: index,
  }));

  const { error: itemsError } = await supabase
    .from('project_estimate_items')
    .insert(estimateItems);

  if (itemsError) throw itemsError;

  return estimate.id;
}

/**
 * Updates an existing estimate with new details
 * @param estimateId The ID of the estimate to update
 * @param updates The updated estimate data
 */
export async function updateEstimate(estimateId: string, updates: Partial<{
  name: string;
  description: string;
  is_draft: boolean;
  total_material: number;
  total_labor: number;
}>) {
  const { error } = await supabase
    .from('project_estimate_options')
    .update(updates)
    .eq('id', estimateId);

  if (error) throw error;
}

/**
 * Updates an estimate item
 * @param itemId The ID of the item to update
 * @param updates The updated item data
 */
export async function updateEstimateItem(itemId: string, updates: Partial<{
  description: string;
  quantity: number;
  unit: string;
  material_price: number;
  labor_price: number;
}>) {
  const { error } = await supabase
    .from('project_estimate_items')
    .update(updates)
    .eq('id', itemId);

  if (error) throw error;
}

/**
 * Gets an estimate and its items
 * @param estimateId The ID of the estimate to retrieve
 * @returns The estimate and its items
 */
export async function getEstimate(estimateId: string) {
  const { data: estimate, error: estimateError } = await supabase
    .from('project_estimate_options')
    .select('*')
    .eq('id', estimateId)
    .single();

  if (estimateError) throw estimateError;

  const { data: items, error: itemsError } = await supabase
    .from('project_estimate_items')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('sort_order', { ascending: true });

  if (itemsError) throw itemsError;

  return {
    ...estimate,
    items: items || [],
  };
}

/**
 * Deletes an estimate and all its items
 * @param estimateId The ID of the estimate to delete
 */
export async function deleteEstimate(estimateId: string) {
  // Items will be cascade deleted due to foreign key constraint
  const { error } = await supabase
    .from('project_estimate_options')
    .delete()
    .eq('id', estimateId);

  if (error) throw error;
}

/**
 * Finalizes an estimate, marking it as no longer a draft
 * @param estimateId The ID of the estimate to finalize
 */
export async function finalizeEstimate(estimateId: string) {
  const { error } = await supabase
    .from('project_estimate_options')
    .update({ is_draft: false, updated_at: new Date().toISOString() })
    .eq('id', estimateId);

  if (error) throw error;
}