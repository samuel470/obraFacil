'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(2),
  current_medication: z.string().min(2),
  current_dosage: z.string().min(1),
  application_frequency_days: z.coerce.number().min(1),
  preferred_application_day: z.string().min(1),
  start_weight: z.coerce.number().positive(),
  treatment_start_date: z.string(),
  goal: z.string().min(1)
})

type Values = z.infer<typeof schema>

export function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { application_frequency_days: 7 } })

  const onSubmit = async (values: Values) => {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').upsert({ id: userId, ...values })
    if (error) return toast.error(error.message)
    toast.success('Perfil salvo com sucesso!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card>
      <h1 className="mb-3 text-xl font-bold">Vamos configurar seu FitPen ✨</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div><Label>Nome</Label><Input {...form.register('name')} /></div>
        <div><Label>Medicamento atual</Label><Input {...form.register('current_medication')} /></div>
        <div><Label>Dosagem atual</Label><Input {...form.register('current_dosage')} /></div>
        <div><Label>Frequência da aplicação (dias)</Label><Input type="number" {...form.register('application_frequency_days')} /></div>
        <div><Label>Dia preferido da aplicação</Label><Input {...form.register('preferred_application_day')} /></div>
        <div><Label>Peso inicial</Label><Input type="number" step="0.1" {...form.register('start_weight')} /></div>
        <div><Label>Início do tratamento</Label><Input type="date" {...form.register('treatment_start_date')} /></div>
        <div><Label>Objetivo principal</Label><Select {...form.register('goal')}><option value="emagrecer">Emagrecer</option><option value="criar consistência">Criar consistência</option><option value="controlar sintomas">Controlar sintomas</option><option value="manter rotina">Manter rotina</option></Select></div>
        <Button className="w-full">Concluir onboarding</Button>
      </form>
    </Card>
  )
}
