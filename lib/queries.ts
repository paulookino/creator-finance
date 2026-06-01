import { createClient } from './supabase/server'
import type { Transaction, MonthlyRevenue, ProductMetrics, PaymentSchedule } from './types'
import { calculateNetAmount, calculateFee, PLATFORM_LABELS } from './calculations/platform-fees'
import { nextHotmartPaymentDate, nextKiwifyPaymentDate } from './calculations/metrics'
import { getPeriodRange, type Period } from './periods'
import type { Platform } from './types'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Cria o perfil se não existir (trigger pode não ter disparado)
  if (!data) {
    const { data: created } = await supabase
      .from('profiles')
      .upsert({ id: user.id, email: user.email ?? '', name: user.email?.split('@')[0] ?? '' })
      .select('*')
      .single()
    return created
  }

  return data
}

export async function getUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function getTransactions(userId: string, limit = 50) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .limit(limit)
  return (data ?? []) as Transaction[]
}

export interface TransactionSummary {
  totalGross:   number
  totalFees:    number
  totalNet:     number
  totalRefunds: number
  avgTicket:    number
  salesCount:   number
}

export async function getTransactionSummary(
  userId: string,
  filters: { platform?: string; status?: string; search?: string; period?: Period } = {}
): Promise<TransactionSummary> {
  const supabase = await createClient()
  const range = getPeriodRange(filters.period ?? 'all')
  const PAGE = 1000
  let from = 0
  let all: { amount: number; platform_fee: number; net_amount: number; type: string; status: string }[] = []

  while (true) {
    let q = supabase
      .from('transactions')
      .select('amount, platform_fee, net_amount, type, status')
      .eq('user_id', userId)
      .range(from, from + PAGE - 1)

    if (filters.platform && filters.platform !== 'all') q = q.eq('platform', filters.platform)
    if (filters.status   && filters.status   !== 'all') q = q.eq('status',   filters.status)
    if (filters.search)  q = q.ilike('product_name', `%${filters.search}%`)
    if (range.start) q = q.gte('transaction_date', range.start.toISOString())
    if (range.end)   q = q.lte('transaction_date', range.end.toISOString())

    const { data } = await q
    if (!data || data.length === 0) break
    all = all.concat(data)
    if (data.length < PAGE) break
    from += PAGE
  }

  const approved  = all.filter(t => t.status === 'approved')
  const refunded  = all.filter(t => t.status === 'refunded')
  const salesCount = approved.filter(t => !['refund'].includes(t.type)).length

  const totalGross   = approved.reduce((s, t) => s + Number(t.amount),       0)
  const totalFees    = approved.reduce((s, t) => s + Number(t.platform_fee), 0)
  const totalNet     = approved.reduce((s, t) => s + Number(t.net_amount),   0)
  const totalRefunds = refunded.reduce((s, t) => s + Number(t.amount),       0)
  const avgTicket    = salesCount > 0 ? totalGross / salesCount : 0

  return { totalGross, totalFees, totalNet, totalRefunds, avgTicket, salesCount }
}

export interface TransactionFilters {
  page?:     number
  perPage?:  number
  platform?: string
  status?:   string
  type?:     string
  search?:   string
  period?:   Period
}

export async function getTransactionsPaged(userId: string, filters: TransactionFilters = {}) {
  const supabase  = await createClient()
  const page      = Math.max(1, filters.page    ?? 1)
  const perPage   = Math.min(100, filters.perPage ?? 50)
  const from      = (page - 1) * perPage
  const to        = from + perPage - 1
  const range     = getPeriodRange((filters as { period?: Period }).period ?? 'all')

  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })

  if (filters.platform && filters.platform !== 'all') query = query.eq('platform', filters.platform)
  if (filters.status   && filters.status   !== 'all') query = query.eq('status',   filters.status)
  if (filters.type     && filters.type     !== 'all') query = query.eq('type',     filters.type)
  if (filters.search)  query = query.ilike('product_name', `%${filters.search}%`)
  if (range.start) query = query.gte('transaction_date', range.start.toISOString())
  if (range.end)   query = query.lte('transaction_date', range.end.toISOString())

  const { data, count, error } = await query.range(from, to)

  return {
    transactions: (data ?? []) as Transaction[],
    total:        count ?? 0,
    page,
    perPage,
    totalPages:   Math.ceil((count ?? 0) / perPage),
  }
}

export async function getMetrics(userId: string, period: Period = 'all') {
  const supabase = await createClient()
  const range = getPeriodRange(period)

  // Busca paginada para contornar o limite de 1000 linhas do PostgREST
  async function fetchAll(start: Date | null, end: Date | null) {
    const PAGE = 1000
    let from = 0
    let all: { amount: number; net_amount: number; type: string; status: string }[] = []

    while (true) {
      let q = supabase.from('transactions')
        .select('amount, net_amount, type, status')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .range(from, from + PAGE - 1)
      if (start) q = q.gte('transaction_date', start.toISOString())
      if (end)   q = q.lte('transaction_date', end.toISOString())

      const { data } = await q
      if (!data || data.length === 0) break
      all = all.concat(data)
      if (data.length < PAGE) break
      from += PAGE
    }
    return all
  }

  const [current, previous] = await Promise.all([
    fetchAll(range.start, range.end),
    fetchAll(range.prevStart, range.prevEnd),
  ])

  const gross     = current .reduce((s, t) => s + Number(t.amount), 0)
  const net       = current .reduce((s, t) => s + Number(t.net_amount), 0)
  const prevGross = previous.reduce((s, t) => s + Number(t.amount), 0)
  const prevNet   = previous.reduce((s, t) => s + Number(t.net_amount), 0)
  const sales     = current .filter(t => ['sale','brand_deal','affiliate','adsense','subscription'].includes(t.type)).length
  const refunds   = current .filter(t => t.type === 'refund').length

  return {
    gross_revenue:      gross,
    net_revenue:        net,
    tax_estimate:       gross * 0.06,
    prev_gross_revenue: prevGross,
    prev_net_revenue:   prevNet,
    total_sales:        sales,
    total_refunds:      refunds,
    avg_ticket:         sales > 0 ? gross / sales : 0,
    period_label:       range.label,
    is_current_month:   period === 'current_month',
  }
}

