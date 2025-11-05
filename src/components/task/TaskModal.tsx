import { useEffect, useState } from 'react'
import { Dialog, DialogFooter, DialogHeader } from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { addComment, listChecklist, listComments, toggleChecklist, upsertChecklist, uploadAttachment } from '../../api/task'

export function TaskModal({ open, onOpenChange, taskId, title }: { open: boolean, onOpenChange: (o:boolean)=>void, taskId: string, title: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [checklist, setChecklist] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [newItem, setNewItem] = useState('')

  useEffect(() => {
    if (!open) return
    listComments(taskId).then(setComments)
    listChecklist(taskId).then(setChecklist)
  }, [open, taskId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>{title}</DialogHeader>
      <div className="space-y-4">
        <div>
          <div className="font-medium mb-1">Чек‑лист</div>
          <ul className="space-y-1">
            {checklist.map((i)=> (
              <li key={i.id} className="flex items-center gap-2">
                <input type="checkbox" checked={!!i.completed} onChange={async (e)=>{
                  await toggleChecklist(i.id, e.target.checked)
                  setChecklist(checklist.map(x=>x.id===i.id?{...x, completed: e.target.checked}:x))
                }} />
                <input className="flex-1 h-8 rounded border px-2" value={i.title} onChange={(e)=>{
                  const v = e.target.value
                  setChecklist(checklist.map(x=>x.id===i.id?{...x, title:v}:x))
                }} onBlur={async (e)=>{
                  await upsertChecklist(taskId, i.id, e.target.value, i.position)
                }} />
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mt-2">
            <input className="flex-1 h-8 rounded border px-2" placeholder="Новый пункт" value={newItem} onChange={(e)=>setNewItem(e.target.value)} />
            <Button size="sm" onClick={async ()=>{
              if (!newItem.trim()) return
              const pos = (checklist[checklist.length-1]?.position ?? 0) + 1
              const created = await upsertChecklist(taskId, null, newItem.trim(), pos)
              setChecklist([...checklist, { id: created.id, title: newItem.trim(), completed: false, position: pos }])
              setNewItem('')
            }}>Добавить</Button>
          </div>
        </div>
        <div>
          <div className="font-medium mb-1">Комментарии</div>
          <ul className="space-y-2 max-h-48 overflow-auto">
            {comments.map((c)=> (
              <li key={c.id} className="text-sm"><span className="text-muted-foreground">{new Date(c.created_at).toLocaleString()}:</span> {c.content}</li>
            ))}
          </ul>
          <div className="mt-2 space-y-2">
            <Textarea rows={3} placeholder="Написать комментарий" value={commentText} onChange={(e)=>setCommentText(e.target.value)} />
            <Button size="sm" onClick={async ()=>{
              if (!commentText.trim()) return
              const c = await addComment(taskId, commentText.trim())
              setComments([...comments, c])
              setCommentText('')
            }}>Отправить</Button>
          </div>
        </div>
        <div>
          <div className="font-medium mb-1">Вложения</div>
          <input type="file" onChange={async (e)=>{
            const f = e.target.files?.[0]
            if (!f) return
            await uploadAttachment(taskId, f)
            alert('Файл загружен (доступ по подписанной ссылке).')
          }} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={()=>onOpenChange(false)}>Закрыть</Button>
      </DialogFooter>
    </Dialog>
  )
}


