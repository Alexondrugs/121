export type RoleInProject = 'admin' | 'manager' | 'executor'

export type Project = {
  id: string
  title: string
  description: string | null
}

export type ProjectMember = {
  project_id: string
  user_id: string
  role: RoleInProject
}

export type Column = {
  id: string
  project_id: string
  title: string
  position: number
}

export type Task = {
  id: string
  project_id: string
  column_id: string | null
  title: string
  description: string | null
  due_date: string | null
  position: number
}


