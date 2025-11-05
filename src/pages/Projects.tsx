import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { getMyProjects, createProject } from '../api/projects'
import type { Project } from '../types'
import { useNavigate } from 'react-router-dom'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getMyProjects().then(setProjects).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Проекты</h2>
      <Card>
        <CardHeader>
          <div className="font-medium">Мои проекты</div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Загрузка...</div>
          ) : (
            <div className="space-y-2">
              {projects.length === 0 && (
                <div className="text-sm text-muted-foreground">Пока нет проектов.</div>
              )}
              <ul className="divide-y">
                {projects.map((p) => (
                  <li key={p.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      {p.description && <div className="text-sm text-muted-foreground">{p.description}</div>}
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/projects/${p.id}`)}>Открыть</Button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-3">
                <input className="flex-1 h-10 rounded-md border px-3" placeholder="Название проекта" value={title} onChange={(e)=>setTitle(e.target.value)} />
                <Button onClick={async ()=>{
                  if (!title.trim()) return
                  const p = await createProject(title.trim())
                  setProjects([p, ...projects])
                  setTitle('')
                }}>Создать</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


