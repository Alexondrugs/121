import { supabase } from '../lib/supabase'

export async function listMessages(projectId: string) {
  const { data, error } = await supabase
    .from('project_messages')
    .select('id,project_id,author_id,content,created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function sendMessage(projectId: string, content: string) {
  const { data, error } = await supabase
    .from('project_messages')
    .insert({ project_id: projectId, content })
    .select('*').single()
  if (error) throw error
  return data
}


