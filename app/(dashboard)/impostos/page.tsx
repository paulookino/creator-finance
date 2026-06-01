import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserId, getProfile, getMetrics, getMonthlyRevenue } from '@/lib/queries'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { PERIOD_OPTIONS } from '@/lib/periods'
import { formatCurrency } from '@/lib/calculations/metrics'
import { estimateTax, TAX_REGIME_LABELS } from '@/lib/calculations/taxes'
import type { TaxRegime } from '@/lib/types'
import { AlertTriangle, Info } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ImpostosPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: periodParam } = await searchParams
  const period = (periodParam as import('@/lib/periods').Period) ?? 'all'
  const userId  = await getUserId()
  const profile = await getProfile()

  const [metrics, monthlyRevenue] = userId
    ? await Promise.all([getMetrics(userId, period), getMonthlyRevenue(userId, period)])
    : [{ gross_revenue: 0, net_revenue: 0, tax_estimate: 0, prev_gross_revenue: 0, prev_net_revenue: 0, total_sales: 0, total_refunds: 0, avg_ticket: 0 }, []]

  const isEmpty = monthlyRevenue.length === 0

  const regime  = (profile?.tax_regime as TaxRegime) ?? 'simples'
  const rate    = profile?.simples_rate ?? 0.06
  const meiFlatValue = profile?.mei_das ?? 75.90

  const { gross_revenue } = metrics
  const taxEstimate   = estimateTax(gross_revenue, regime, rate, meiFlatValue)
  const projectedAnnual = gross_revenue * 12
  const annualTax     = estimateTax(projectedAnnual, regime, rate, meiFlatValue)
  const taxPct        = gross_revenue > 0 ? ((taxEstimate / gross_revenue) * 100).toFixed(1) : '0'

  const historyMonths = monthlyRevenue

  const periodLabel = PERIOD_OPTIONS.find(o => o.value === period)?.label ?? 'Desde sempre'

  return (
    <div>
      <Header title="Impostos" />
      <div className="p-6 space-y-5">

        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
            Impostos — <span className="capitalize normal-case font-semibold" style={{ color: '#5d5fef' }}>{periodLabel}</span>
          </p>
          <PeriodSelector current={period} />
        </div>

        {isEmpty && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Exibindo dados de exemplo. Adicione transações reais para ver seus impostos calculados.
          </div>
        )}

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Configuração Tributária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Regime tributário</p>
                <p className="font-semibold text-slate-800">{TAX_REGIME_LABELS[regime]}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Alíquota efetiva</p>
                <p className="font-semibold text-slate-800">
                  {regime === 'mei' ? `R$ ${meiFlatValue}/mês` : `${(rate * 100).toFixed(1)}%`}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Alterar</p>
                <a href="/configuracoes" className="text-sm text-indigo-600 hover:underline">Configurações →</a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Resumo — <span className="capitalize">{metrics.period_label}</span>
              </CardTitle>
              {!metrics.is_current_month && (
                <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                  Dados históricos
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-600">Receita bruta do mês</span>
                <span className="font-mono font-semibold text-slate-800">{formatCurrency(gross_revenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-600">Imposto estimado ({regime === 'mei' ? 'DAS fixo' : `${(rate * 100).toFixed(1)}%`})</span>
                <span className="font-mono font-semibold text-amber-600">{formatCurrency(taxEstimate)}</span>
              </div>
              <div className={`flex justify-between items-center py-3 px-4 rounded-lg bg-amber-50 border border-amber-200`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">Separar este mês</span>
                </div>
                <span className="font-mono font-bold text-lg text-amber-700">{formatCurrency(taxEstimate)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Histórico</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 bg-slate-50">
                  <th className="text-left px-6 py-3 font-medium">Mês</th>
                  <th className="text-right px-4 py-3 font-medium">Receita Bruta</th>
                  <th className="text-right px-4 py-3 font-medium">Imposto Estimado</th>
                </tr>
              </thead>
              <tbody>
                {historyMonths.map((m) => {
                  const tax = estimateTax(m.total, regime, rate, meiFlatValue)
                  return (
                    <tr key={m.month} className="border-t border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-800 capitalize">{m.month}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{formatCurrency(m.total)}</td>
                      <td className="px-4 py-3 text-right font-mono text-amber-600">{formatCurrency(tax)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Projeção anual</p>
                <p className="text-xs text-slate-400">Base: receita do mês atual × 12</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono text-amber-600">{formatCurrency(annualTax)}</p>
                <p className="text-xs text-slate-400">imposto estimado no ano</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 text-xs text-slate-400">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          Estimativas. Consulte seu contador para declarações oficiais.
        </div>

      </div>
    </div>
  )
}
