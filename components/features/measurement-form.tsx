'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const schema = z.object({
  record_date: z.string(),
  weight: z.coerce.number().positive(),
  waist: z.coerce.number().optional(),
  abdomen: z.coerce.number().optional(),
  hips: z.coerce.number().optional(),
  notes: z.string().optional()
})

type Values = z.infer<typeof schema>

export function MeasurementForm({ userId }: { userId: string }) {
  const router = useRouter()
  const form = useForm<Values>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: Values) => {
    const supabase = createClient()
    const { error } = await supabase.from('measurements').insert({ user_id: userId, ...values })
    if (error) return toast.error(error.message)
    toast.success('Peso e medidas salvos!')
    router.push('/dashboard')
    router.refresh()
  }

  return <Card><h1 className="mb-3 text-lg font-bold">Registrar peso e medidas</h1><form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
    <div><Label>Data</Label><Input type="date" {...form.register('record_date')} /></div>
    <div><Label>Peso</Label><Input type="number" step="0.1" {...form.register('weight')} /></div>
    <div className="grid grid-cols-3 gap-2"><div><Label>Cintura</Label><Input type="number" step="0.1" {...form.register('waist')} /></div><div><Label>Abdômen</Label><Input type="number" step="0.1" {...form.register('abdomen')} /></div><div><Label>Quadril</Label><Input type="number" step="0.1" {...form.register('hips')} /></div></div>
    <div><Label>Observações</Label><Input {...form.register('notes')} /></div>
    <Button className="w-full">Salvar registro</Button>
  </form></Card>
}
