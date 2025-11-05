import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getColumns, getTasks, createColumn, createTask, updateColumnTitle, deleteColumn, updateTask } from '../api/projects'
import { useBoardStore } from '../store/board'
import type { Column, Task } from '../types'
import { Button } from '../components/ui/button'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { subscribeTable } from '../api/realtime'
import { Tabs } from '../components/ui/tabs'
import { listMessages, sendMessage } from '../api/chat'
import { TaskModal } from '../components/task/TaskModal'

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
            <div key={t.id} id={t.id} className="rounded-md border bg-background p-2 text-sm cursor-grab" onClick={()=> (window as any).openTask?.(t)}>
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
    const unsubCols = subscribeTable('columns', `project_id=eq.${projectId}`, async ()=>{
      const cols = await getColumns(projectId)
      setColumns(cols)
    })
    const unsubTasks = subscribeTable('tasks', `project_id=eq.${projectId}`, async ()=>{
      const ts = await getTasks(projectId)
      setTasks(ts)
    })
    return () => { unsubCols(); unsubTasks() }
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

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  ;(window as any).openTask = (t: Task) => setActiveTask(t)

  const [chat, setChat] = useState<any[]>([])
  const [chatText, setChatText] = useState('')
  useEffect(()=>{
    if (!projectId) return
    listMessages(projectId).then(setChat)
    const unsub = subscribeTable('project_messages', `project_id=eq.${projectId}`, async ()=>{
      const msgs = await listMessages(projectId)
      setChat(msgs)
    })
    return () => unsub()
  }, [projectId])

  return (
    <div className="space-y-3">
      <Tabs
        tabs={[
          {
            value: 'board',
            label: 'Доска',
            content: (
              <div>
                <div className="flex items-center justify-between mb-3">
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
          },
          {
            value: 'chat',
            label: 'Чат',
            content: (
              <div className="space-y-2">
                <div className="h-80 overflow-auto rounded border p-2 bg-card">
                  {chat.map((m:any)=> (
                    <div key={m.id} className="text-sm mb-1"><span className="text-muted-foreground">{new Date(m.created_at).toLocaleTimeString()}:</span> {m.content}</div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="flex-1 h-10 rounded-md border px-3" value={chatText} onChange={(e)=>setChatText(e.target.value)} placeholder="Сообщение" />
                  <Button onClick={async ()=>{
                    if (!chatText.trim()) return
                    await sendMessage(projectId, chatText.trim())
                    setChatText('')
                  }}>Отправить</Button>
                </div>
              </div>
            )
          }
        ]}
      />

      {activeTask && (
        <TaskModal open={!!activeTask} onOpenChange={(o)=>{ if (!o) setActiveTask(null) }} taskId={activeTask.id} title={activeTask.title} />
      )}
    </div>
  )
}


