'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Item { id: string; application_date?: string; medication?: string; dosage?: string; record_date?: string; weight?: number; type: 'app' | 'weight' }

export function HistoryList({ applications, measurements }: { applications: Item[]; measurements: Item[] }) {
  const [period, setPeriod] = useState('')
  const [medication, setMedication] = useState('')
  const [dosage, setDosage] = useState('')

  const data = useMemo(() => {
    const merged = [...applications, ...measurements].sort((a,b)=>new Date((b.application_date||b.record_date)!).getTime()-new Date((a.application_date||a.record_date)!).getTime())
    return merged.filter((i) => {
      if (period && !(i.application_date || i.record_date || '').startsWith(period)) return false
      if (medication && i.medication !== medication) return false
      if (dosage && i.dosage !== dosage) return false
      return true
    })
  }, [applications, measurements, period, medication, dosage])

  const onDelete = async (id: string, type: 'app' | 'weight') => {
    if (!window.confirm('Deseja excluir este registro?')) return
    const supabase = createClient()
    const table = type === 'app' ? 'applications' : 'measurements'
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) toast.error(error.message)
    else window.location.reload()
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-2">
        <p className="font-semibold">Filtros</p>
        <Input placeholder="Período YYYY-MM" value={period} onChange={(e)=>setPeriod(e.target.value)} />
        <Input placeholder="Medicamento" value={medication} onChange={(e)=>setMedication(e.target.value)} />
        <Input placeholder="Dosagem" value={dosage} onChange={(e)=>setDosage(e.target.value)} />
      </Card>
      {data.length === 0 && <Card><p className="text-sm text-slate-500">Sem registros nesse filtro.</p></Card>}
      {data.map((item)=><Card key={item.id}><p className="text-xs text-slate-500">{format(new Date((item.application_date||item.record_date)!), "dd/MM/yyyy", { locale: ptBR })}</p><p className="font-semibold">{item.type === 'app' ? `${item.medication} • ${item.dosage}` : `Peso: ${item.weight} kg`}</p><div className="mt-2 flex gap-2"><Button variant="secondary">Editar</Button><Button variant="ghost" onClick={()=>onDelete(item.id, item.type)}>Excluir</Button></div></Card>)}
    </div>
  )
}
