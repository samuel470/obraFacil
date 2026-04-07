import { redirect } from 'next/navigation'
import { getProfile, getSessionUser } from '@/lib/supabase/queries'
import { OnboardingForm } from '@/components/features/onboarding-form'

export default async function OnboardingPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  const profile = await getProfile(user.id)
  if (profile) redirect('/dashboard')

  return <OnboardingForm userId={user.id} />
}
