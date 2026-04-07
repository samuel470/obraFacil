import { addDays, differenceInCalendarDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const getNextApplicationDate = (lastDate: string | null, frequency: number, startDate: string) => {
  const base = lastDate ? new Date(lastDate) : new Date(startDate)
  return addDays(base, frequency)
}

export const getApplicationStatus = (nextDate: Date) => {
  const today = new Date()
  const diff = differenceInCalendarDays(nextDate, today)
  if (diff < 0) return `Atrasada há ${Math.abs(diff)} dia(s)`
  if (diff === 0) return 'É hoje 💉'
  return `Faltam ${diff} dia(s)`
}

export const formatDateBR = (date: string | Date) => format(new Date(date), "dd 'de' MMM", { locale: ptBR })

export const calcWeightDelta = (startWeight: number, currentWeight?: number) => {
  if (!currentWeight) return 0
  return Number((currentWeight - startWeight).toFixed(1))
}
