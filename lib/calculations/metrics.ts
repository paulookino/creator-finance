export function momGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr))
}

export function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(dateStr))
}

export function formatMonthYear(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(new Date(dateStr))
}

export function nextHotmartPaymentDate(transactionDate: Date): Date {
  const d30 = new Date(transactionDate)
  d30.setDate(d30.getDate() + 30)
  const day = d30.getDate()
  const result = new Date(d30)
  if (day <= 15) {
    result.setDate(15)
  } else {
    result.setMonth(result.getMonth() + 1)
    result.setDate(1)
  }
  return result
}

export function nextKiwifyPaymentDate(transactionDate: Date): Date {
  const d14 = new Date(transactionDate)
  d14.setDate(d14.getDate() + 14)
  const dayOfWeek = d14.getDay()
  const daysToFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 6
  d14.setDate(d14.getDate() + daysToFriday)
  return d14
}
