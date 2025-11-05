import { useState } from 'react'
import { cn } from '../../utils/cn'

export function Tabs({
  tabs,
  defaultValue,
  onChange
}: {
  tabs: Array<{ value: string; label: string; content: React.ReactNode }>
  defaultValue?: string
  onChange?: (value: string) => void
}) {
  const [value, setValue] = useState<string>(defaultValue || tabs[0]?.value)
  return (
    <div>
      <div className="flex gap-2 border-b">
        {tabs.map((t) => (
          <button
            key={t.value}
            className={cn(
              'px-3 py-2 text-sm -mb-px border-b-2',
              value === t.value ? 'border-primary' : 'border-transparent hover:border-muted'
            )}
            onClick={() => { setValue(t.value); onChange?.(t.value) }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="py-3">
        {tabs.find((t) => t.value === value)?.content}
      </div>
    </div>
  )}


