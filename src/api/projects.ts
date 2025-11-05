import { supabase } from '../lib/supabase'
import type { Column, Project, Task } from '../types'

export async function getMyProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id,title,description')
    .order('created_at', { ascending: false })
  if (error) throw error
  // RLS ensures only member projects are visible
  return data as Project[]
}

export async function createProject(title: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ title })
    .select('id,title,description')
    .single()
  if (error) throw error
  return data as Project
}

export async function getColumns(projectId: string): Promise<Column[]> {
  const { data, error } = await supabase
    .from('columns')
    .select('id,project_id,title,position')
    .eq('project_id', projectId)
    .order('position', { ascending: true })
  if (error) throw error
  return data as Column[]
}

export async function createColumn(projectId: string, title: string, position: number) {
  const { data, error } = await supabase
    .from('columns')
    .insert({ project_id: projectId, title, position })
    .select('*').single()
  if (error) throw error
  return data as Column
}

export async function updateColumnTitle(id: string, title: string) {
  const { error } = await supabase.from('columns').update({ title }).eq('id', id)
  if (error) throw error
}

export async function deleteColumn(id: string) {
  const { error } = await supabase.from('columns').delete().eq('id', id)
  if (error) throw error
}

export async function getTasks(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id,project_id,column_id,title,description,due_date,position')
    .eq('project_id', projectId)
    .order('position', { ascending: true })
  if (error) throw error
  return data as Task[]
}

export async function createTask(projectId: string, columnId: string | null, title: string, position: number) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ project_id: projectId, column_id: columnId, title, position })
    .select('*').single()
  if (error) throw error
  return data as Task
}

export async function updateTask(taskId: string, patch: Partial<Task>) {
  const { error } = await supabase.from('tasks').update(patch).eq('id', taskId)
  if (error) throw error
}


