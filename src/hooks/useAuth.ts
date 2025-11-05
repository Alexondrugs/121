import { useEffect, useMemo, useState } from 'react'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then((res: { data: { session: Session | null } }) => {
      setSession(res.data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession)
    }) as unknown as { data: { subscription: { unsubscribe: () => void } } }
    return () => sub.subscription.unsubscribe()
  }, [])

  const user: User | null = useMemo(() => session?.user ?? null, [session])

  return {
    session,
    user,
    loading,
    signInWithPassword: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    resetPasswordForEmail: (email: string) =>
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/login`
      })
  }
}


