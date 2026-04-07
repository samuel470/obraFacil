import { redirect } from 'next/navigation'
import { getProfile, getSessionUser } from '@/lib/supabase/queries'
import { ProfileForm } from '@/components/features/profile-form'

export default async function ProfilePage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')
  return <ProfileForm profile={profile} />
}