export async function getMonthlyRevenue(userId: string, period: Period = 'all'): Promise<MonthlyRevenue[]> {
  const supabase = await createClient()
  const range = getPeriodRange(period)
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - Math.max(range.months, 6))
  cutoff.setDate(1)
  const sixMonthsAgo = range.start ?? cutoff

  // Busca paginada para contornar limite 1000 linhas
  const PAGE = 1000
  let from = 0
  let allData: { platform: string; amount: number; transaction_date: string }[] = []

  while (true) {
    let q = supabase
      .from('transactions')
      .select('platform, amount, transaction_date')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .gte('transaction_date', sixMonthsAgo.toISOString())
      .order('transaction_date', { ascending: true })
      .range(from, from + PAGE - 1)

    if (range.end) q = q.lte('transaction_date', range.end.toISOString())

    const { data: page } = await q
    if (!page || page.length === 0) break
    allData = allData.concat(page)
    if (page.length < PAGE) break
    from += PAGE
  }

  const data = allData

  const map = new Map<string, MonthlyRevenue>()
  for (const t of data ?? []) {
    const d = new Date(t.transaction_date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    if (!map.has(key)) map.set(key, { month: label, hotmart: 0, kiwify: 0, adsense: 0, manual: 0, total: 0 })
    const row = map.get(key)!
    const platform = t.platform as Platform
    row[platform] = (row[platform] as number) + Number(t.amount)
    row.total += Number(t.amount)
  }

  return Array.from(map.values())
}

export async function getProductMetrics(userId: string, period: Period = 'all'): Promise<ProductMetrics[]> {
  const supabase = await createClient()
  const range = getPeriodRange(period)
  const PAGE = 1000
  let from = 0
  let allRows: { product_name: string; platform: string; amount: number; type: string }[] = []

  while (true) {
    let q = supabase
      .from('transactions')
      .select('product_name, platform, amount, type')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .range(from, from + PAGE - 1)

    if (range.start) q = q.gte('transaction_date', range.start.toISOString())
    if (range.end)   q = q.lte('transaction_date', range.end.toISOString())

    const { data } = await q
    if (!data || data.length === 0) break
    allRows = allRows.concat(data)
    if (data.length < PAGE) break
    from += PAGE
  }

  const map = new Map<string, { name: string; platform: Platform; total: number; sales: number }>()
  for (const t of allRows) {
    const key = `${t.platform}::${t.product_name}`
    if (!map.has(key)) map.set(key, { name: t.product_name, platform: t.platform as Platform, total: 0, sales: 0 })
    const row = map.get(key)!
    row.total += Number(t.amount)
    if (t.type === 'sale') row.sales++
  }

  const totalAll = Array.from(map.values()).reduce((s, p) => s + p.total, 0)
  return Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .map(p => ({
      name: p.name,
      platform: p.platform,
      total_revenue: p.total,
      total_sales: p.sales,
      avg_ticket: p.sales > 0 ? p.total / p.sales : p.total,
      pct_of_total: totalAll > 0 ? (p.total / totalAll) * 100 : 0,
      trend: 'stable' as const,
    }))
}

export async function getPaymentSchedule(userId: string): Promise<PaymentSchedule[]> {
  const supabase = await createClient()

  // 1. Verificar se há schedule manual já cadastrado
  const { data: existing } = await supabase
    .from('payment_schedule')
    .select('*')
    .eq('user_id', userId)
    .gte('expected_date', new Date().toISOString().split('T')[0])
    .order('expected_date', { ascending: true })
    .limit(10)

  if (existing && existing.length > 0) return existing as PaymentSchedule[]

  // 2. Estimar com base nas transações dos últimos 30 dias
  const { data: txns } = await supabase
    .from('transactions')
    .select('platform, amount, net_amount, transaction_date')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .gte('transaction_date', new Date(Date.now() - 30 * 86400000).toISOString())

  if (!txns || txns.length === 0) return []

  const totals: Record<string, number> = {}
  for (const t of txns) {
    totals[t.platform] = (totals[t.platform] ?? 0) + Number(t.net_amount)
  }

  const result: PaymentSchedule[] = []

  if (totals['kiwify']) {
    result.push({
      id: 'est-kiwify',
      platform: 'kiwify',
      expected_date: nextKiwifyPaymentDate(new Date()).toISOString().split('T')[0],
      amount: totals['kiwify'],
      status: 'pending',
    })
  }
  if (totals['hotmart']) {
    result.push({
      id: 'est-hotmart',
      platform: 'hotmart',
      expected_date: nextHotmartPaymentDate(new Date()).toISOString().split('T')[0],
      amount: totals['hotmart'],
      status: 'pending',
    })
  }
  if (totals['adsense']) {
    const next21 = new Date()
    next21.setDate(21)
    if (next21 <= new Date()) next21.setMonth(next21.getMonth() + 1)
    result.push({
      id: 'est-adsense',
      platform: 'adsense',
      expected_date: next21.toISOString().split('T')[0],
      amount: totals['adsense'],
      status: 'pending',
    })
  }
  // Manual = já recebido diretamente, não entra no calendário de recebimentos

  return result
}
