export type Period = 'current_month' | 'last_month' | '30d' | '90d' | '180d' | '1y' | 'all'

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'current_month', label: 'Este mês' },
  { value: 'last_month',    label: 'Mês anterior' },
  { value: '30d',           label: '30 dias' },
  { value: '90d',           label: '3 meses' },
  { value: '180d',          label: '6 meses' },
  { value: '1y',            label: '1 ano' },
  { value: 'all',           label: 'Desde sempre' },
]

export interface PeriodRange {
  start:     Date | null
  end:       Date | null
  prevStart: Date | null
  prevEnd:   Date | null
  label:     string
  months:    number   // quantos meses exibir no gráfico
}

export function getPeriodRange(period: Period): PeriodRange {
  const now  = new Date()
  const opt  = PERIOD_OPTIONS.find(o => o.value === period)!

  switch (period) {
    case 'current_month': {
      const start     = new Date(now.getFullYear(), now.getMonth(), 1)
      const end       = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const prevEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      return { start, end, prevStart, prevEnd, label: opt.label, months: 6 }
    }
    case 'last_month': {
      const start     = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end       = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      const prevEnd   = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59)
      return { start, end, prevStart, prevEnd, label: opt.label, months: 6 }
    }
    case '30d': {
      const start     = new Date(now.getTime() - 30 * 86400000)
      const prevStart = new Date(now.getTime() - 60 * 86400000)
      const prevEnd   = new Date(now.getTime() - 30 * 86400000)
      return { start, end: now, prevStart, prevEnd, label: opt.label, months: 3 }
    }
    case '90d': {
      const start     = new Date(now.getTime() - 90 * 86400000)
      const prevStart = new Date(now.getTime() - 180 * 86400000)
      const prevEnd   = new Date(now.getTime() - 90 * 86400000)
      return { start, end: now, prevStart, prevEnd, label: opt.label, months: 4 }
    }
    case '180d': {
      const start     = new Date(now.getTime() - 180 * 86400000)
      const prevStart = new Date(now.getTime() - 360 * 86400000)
      const prevEnd   = new Date(now.getTime() - 180 * 86400000)
      return { start, end: now, prevStart, prevEnd, label: opt.label, months: 6 }
    }
    case '1y': {
      const start     = new Date(now.getTime() - 365 * 86400000)
      const prevStart = new Date(now.getTime() - 730 * 86400000)
      const prevEnd   = new Date(now.getTime() - 365 * 86400000)
      return { start, end: now, prevStart, prevEnd, label: opt.label, months: 12 }
    }
    case 'all':
    default:
      return { start: null, end: null, prevStart: null, prevEnd: null, label: 'Desde sempre', months: 24 }
  }
}
