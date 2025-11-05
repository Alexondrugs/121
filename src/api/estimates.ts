import { supabase } from '../lib/supabase'

export async function listEstimates(projectId: string) {
  const { data, error } = await supabase
    .from('estimates')
    .select('id, project_id, title, total, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createEstimate(projectId: string, title: string) {
  const { data, error } = await supabase
    .from('estimates')
    .insert({ project_id: projectId, title })
    .select('*').single()
  if (error) throw error
  return data
}

export async function deleteEstimate(id: string) {
  const { error } = await supabase.from('estimates').delete().eq('id', id)
  if (error) throw error
}

export async function listEstimateItems(estimateId: string) {
  const { data, error } = await supabase
    .from('estimate_items')
    .select('id, estimate_id, title, qty, price, position')
    .eq('estimate_id', estimateId)
    .order('position', { ascending: true })
  if (error) throw error
  return data
}

export async function upsertEstimateItem(estimateId: string, row: { id?: string; title: string; qty: number; price: number; position: number }) {
  if (row.id) {
    const { error } = await supabase
      .from('estimate_items')
      .update({ title: row.title, qty: row.qty, price: row.price, position: row.position })
      .eq('id', row.id)
    if (error) throw error
    return row
  }
  const { data, error } = await supabase
    .from('estimate_items')
    .insert({ estimate_id: estimateId, title: row.title, qty: row.qty, price: row.price, position: row.position })
    .select('*').single()
  if (error) throw error
  return data
}

export async function exportEstimate(estimateId: string) {
  const url = `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/export-estimate`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ estimate_id: estimateId })
  })
  if (!res.ok) throw new Error('Export failed')
  return res.json()
}


