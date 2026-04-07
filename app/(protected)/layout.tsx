import { BottomNav } from '@/components/layout/bottom-nav'
import { FabRegister } from '@/components/layout/fab-register'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 pb-28 pt-4">
      {children}
      <FabRegister />
      <BottomNav />
    </main>
  )
}
