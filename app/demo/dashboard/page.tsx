import { DemoHeader } from '@/components/demo/DemoHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PlatformBadge } from '@/components/dashboard/PlatformBadge'
import { RevenueBarChart } from '@/components/charts/RevenueBarChart'
import { PlatformDonut } from '@/components/charts/PlatformDonut'
import { DarkCard, DarkCardHeader, DarkCardTitle, DarkCardContent } from '@/components/ui/dark-card'
import { MOCK_METRICS, MOCK_MONTHLY_REVENUE, MOCK_PRODUCTS, MOCK_PAYMENT_SCHEDULE } from '@/lib/mock-data'
import { formatCurrency, formatDate } from '@/lib/calculations/metrics'
import { TrendingUp, TrendingDown, Minus, ShoppingCart, DollarSign, Package, CalendarClock, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { Platform } from '@/lib/types'

export default function DemoDashboardPage() {
  const { gross_revenue, net_revenue, prev_gross_revenue, prev_net_revenue, total_sales } = MOCK_METRICS
  const taxEst = gross_revenue * 0.06
  const taxPct = ((taxEst / gross_revenue) * 100).toFixed(1)
  const currentMonth = MOCK_MONTHLY_REVENUE[MOCK_MONTHLY_REVENUE.length - 1]
  const nextPayment  = MOCK_PAYMENT_SCHEDULE[0]

  return (
    <div>
      <DemoHeader title="Dashboard" />
      <div className="p-6 space-y-5">

        {/* Banner demo */}
        <div
          className="flex items-center justify-between rounded-2xl px-5 py-4"
          style={{ background: 'linear-gradient(135deg, rgba(93,95,239,0.1), rgba(124,58,237,0.05))', border: '1px solid rgba(93,95,239,0.2)' }}
        >
          <p className="text-sm" style={{ color: '#5d5fef' }}>
            <span className="font-bold">Dados de demonstração</span> — valores fictícios para ilustrar o sistema.
          </p>
          <Link
            href="/signup"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 ml-4"
            style={{ background: '#5d5fef', color: '#fff' }}
          >
            Usar meus dados reais <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* KPIs */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>
            Receita — <span className="capitalize normal-case font-semibold" style={{ color: '#5d5fef' }}>Desde sempre</span>
          </p>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard title="Receita Bruta"       value={gross_revenue}     previousValue={prev_gross_revenue} icon={<DollarSign className="w-5 h-5" />} />
            <MetricCard title="Receita Líquida"     value={net_revenue}       previousValue={prev_net_revenue}   icon={<TrendingUp className="w-5 h-5" />}   color="success" />
            <MetricCard title="Total de Vendas"     value={total_sales}       format="number"                    icon={<ShoppingCart className="w-5 h-5" />} color="warning" />
            <MetricCard title="Reservar p/ Imposto" value={taxEst}            subtitle={`${taxPct}% da receita`} icon={<Package className="w-5 h-5" />}      color="danger" />
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-3 gap-4">
          <DarkCard className="col-span-2">
            <DarkCardHeader className="flex items-center justify-between">
              <DarkCardTitle>Receita Total — últimos 6 meses</DarkCardTitle>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(93,95,239,0.1)', color: '#5d5fef' }}>
                {formatCurrency(currentMonth.total)} este mês
              </span>
            </DarkCardHeader>
            <DarkCardContent>
              <RevenueBarChart data={MOCK_MONTHLY_REVENUE} />
            </DarkCardContent>
          </DarkCard>

          <DarkCard>
            <DarkCardHeader>
              <DarkCardTitle>Por Plataforma — {currentMonth.month}</DarkCardTitle>
            </DarkCardHeader>
            <DarkCardContent>
              <PlatformDonut data={currentMonth} />
            </DarkCardContent>
          </DarkCard>
        </div>

        {/* Top produtos + Recebimentos */}
        <div className="grid grid-cols-3 gap-4">
          <DarkCard className="col-span-2">
            <DarkCardHeader className="flex items-center justify-between">
              <DarkCardTitle>Top Produtos</DarkCardTitle>
              <Link href="/demo/produtos" className="text-xs font-semibold" style={{ color: '#5d5fef' }}>Ver todos →</Link>
            </DarkCardHeader>
            <DarkCardContent className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  {MOCK_PRODUCTS.slice(0, 5).map((p, i) => (
                    <tr key={p.name} style={{ borderTop: i > 0 ? '1px solid #f8f9fa' : undefined }} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <p className="font-semibold text-xs truncate max-w-[160px]" style={{ color: '#1a1d2e' }}>{p.name}</p>
                        <PlatformBadge platform={p.platform as Platform} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-xs tabular-nums" style={{ color: '#1a1d2e' }}>{formatCurrency(p.total_revenue)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span style={{ color: '#64748b' }} className="text-xs">{p.total_sales}</span>
                          {p.trend === 'up'     && <TrendingUp className="w-3 h-3" style={{ color: '#28c76f' }} />}
                          {p.trend === 'down'   && <TrendingDown className="w-3 h-3" style={{ color: '#ff6b6b' }} />}
                          {p.trend === 'stable' && <Minus className="w-3 h-3" style={{ color: '#94a3b8' }} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DarkCardContent>
          </DarkCard>

          <DarkCard>
            <DarkCardHeader><DarkCardTitle>Próximos Recebimentos</DarkCardTitle></DarkCardHeader>
            <DarkCardContent className="p-0">
              <div className="px-5 py-2">
                {MOCK_PAYMENT_SCHEDULE.slice(0, 4).map((s, i) => {
                  const days = Math.max(0, Math.ceil((new Date(s.expected_date).getTime() - Date.now()) / 86400000))
                  return (
                    <div key={s.id} className="flex items-center justify-between py-3.5"
                      style={{ borderBottom: i < 3 ? '1px solid #f8f9fa' : undefined }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(93,95,239,0.08)' }}>
                          <CalendarClock className="w-4 h-4" style={{ color: '#5d5fef' }} />
                        </div>
                        <div>
                          <PlatformBadge platform={s.platform as Platform} size="sm" />
                          <p className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>{days === 0 ? 'hoje' : `em ${days} dias`}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm tabular-nums" style={{ color: '#1a1d2e' }}>{formatCurrency(Number(s.amount))}</p>
                    </div>
                  )
                })}
              </div>
            </DarkCardContent>
          </DarkCard>
        </div>

      </div>
    </div>
  )
}
