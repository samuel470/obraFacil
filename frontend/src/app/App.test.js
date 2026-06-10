import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('runs', () => { expect(true).toBe(true) })
})

describe('date helpers', () => {
  it('slices ISO date correctly', () => {
    const iso = '2026-06-10T12:00:00.000Z'
    expect(iso.slice(0, 10)).toBe('2026-06-10')
  })
})

describe('severity color mapping', () => {
  const SEV_COLOR = { BAIXA: 'green', MEDIA: 'amber', ALTA: 'orange', CRITICA: 'red' }
  it('maps all severities', () => {
    expect(SEV_COLOR.BAIXA).toBe('green')
    expect(SEV_COLOR.CRITICA).toBe('red')
    expect(SEV_COLOR.MEDIA).toBe('amber')
    expect(SEV_COLOR.ALTA).toBe('orange')
  })
})

describe('progress recalc logic', () => {
  it('returns 0 when no items', () => {
    const items = []
    const prog = items.length === 0 ? 0 : Math.round((items.filter(i => i.done).length * 100) / items.length)
    expect(prog).toBe(0)
  })
  it('returns 100 when all done', () => {
    const items = [{ done: true }, { done: true }]
    const prog = Math.round((items.filter(i => i.done).length * 100) / items.length)
    expect(prog).toBe(100)
  })
  it('returns 50 when half done', () => {
    const items = [{ done: true }, { done: false }]
    const prog = Math.round((items.filter(i => i.done).length * 100) / items.length)
    expect(prog).toBe(50)
  })
})

describe('stats computation', () => {
  it('sums budget correctly', () => {
    const projects = [{ orcamentoTotal: 100000 }, { orcamentoTotal: 50000 }, { orcamentoTotal: null }]
    const total = projects.reduce((s, p) => s + Number(p.orcamentoTotal || 0), 0)
    expect(total).toBe(150000)
  })
  it('counts pending payments within 7 days', () => {
    const today = new Date()
    const inFive = new Date(today); inFive.setDate(inFive.getDate() + 5)
    const inTen = new Date(today); inTen.setDate(inTen.getDate() + 10)
    const payments = [
      { status: 'PENDENTE', dataVencimento: inFive.toISOString().slice(0, 10) },
      { status: 'PENDENTE', dataVencimento: inTen.toISOString().slice(0, 10) },
      { status: 'PAGO', dataVencimento: inFive.toISOString().slice(0, 10) },
    ]
    const now = today.toISOString().slice(0, 10)
    const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7)
    const nw = nextWeek.toISOString().slice(0, 10)
    const count = payments.filter(p => p.status === 'PENDENTE' && p.dataVencimento >= now && p.dataVencimento <= nw).length
    expect(count).toBe(1)
  })
})
