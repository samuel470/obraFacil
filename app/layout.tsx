import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const nunito = Nunito({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FitPen',
  description: 'Acompanhamento de aplicações e progresso do tratamento'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={nunito.className}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
