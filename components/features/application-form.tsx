'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

const schema = z.object({
  application_date: z.string(),
  application_time: z.string(),
  medication: z.string(),
  dosage: z.string(),
  injection_site: z.string(),
  injection_side: z.string(),
  pain_level: z.coerce.number().min(0).max(10),
  symptoms: z.array(z.string()),
  mood: z.coerce.number().min(1).max(5),
  energy: z.coerce.number().min(1).max(5),
  appetite: z.coerce.number().min(1).max(5),
  notes: z.string().optional()
})

type Values = z.infer<typeof schema>
const symptomOptions = ['enjoo','dor de cabeça','azia','constipação','diarreia','falta de apetite','refluxo','cansaço','tontura','nenhum']

export function ApplicationForm({ userId }: { userId: string }) {
  const router = useRouter()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { symptoms: [] } })
  const symptoms = form.watch('symptoms')

  const onSubmit = async (values: Values) => {
    const supabase = createClient()
    const { error } = await supabase.from('applications').insert({ user_id: userId, ...values })
    if (error) return toast.error(error.message)
    toast.success('Aplicação registrada! 💉')
    router.push('/dashboard')
    router.refresh()
  }

  return <Card><h1 className="mb-3 text-lg font-bold">Hora de registrar sua aplicação 💉</h1><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
    <div className="grid grid-cols-2 gap-2"><div><Label>Data</Label><Input type="date" {...form.register('application_date')} /></div><div><Label>Horário</Label><Input type="time" {...form.register('application_time')} /></div></div>
    <div><Label>Medicamento</Label><Input {...form.register('medication')} /></div>
    <div><Label>Dosagem</Label><Input {...form.register('dosage')} /></div>
    <div className="grid grid-cols-2 gap-2"><div><Label>Local</Label><Select {...form.register('injection_site')}><option>abdômen</option><option>coxa</option><option>braço</option><option>outro</option></Select></div><div><Label>Lado</Label><Select {...form.register('injection_side')}><option>esquerdo</option><option>direito</option><option>central</option></Select></div></div>
    <div><Label>Dor (0-10)</Label><Input type="number" {...form.register('pain_level')} /></div>
    <div><Label>Sintomas (24h)</Label><div className="grid grid-cols-2 gap-1">{symptomOptions.map((s)=><label key={s} className="text-sm"><input type="checkbox" checked={symptoms?.includes(s)} onChange={(e)=>{const current=symptoms||[];form.setValue('symptoms', e.target.checked ? [...current,s] : current.filter(i=>i!==s))}}/> {s}</label>)}</div></div>
    <div className="grid grid-cols-3 gap-2"><div><Label>Humor</Label><Input type="number" min={1} max={5} {...form.register('mood')} /></div><div><Label>Energia</Label><Input type="number" min={1} max={5} {...form.register('energy')} /></div><div><Label>Apetite</Label><Input type="number" min={1} max={5} {...form.register('appetite')} /></div></div>
    <div><Label>Observações</Label><Input {...form.register('notes')} /></div>
    <Button className="w-full">Salvar aplicação</Button>
  </form></Card>
}
