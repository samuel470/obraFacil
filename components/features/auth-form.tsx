'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const schema = z.object({ email: z.string().email(), password: z.string().min(6) })
type FormData = z.infer<typeof schema>

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormData) => {
    setLoading(true)
    const supabase = createClient()
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword(values)
      : await supabase.auth.signUp(values)

    if (result.error) toast.error(result.error.message)
    else {
      toast.success(mode === 'login' ? 'Bem-vinda(o) de volta!' : 'Conta criada com sucesso!')
      router.push('/onboarding')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Card className="w-full">
      <h1 className="text-center text-2xl font-bold">FitPen 🐶</h1>
      <p className="mb-4 text-center text-sm text-slate-500">Seu progresso é construído passo a passo.</p>
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Label>Email</Label>
          <Input type="email" {...form.register('email')} />
        </div>
        <div>
          <Label>Senha</Label>
          <Input type="password" {...form.register('password')} />
        </div>
        <Button className="w-full" disabled={loading}>{loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</Button>
      </form>
    </Card>
  )
}
