import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WeightChart } from '@/components/features/weight-chart'
import { getDashboardData, getProfile, getSessionUser } from '@/lib/supabase/queries'
import { calcWeightDelta, formatDateBR, getApplicationStatus, getNextApplicationDate } from '@/lib/utils/progress'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const { apps, measurements } = await getDashboardData(user.id)
  const lastApp = apps[0]
  const nextDate = getNextApplicationDate(lastApp?.application_date ?? null, profile.application_frequency_days, profile.treatment_start_date)
  const currentWeight = measurements[0]?.weight
  const delta = calcWeightDelta(profile.start_weight, currentWeight)

  return (
    <div className="space-y-3">
      <Card><h1 className="text-xl font-bold">Olá, {profile.name}! 🌿</h1><p className="text-sm text-slate-500">Cada semana registrada é uma vitória.</p></Card>
      <div className="grid grid-cols-2 gap-2">
        <Card><p className="text-xs text-slate-500">Próxima aplicação</p><p className="font-bold">{formatDateBR(nextDate)}</p><p className="text-sm text-emerald-700">{getApplicationStatus(nextDate)}</p></Card>
        <Card><p className="text-xs text-slate-500">Medicação atual</p><p className="font-bold">{profile.current_medication}</p><p className="text-sm">{profile.current_dosage}</p></Card>
        <Card><p className="text-xs text-slate-500">Peso atual</p><p className="font-bold">{currentWeight ? `${currentWeight} kg` : 'Sem registro'}</p><p className="text-sm">Diferença: {delta}kg</p></Card>
        <Card><p className="text-xs text-slate-500">Consistência</p><p className="font-bold">{apps.length} semanas</p><p className="text-sm text-emerald-700">Você está mantendo ótima consistência</p></Card>
      </div>
      <Card><p className="mb-2 text-sm font-semibold">Evolução de peso</p>{measurements.length ? <WeightChart data={measurements.slice().reverse().map(m=>({ date: formatDateBR(m.record_date), weight: m.weight }))} /> : <p className="text-sm text-slate-500">Ainda não há dados para o gráfico.</p>}</Card>
      <div className="grid grid-cols-2 gap-2"><Link href="/applications/new"><Button className="w-full">Registrar aplicação</Button></Link><Link href="/measurements"><Button variant="secondary" className="w-full">Registrar peso</Button></Link></div>
      <Link href="/applications"><Button variant="ghost" className="w-full">Ver histórico completo</Button></Link>
    </div>
  )
}
