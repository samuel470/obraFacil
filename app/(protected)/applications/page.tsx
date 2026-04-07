import { redirect } from 'next/navigation'
import { getDashboardData, getSessionUser } from '@/lib/supabase/queries'
import { HistoryList } from '@/components/features/history-list'

export default async function ApplicationsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  const { apps, measurements } = await getDashboardData(user.id)
  return <HistoryList applications={apps.map((a) => ({ ...a, type: 'app' as const }))} measurements={measurements.map((m) => ({ ...m, type: 'weight' as const }))} />
}
