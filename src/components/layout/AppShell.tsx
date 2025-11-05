import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTheme } from '../../providers/theme-provider'
import { Sun, Moon, LogOut, Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export function AppShell() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-4">
          <div className="font-semibold">Wedding PM</div>
          <nav className="flex items-center gap-3 text-sm">
            <NavLink className={({isActive})=>`px-2 py-1 rounded ${isActive? 'bg-primary text-primary-foreground':'hover:bg-muted'}`} to="/">Главная</NavLink>
            <NavLink className={({isActive})=>`px-2 py-1 rounded ${isActive? 'bg-primary text-primary-foreground':'hover:bg-muted'}`} to="/projects">Проекты</NavLink>
            <NavLink className={({isActive})=>`px-2 py-1 rounded ${isActive? 'bg-primary text-primary-foreground':'hover:bg-muted'}`} to="/calendar">Календарь</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="h-9 px-3 rounded bg-secondary hover:opacity-90 flex items-center gap-1"
              onClick={async ()=>{
                try {
                  const vapid = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
                  if (!('serviceWorker' in navigator) || !vapid) { alert('Пуш недоступен'); return }
                  const reg = await navigator.serviceWorker.ready
                  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapid) })
                  const key = (sub.toJSON() as any)
                  await (supabase as any).from('push_subscriptions').insert({ endpoint: sub.endpoint, p256dh: key.keys.p256dh, auth: key.keys.auth })
                  alert('Подписка сохранена')
                } catch {
                  alert('Не удалось подписаться')
                }
              }}
            >
              <Bell size={16} /> Уведомления
            </button>
            <button
              className="h-9 px-3 rounded bg-secondary hover:opacity-90"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Тема"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="text-sm">{user?.email}</div>
            <button
              className="h-9 px-3 rounded bg-secondary hover:opacity-90 flex items-center gap-1"
              onClick={async () => { await signOut(); navigate('/login') }}
            >
              <LogOut size={16} /> Выход
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl w-full p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}


