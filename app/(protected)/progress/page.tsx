import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { WeightChart } from '@/components/features/weight-chart'
import { getDashboardData, getSessionUser } from '@/lib/supabase/queries'
import { formatDateBR } from '@/lib/utils/progress'

export default async function ProgressPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  const { apps, measurements } = await getDashboardData(user.id)

  const symptomCounts = apps.flatMap((a) => a.symptoms || []).reduce((acc: Record<string, number>, s) => { acc[s] = (acc[s] || 0) + 1; return acc }, {})
  const topSymptoms = Object.entries(symptomCounts).sort((a,b)=>b[1]-a[1]).slice(0,3)
  const avg = (key: 'appetite'|'energy') => apps.length ? (apps.reduce((sum,a)=>sum+(a[key]||0),0) / apps.length).toFixed(1) : '0'

  return <div className="space-y-3">
    <Card><p className="text-lg font-bold">Relatórios de progresso 📈</p><p className="text-sm text-slate-500">Seu progresso é construído passo a passo.</p></Card>
    <Card><WeightChart data={measurements.slice().reverse().map((m)=>({ date: formatDateBR(m.record_date), weight: m.weight }))} /></Card>
    <div className="grid grid-cols-2 gap-2">
      <Card><p className="text-xs text-slate-500">Aplicações totais</p><p className="text-xl font-bold">{apps.length}</p></Card>
      <Card><p className="text-xs text-slate-500">Dias de consistência</p><p className="text-xl font-bold">{new Set(apps.map((a)=>a.application_date)).size}</p></Card>
      <Card><p className="text-xs text-slate-500">Média de apetite</p><p className="text-xl font-bold">{avg('appetite')}</p></Card>
      <Card><p className="text-xs text-slate-500">Média de energia</p><p className="text-xl font-bold">{avg('energy')}</p></Card>
    </div>
    <Card><p className="font-semibold">Sintomas mais frequentes</p><ul className="text-sm">{topSymptoms.length ? topSymptoms.map(([s, c])=><li key={s}>{s}: {c}x</li>) : <li>Sem sintomas registrados</li>}</ul></Card>
  </div>
}
