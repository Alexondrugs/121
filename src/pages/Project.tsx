import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getColumns, getTasks, createColumn, createTask, updateColumnTitle, deleteColumn, updateTask } from '../api/projects'
import { useBoardStore } from '../store/board'
import type { Column, Task } from '../types'
import { Button } from '../components/ui/button'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'

function ColumnView({ column, tasks }: { column: Column, tasks: Task[] }) {
  const [title, setTitle] = useState(column.title)
  const [newTask, setNewTask] = useState('')

  useEffect(() => setTitle(column.title), [column.title])

  return (
    <div className="w-72 shrink-0 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <input className="flex-1 h-9 rounded-md border px-2" value={title} onChange={(e)=>setTitle(e.target.value)} onBlur={()=>{ if (title!==column.title) updateColumnTitle(column.id, title).catch(()=>setTitle(column.title)) }} />
        <Button size="sm" variant="ghost" onClick={()=>deleteColumn(column.id)}>✕</Button>
      </div>
      <SortableContext items={tasks.map(t=>t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[20px]">
          {tasks.map(t => (
            <div key={t.id} id={t.id} className="rounded-md border bg-background p-2 text-sm cursor-grab">
              {t.title}
            </div>
          ))}
        </div>
      </SortableContext>
      <div className="mt-3 flex gap-2">
        <input className="flex-1 h-9 rounded-md border px-2" placeholder="Новая задача" value={newTask} onChange={(e)=>setNewTask(e.target.value)} />
        <Button size="sm" onClick={async ()=>{
          if (!newTask.trim()) return
          const last = tasks.length ? tasks[tasks.length - 1] : null
          await createTask(column.project_id, column.id, newTask.trim(), (last?.position ?? 0) + 1)
          setNewTask('')
        }}>Добавить</Button>
      </div>
    </div>
  )
}

export default function ProjectPage() {
  const { id } = useParams()
  const projectId = id as string
  const { columns, tasks, setColumns, setTasks } = useBoardStore()
  const [loading, setLoading] = useState(true)
  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    if (!projectId) return
    Promise.all([getColumns(projectId), getTasks(projectId)]).then(([cols, ts]) => {
      setColumns(cols)
      setTasks(ts)
    }).finally(() => setLoading(false))
  }, [projectId, setColumns, setTasks])

  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const c of columns) map[c.id] = []
    for (const t of tasks) if (t.column_id) (map[t.column_id] ||= []).push(t)
    for (const list of Object.values(map)) list.sort((a,b)=>a.position-b.position)
    return map
  }, [columns, tasks])

  const onDragEnd = async (e: DragEndEvent) => {
    const activeId = e.active.id as string
    const overId = (e.over?.id as string) || null
    if (!overId || activeId === overId) return
    // Find current column and index
    const allTasks = tasks
    const fromIndex = allTasks.findIndex(t => t.id === activeId)
    const overIndex = allTasks.findIndex(t => t.id === overId)
    if (fromIndex === -1 || overIndex === -1) return
    const from = allTasks[fromIndex]
    const to = allTasks[overIndex]
    const sameColumn = from.column_id === to.column_id
    let updated = [...allTasks]
    if (sameColumn) {
      const list = updated.filter(t => t.column_id === from.column_id)
      const ids = list.map(t=>t.id)
      const newIds = arrayMove(ids, ids.indexOf(from.id), ids.indexOf(to.id))
      // Reassign positions within that column
      let pos = 1
      updated = updated.map(t => {
        if (t.column_id === from.column_id) {
          const idx = newIds.indexOf(t.id)
          return { ...t, position: idx + 1 }
        }
        return t
      })
      setTasks(updated)
      // Persist moved task
      await updateTask(from.id, { position: newIds.indexOf(from.id) + 1 })
    } else {
      // Move to another column, append near target
      const destList = updated.filter(t => t.column_id === to.column_id).sort((a,b)=>a.position-b.position)
      const insertIndex = destList.findIndex(t => t.id === to.id)
      const newPos = insertIndex + 1
      setTasks(updated.map(t => t.id === from.id ? { ...t, column_id: to.column_id, position: newPos } : t))
      await updateTask(from.id, { column_id: to.column_id, position: newPos })
    }
  }

  if (loading) return <div>Загрузка...</div>

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">Проект</div>
        <Button onClick={async ()=>{
          const last = columns.length ? columns[columns.length - 1] : null
          const pos = (last?.position ?? 0) + 1
          await createColumn(projectId, 'Новая колонка', pos)
        }}>Добавить колонку</Button>
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-auto">
          {columns.map((c)=>(
            <ColumnView key={c.id} column={c} tasks={(tasksByColumn[c.id]||[])} />
          ))}
        </div>
      </DndContext>
    </div>
  )
}


