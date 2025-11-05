import { supabase } from '../lib/supabase'

export function subscribeTable(table: string, filter: string, cb: () => void) {
  const channel = (supabase as any).channel ?
    (supabase as any).channel(`${table}-changes`).on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter },
      () => cb()
    ).subscribe() : null
  return () => {
    if (channel && (supabase as any).removeChannel) {
      (supabase as any).removeChannel(channel)
    }
  }
}


