import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/queries'
import { MeasurementForm } from '@/components/features/measurement-form'

export default async function MeasurementsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  return <MeasurementForm userId={user.id} />
}
