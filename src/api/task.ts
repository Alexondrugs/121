import { supabase } from '../lib/supabase'

export async function listComments(taskId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('id,task_id,author_id,content,created_at')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addComment(taskId: string, content: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ task_id: taskId, content })
    .select('*').single()
  if (error) throw error
  return data
}

export async function listChecklist(taskId: string) {
  const { data, error } = await supabase
    .from('task_checklist_items')
    .select('id,task_id,title,completed,position')
    .eq('task_id', taskId)
    .order('position', { ascending: true })
  if (error) throw error
  return data
}

export async function toggleChecklist(id: string, completed: boolean) {
  const { error } = await supabase
    .from('task_checklist_items')
    .update({ completed })
    .eq('id', id)
  if (error) throw error
}

export async function upsertChecklist(taskId: string, id: string | null, title: string, position: number) {
  if (id) {
    const { error } = await supabase.from('task_checklist_items').update({ title, position }).eq('id', id)
    if (error) throw error
    return { id }
  }
  const { data, error } = await supabase
    .from('task_checklist_items')
    .insert({ task_id: taskId, title, position })
    .select('id').single()
  if (error) throw error
  return data
}

export async function uploadAttachment(taskId: string, file: File) {
  const path = `${taskId}/${Date.now()}_${file.name}`
  const { error } = await supabase.storage.from('attachments').upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = await supabase.storage.from('attachments').createSignedUrl(path, 60 * 60)
  return data?.signedUrl as string
}


