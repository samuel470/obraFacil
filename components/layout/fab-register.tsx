import Link from 'next/link'
import { Plus } from 'lucide-react'

export function FabRegister() {
  return (
    <Link href="/applications/new" className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg">
      <Plus />
    </Link>
  )
}
