import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/queries'
import { ApplicationForm } from '@/components/features/application-form'

export default async function NewApplicationPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  return <ApplicationForm userId={user.id} />
}
