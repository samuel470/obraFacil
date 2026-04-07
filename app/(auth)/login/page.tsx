import Link from 'next/link'
import { AuthForm } from '@/components/features/auth-form'

export default function LoginPage() {
  return (
    <div className="w-full space-y-3">
      <AuthForm mode="login" />
      <p className="text-center text-sm">Não tem conta? <Link className="text-emerald-700" href="/signup">Cadastre-se</Link></p>
    </div>
  )
}
