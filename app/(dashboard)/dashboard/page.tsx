export const dynamic = 'force-dynamic'

import { Header } from '@/components/layout/Header'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PlatformBadge } from '@/components/dashboard/PlatformBadge'
import { RevenueBarChart } from '@/components/charts/RevenueBarChart'
import { PlatformDonut } from '@/components/charts/PlatformDonut'
import { DarkCard, DarkCardHeader, DarkCardTitle, DarkCardContent } from '@/components/ui/dark-card'
import { getUserId, getProfile, getMetrics, getMonthlyRevenue, getProductMetrics, getPaymentSchedule } from '@/lib/queries'
import { formatCurrency, formatDate } from '@/lib/calculations/metrics'
import { estimateTax } from '@/lib/calculations/taxes'
import { type Period } from '@/lib/periods'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import type { TaxRegime, Platform } from '@/lib/types'
import { TrendingUp, TrendingDown, Minus, CalendarClock, ShoppingCart, DollarSign, Package, ArrowUpRight, PlusCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: periodParam } = await searchParams
  const period = (periodParam as Period) ?? 'all'
  const userId = await getUserId()
  if (!userId) {
    return (
      <div>
        <Header title="Dashboard" />
        <div className="p-6 text-sm text-slate-400">
          Sessão expirada. <Link href="/login" className="text-indigo-500 underline">Faça login.</Link>
        </div>
      </div>
    )
  }

  const [profile, metrics, monthlyRevenue, products, schedule] = await Promise.all([
    getProfile(), getMetrics(userId, period), getMonthlyRevenue(userId, period),
    getProductMetrics(userId), getPaymentSchedule(userId),
  ])

  const regime  = (profile?.tax_regime as TaxRegime) ?? 'simples'
  const rate    = profile?.simples_rate ?? 0.06
  const taxEst  = estimateTax(metrics.gross_revenue, regime, rate, profile?.mei_das ?? 75.90)
  const taxPct  = metrics.gross_revenue > 0 ? ((taxEst / metrics.gross_revenue) * 100).toFixed(1) : '0'

  const hasMonthly  = monthlyRevenue.length > 0
  const hasProducts = products.length > 0
  const hasSchedule = schedule.length > 0
  const hasData     = metrics.gross_revenue > 0

  const currentMonth = hasMonthly ? monthlyRevenue[monthlyRevenue.length - 1] : null
  const nextPayment  = hasSchedule ? schedule[0] : null

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-5">

        {/* Banner onboarding */}
        {!hasData && (
          <div
            className="flex items-center justify-between rounded-2xl px-5 py-4"
            style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)', boxShadow: '0 4px 20px rgba(93,95,239,0.3)' }}
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-white/80 flex-shrink-0" />
              <p className="text-sm text-white">
                <span className="font-bold">Nenhuma transação ainda.</span>{' '}
                <span className="text-white/75">Adicione um lançamento ou configure o webhook Kiwify.</span>
              </p>
            </div>
            <Link
              href="/integracoes"
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors flex-shrink-0 ml-4"
            >
              Ir para Integrações <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* ── Linha 1: KPIs + Distribuição ───────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
              Receita — <span className="capitalize normal-case font-semibold" style={{ color: '#5d5fef' }}>{metrics.period_label}</span>
            </p>
            <PeriodSelector current={period} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              title="Receita Bruta"
              value={metrics.gross_revenue}
              previousValue={metrics.prev_gross_revenue}
              color="default"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <MetricCard
              title="Receita Líquida"
              value={metrics.net_revenue}
              previousValue={metrics.prev_net_revenue}
              color="success"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <MetricCard
              title="Total de Vendas"
              value={metrics.total_sales}
              format="number"
              color="warning"
              icon={<ShoppingCart className="w-5 h-5" />}
            />
            <MetricCard
              title="Imposto a Reservar"
              value={taxEst}
              subtitle={`${taxPct}% da receita bruta`}
              color="danger"
              icon={<Package className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* ── Linha 2: Gráfico principal + Donut ─────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <DarkCard className="col-span-2">
            <DarkCardHeader className="flex items-center justify-between">
              <DarkCardTitle>Receita Total — últimos 6 meses</DarkCardTitle>
              {hasMonthly && currentMonth && (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(93,95,239,0.1)', color: '#5d5fef' }}
                >
                  {formatCurrency(currentMonth.total)} este mês
                </span>
              )}
            </DarkCardHeader>
            <DarkCardContent>
              {hasMonthly ? (
                <RevenueBarChart data={monthlyRevenue} />
              ) : (
                <div className="h-[220px] flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(93,95,239,0.08)' }}>
                    <TrendingUp className="w-6 h-6" style={{ color: '#5d5fef' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Nenhuma receita registrada</p>
                  <Link href="/integracoes" className="text-xs font-semibold" style={{ color: '#5d5fef' }}>Adicionar transações →</Link>
                </div>
              )}
            </DarkCardContent>
          </DarkCard>

          <DarkCard>
            <DarkCardHeader>
              <DarkCardTitle>Por Plataforma{currentMonth ? ` — ${currentMonth.month}` : ''}</DarkCardTitle>
            </DarkCardHeader>
            <DarkCardContent>
              {currentMonth ? (
                <PlatformDonut data={currentMonth} />
              ) : (
                <div className="h-[130px] flex items-center justify-center text-sm" style={{ color: '#94a3b8' }}>
                  Sem dados.
                </div>
              )}
            </DarkCardContent>
          </DarkCard>
        </div>

        {/* ── Linha 3: Top produtos + Próximo recebimento ─────── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Top produtos */}
          <DarkCard className="col-span-2">
            <DarkCardHeader className="flex items-center justify-between">
              <DarkCardTitle>Top Produtos</DarkCardTitle>
              <Link href="/produtos" className="text-xs font-semibold" style={{ color: '#5d5fef' }}>
                Ver todos →
              </Link>
            </DarkCardHeader>
            <DarkCardContent className="p-0">
              {hasProducts ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f0f2f8' }}>
                      {['Produto', 'Plataforma', 'Receita', 'Vendas', 'Tendência'].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold" style={{ color: '#94a3b8' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map((p, i) => (
                      <tr
                        key={p.name}
                        className="transition-colors hover:bg-slate-50"
                        style={{ borderTop: i > 0 ? '1px solid #f8f9fa' : undefined }}
                      >
                        <td className="px-6 py-3 font-semibold text-xs truncate max-w-[160px]" style={{ color: '#1a1d2e' }}>
                          {p.name}
                        </td>
                        <td className="px-4 py-3">
                          <PlatformBadge platform={p.platform as Platform} size="sm" />
                        </td>
                        <td className="px-4 py-3 font-bold text-xs tabular-nums" style={{ color: '#1a1d2e' }}>
                          {formatCurrency(p.total_revenue)}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#64748b' }}>
                          {p.total_sales}
                        </td>
                        <td className="px-4 py-3">
                          {p.trend === 'up'     && <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#28c76f' }}><TrendingUp className="w-3 h-3" /> Alta</span>}
                          {p.trend === 'down'   && <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#ff6b6b' }}><TrendingDown className="w-3 h-3" /> Baixa</span>}
                          {p.trend === 'stable' && <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#94a3b8' }}><Minus className="w-3 h-3" /> Estável</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm" style={{ color: '#94a3b8' }}>Nenhum produto ainda.</p>
                  <Link href="/integracoes" className="text-xs font-semibold mt-2 inline-block" style={{ color: '#5d5fef' }}>
                    Adicionar transações →
                  </Link>
                </div>
              )}
            </DarkCardContent>
          </DarkCard>

          {/* Próximos recebimentos */}
          <DarkCard>
            <DarkCardHeader>
              <DarkCardTitle>Próximos Recebimentos</DarkCardTitle>
            </DarkCardHeader>
            <DarkCardContent className="p-0">
              {hasSchedule ? (
                <div className="px-5 py-2">
                  {schedule.slice(0, 4).map((s, i) => {
                    const days = Math.max(0, Math.ceil((new Date(s.expected_date).getTime() - Date.now()) / 86400000))
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between py-3.5"
                        style={{ borderBottom: i < schedule.slice(0,4).length-1 ? '1px solid #f8f9fa' : undefined }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(93,95,239,0.08)' }}
                          >
                            <CalendarClock className="w-4 h-4" style={{ color: '#5d5fef' }} />
                          </div>
                          <div>
                            <PlatformBadge platform={s.platform as Platform} size="sm" />
                            <p className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>
                              {days === 0 ? 'hoje' : `em ${days} dias`} · {formatDate(s.expected_date)}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-sm tabular-nums" style={{ color: '#1a1d2e' }}>
                          {formatCurrency(Number(s.amount))}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm" style={{ color: '#94a3b8' }}>Nenhum recebimento previsto.</p>
                  <p className="text-xs mt-1" style={{ color: '#cbd5e1' }}>Adicione transações Kiwify ou Hotmart.</p>
                </div>
              )}
            </DarkCardContent>
          </DarkCard>
        </div>

      </div>
    </div>
  )
}
