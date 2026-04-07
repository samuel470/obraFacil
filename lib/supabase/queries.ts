import { createClient } from '@/lib/supabase/server'

export async function getSessionUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return data
}

export async function getDashboardData(userId: string) {
  const supabase = await createClient()
  const [{ data: apps }, { data: measurements }] = await Promise.all([
    supabase.from('applications').select('*').eq('user_id', userId).order('application_date', { ascending: false }).limit(30),
    supabase.from('measurements').select('*').eq('user_id', userId).order('record_date', { ascending: false }).limit(30)
  ])
  return { apps: apps ?? [], measurements: measurements ?? [] }
}
