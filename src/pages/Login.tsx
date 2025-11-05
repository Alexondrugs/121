import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Navigate } from 'react-router-dom'

export default function Login() {
  const { session, signInWithPassword, resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (session) return <Navigate to="/" replace />

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const { error } = await signInWithPassword(email, password)
    if (error) setMessage(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-xl font-semibold">Войти</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="text-sm">Email</label>
              <Input type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Пароль</label>
              <Input type="password" required value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            {message && <div className="text-sm text-red-600">{message}</div>}
            <Button disabled={loading} type="submit" className="w-full">Войти</Button>
          </form>
          <button
            className="mt-3 text-sm underline"
            onClick={async () => {
              if (!email) { setMessage('Введите email'); return }
              const { error } = await resetPasswordForEmail(email)
              setMessage(error ? error.message : 'Ссылка для сброса пароля отправлена')
            }}
          >
            Забыли пароль?
          </button>
        </CardContent>
      </Card>
    </div>
  )
}


