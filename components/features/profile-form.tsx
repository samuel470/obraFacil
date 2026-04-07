'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export function ProfileForm({ profile }: { profile: any }) {
  const router = useRouter()
  const form = useForm({ defaultValues: profile })

  const save = async (values: any) => {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update(values).eq('id', profile.id)
    if (error) return toast.error(error.message)
    toast.success('Perfil atualizado!')
    router.refresh()
  }

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return <Card><h1 className="mb-3 text-lg font-bold">Perfil e configurações</h1><form className="space-y-3" onSubmit={form.handleSubmit(save)}>
    <div><Label>Nome</Label><Input {...form.register('name')} /></div>
    <div><Label>Medicamento principal</Label><Input {...form.register('current_medication')} /></div>
    <div><Label>Dosagem padrão</Label><Input {...form.register('current_dosage')} /></div>
    <div><Label>Frequência (dias)</Label><Input type="number" {...form.register('application_frequency_days')} /></div>
    <div><Label>Dia preferido</Label><Input {...form.register('preferred_application_day')} /></div>
    <div><Label>Peso inicial</Label><Input type="number" step="0.1" {...form.register('start_weight')} /></div>
    <div><Label>Meta de peso (opcional)</Label><Input type="number" step="0.1" {...form.register('target_weight')} /></div>
    <Button className="w-full">Salvar alterações</Button>
  </form>
  <Button variant="secondary" className="mt-2 w-full" onClick={logout}>Logout</Button>
  <Button variant="ghost" className="mt-2 w-full">Excluir conta (em breve)</Button>
  </Card>
}
