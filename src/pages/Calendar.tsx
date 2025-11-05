import { useEffect, useMemo, useState } from 'react'
import { getTasks } from '../api/projects'

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth()+1, 0) }

export default function CalendarPage() {
  const [date, setDate] = useState(new Date())
  const [tasks, setTasks] = useState<any[]>([])

  // Note: This demo fetches all tasks (requires filter in real impl). Here we just show structure
  useEffect(()=>{
    // In real app, filter by current user's projects
    // Placeholder: no project filter; will show nothing without data due to RLS
    getTasks('00000000-0000-0000-0000-000000000000').catch(()=>{})
  },[])

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
      <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden border">
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d)=>(<div key={d} className="bg-card p-2 text-sm font-medium border-b">{d}</div>))}
        {grid.flat().map((d, idx)=>{
          const isCurr = d.getMonth() === date.getMonth()
          return (
            <div key={idx} className={`min-h-[90px] p-2 bg-card ${isCurr? '':'opacity-50'}`}>
              <div className="text-xs text-muted-foreground">{d.getDate()}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


