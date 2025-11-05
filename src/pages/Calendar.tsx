import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth()+1, 0) }

export default function CalendarPage() {
  const [date, setDate] = useState(new Date())
  const [tasks, setTasks] = useState<any[]>([])
  const [projectFilter, setProjectFilter] = useState<string>('')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('')
  const [dayTasks, setDayTasks] = useState<any[] | null>(null)

  // Note: This demo fetches all tasks (requires filter in real impl). Here we just show structure
  useEffect(()=>{
    // Simple filter: by project_id and assignee user_id if provided; else all visible
    async function load() {
      let q = supabase.from('tasks').select('id,project_id,title,description,due_date,position')
      if (projectFilter) q = q.eq('project_id', projectFilter)
      if (assigneeFilter) {
        q = q.in('id', supabase.from('task_assignees').select('task_id').eq('user_id', assigneeFilter) as any)
      }
      const { data } = await q.order('due_date', { ascending: true })
      setTasks(data || [])
    }
    load().catch(()=>{})
  }, [projectFilter, assigneeFilter])

  const grid = useMemo(()=>{
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const firstDay = new Date(start)
    firstDay.setDate(firstDay.getDate() - ((firstDay.getDay()+6)%7))
    const weeks: Date[][] = []
    for (let w=0; w<6; w++){
      const row: Date[] = []
      for (let i=0; i<7; i++){
        row.push(new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + w*7 + i))
      }
      weeks.push(row)
    }
    return weeks
  }, [date])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Календарь</h2>
        <div className="flex gap-2">
          <button className="h-9 px-3 rounded border" onClick={()=>setDate(new Date(date.getFullYear(), date.getMonth()-1, 1))}>Назад</button>
          <div className="h-9 px-3 rounded border grid place-items-center">{date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</div>
          <button className="h-9 px-3 rounded border" onClick={()=>setDate(new Date(date.getFullYear(), date.getMonth()+1, 1))}>Вперёд</button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input className="h-9 rounded border px-2" placeholder="Фильтр по проекту (uuid)" value={projectFilter} onChange={(e)=>setProjectFilter(e.target.value)} />
        <input className="h-9 rounded border px-2" placeholder="Фильтр по исполнителю (uuid)" value={assigneeFilter} onChange={(e)=>setAssigneeFilter(e.target.value)} />
      </div>
      <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden border">
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d)=>(<div key={d} className="bg-card p-2 text-sm font-medium border-b">{d}</div>))}
        {grid.flat().map((d, idx)=>{
          const isCurr = d.getMonth() === date.getMonth()
          const dayStr = d.toISOString().slice(0,10)
          const items = tasks.filter(t => t.due_date && t.due_date.slice(0,10) === dayStr)
          return (
            <button key={idx} className={`min-h-[90px] p-2 bg-card text-left ${isCurr? '':'opacity-50'}`} onClick={()=> setDayTasks(items)}>
              <div className="text-xs text-muted-foreground">{d.getDate()}</div>
              <ul className="mt-1 space-y-1">
                {items.slice(0,3).map(t => (<li key={t.id} className="text-xs truncate">• {t.title}</li>))}
                {items.length>3 && <li className="text-xs text-muted-foreground">+{items.length-3} ещё</li>}
              </ul>
            </button>
          )
        })}
      </div>
      {dayTasks && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setDayTasks(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-lg bg-card p-4 shadow">
            <div className="font-semibold mb-2">Задачи</div>
            {dayTasks.length === 0 ? <div className="text-sm text-muted-foreground">Нет задач</div> : (
              <ul className="space-y-2">
                {dayTasks.map(t => (<li key={t.id} className="text-sm">{t.title}</li>))}
              </ul>
            )}
            <div className="mt-3 text-right">
              <button className="h-9 px-3 rounded bg-secondary" onClick={()=>setDayTasks(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


