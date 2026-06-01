import { Header } from '@/components/layout/Header'
import { PlatformBadge } from '@/components/dashboard/PlatformBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserId, getProductMetrics } from '@/lib/queries'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { type Period, PERIOD_OPTIONS } from '@/lib/periods'
import { formatCurrency } from '@/lib/calculations/metrics'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { Platform } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params  = await searchParams
  const period  = (params.period as Period) ?? 'all'
  const userId  = await getUserId()
  const products = userId ? await getProductMetrics(userId, period) : []
  const periodLabel = PERIOD_OPTIONS.find(o => o.value === period)?.label ?? 'Desde sempre'

  const isEmpty      = products.length === 0
  const totalRevenue = products.reduce((s, p) => s + p.total_revenue, 0)

  return (
    <div>
      <Header title="Produtos" />
      <div className="p-6 space-y-6">

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-700">Receita por Produto</CardTitle>
                <p className="text-xs mt-0.5 capitalize" style={{ color: '#5d5fef' }}>{periodLabel}</p>
              </div>
              <PeriodSelector current={period} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{p.name}</span>
                    <PlatformBadge platform={p.platform as Platform} size="sm" />
                  </div>
                  <span className="text-sm font-mono font-semibold text-slate-800">{formatCurrency(p.total_revenue)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.min(p.pct_of_total, 100)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Todos os produtos</h2>
            </div>
            {isEmpty ? (
              <div className="px-6 py-12 text-center text-slate-400 text-sm">
                Nenhum produto ainda. Adicione transações em Integrações para ver seus produtos aqui.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 bg-slate-50">
                    <th className="text-left px-6 py-3 font-medium">Produto</th>
                    <th className="text-left px-4 py-3 font-medium">Plataforma</th>
                    <th className="text-right px-4 py-3 font-medium">Vendas</th>
                    <th className="text-right px-4 py-3 font-medium">Receita Total</th>
                    <th className="text-right px-4 py-3 font-medium">Ticket Médio</th>
                    <th className="text-right px-4 py-3 font-medium">% do Total</th>
                    <th className="text-center px-4 py-3 font-medium">Tendência</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.name} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">{p.name}</td>
                      <td className="px-4 py-3"><PlatformBadge platform={p.platform as Platform} size="sm" /></td>
                      <td className="px-4 py-3 text-right text-slate-600">{p.total_sales}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">{formatCurrency(p.total_revenue)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{formatCurrency(p.avg_ticket)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-indigo-400" style={{ width: `${Math.min(p.pct_of_total, 100)}%` }} />
                          </div>
                          <span className="text-slate-600 w-10 text-right">{p.pct_of_total.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.trend === 'up'     && <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />}
                        {p.trend === 'down'   && <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />}
                        {p.trend === 'stable' && <Minus className="w-4 h-4 text-slate-400 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={3} className="px-6 py-3 text-sm font-semibold text-slate-700">Total</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{formatCurrency(totalRevenue)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
