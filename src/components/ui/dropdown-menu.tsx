import { useEffect, useRef, useState } from 'react'

export function Dropdown({ trigger, items }: { trigger: React.ReactNode, items: Array<{ label: string, onClick: () => void }> }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(v=>!v)}>{trigger}</div>
      {open && (
        <div className="absolute right-0 mt-2 min-w-40 rounded-md border bg-card shadow">
          {items.map((it, idx) => (
            <button key={idx} className="w-full px-3 py-2 text-left hover:bg-muted" onClick={() => { setOpen(false); it.onClick() }}>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


