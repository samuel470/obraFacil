import Link from 'next/link'
import { AuthForm } from '@/components/features/auth-form'

export default function SignupPage() {
  return (
    <div className="w-full space-y-3">
      <AuthForm mode="signup" />
      <p className="text-center text-sm">Já tem conta? <Link className="text-emerald-700" href="/login">Entrar</Link></p>
    </div>
  )
}
