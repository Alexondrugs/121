import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? 'https://ryvgroguxhvyehcejycl.supabase.co'
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmdyb2d1eGh2eWVoY2VqeWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MDQzMDEsImV4cCI6MjA3NjQ4MDMwMX0.eWoiFdwM8YSv_MdxvXWkSpCFZlykarelZCJvub_EZVw'

function createStub() {
  // Minimal stub to avoid crashes on Pages when env is not configured
  return {
    auth: {
      async getSession() { return { data: { session: null } } },
      onAuthStateChange() { return { data: { subscription: { unsubscribe(){} } } } },
      async signInWithPassword() { return { data: null, error: { message: 'Supabase не настроен' } } },
      async resetPasswordForEmail() { return { data: null, error: { message: 'Supabase не настроен' } } },
      async signOut() { return { error: null } }
    }
  } as any
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'wpm-auth'
      }
    })
  : createStub()


