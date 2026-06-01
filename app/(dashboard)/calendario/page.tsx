import { Header } from '@/components/layout/Header'
import { PlatformBadge } from '@/components/dashboard/PlatformBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserId, getPaymentSchedule } from '@/lib/queries'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { type Period, PERIOD_OPTIONS } from '@/lib/periods'
import { formatCurrency, formatDate } from '@/lib/calculations/metrics'
import { Info, AlertTriangle } from 'lucide-react'
import type { Platform } from '@/lib/types'

const PLATFORM_RULES = [
  { platform: 'hotmart' as Platform, rule: 'D+30 após aprovação, em ciclos quinzenais (dias 1 e 15 do mês)' },
  { platform: 'kiwify' as Platform,  rule: 'Toda sexta-feira, D+14 após aprovação' },
  { platform: 'adsense' as Platform, rule: 'Todo dia 21 do mês seguinte (mínimo $100)' },
  { platform: 'manual' as Platform,  rule: 'Definido no contrato / combinado diretamente' },
]

export const dynamic = 'force-dynamic'

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params   = await searchParams
  const period   = (params.period as Period) ?? 'all'
  const userId   = await getUserId()
  const schedule = userId ? await getPaymentSchedule(userId) : []
  const periodLabel = PERIOD_OPTIONS.find(o => o.value === period)?.label ?? 'Desde sempre'

  const hasData = schedule.length > 0
  const total   = schedule.reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div>
      <Header title="Calendário de Recebimentos" />
      <div className="p-6 space-y-5">

        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
            Recebimentos — <span className="capitalize normal-case font-semibold" style={{ color: '#5d5fef' }}>{periodLabel}</span>
          </p>
          <PeriodSelector current={period} />
        </div>

        {!hasData && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600">
            <Info className="w-4 h-4 flex-shrink-0" />
            Nenhum recebimento estimado ainda. Lançamentos manuais não geram datas de recebimento — adicione transações Kiwify ou Hotmart para estimativas automáticas.
          </div>
        )}

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Quando cada plataforma paga</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORM_RULES.map(({ platform, rule }) => (
                <div key={platform} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <PlatformBadge platform={platform} />
                  <p className="text-sm text-slate-600">{rule}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">Próximos Recebimentos</CardTitle>
              <span className="text-sm font-mono font-semibold text-indigo-600">Total: {formatCurrency(total)}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {schedule.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400 text-sm">
                Nenhum recebimento previsto. Adicione transações Kiwify ou Hotmart para estimativas automáticas.
              </div>
            ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 bg-slate-50">
                  <th className="text-left px-6 py-3 font-medium">Data Prevista</th>
                  <th className="text-left px-4 py-3 font-medium">Plataforma</th>
                  <th className="text-left px-4 py-3 font-medium">Período de Referência</th>
                  <th className="text-right px-4 py-3 font-medium">Valor Estimado</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s) => {
                  const days = Math.ceil((new Date(s.expected_date).getTime() - Date.now()) / 86400000)
                  return (
                    <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <p className="font-medium text-slate-800">{formatDate(s.expected_date)}</p>
                        <p className="text-xs text-slate-400">
                          {days > 0 ? `em ${days} dias` : days === 0 ? 'hoje' : `atrasado ${Math.abs(days)} dias`}
                        </p>
                      </td>
                      <td className="px-4 py-3"><PlatformBadge platform={s.platform as Platform} /></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {s.period_start && s.period_end
                          ? `${formatDate(s.period_start)} – ${formatDate(s.period_end)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">{formatCurrency(Number(s.amount))}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${
                          s.status === 'received' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          s.status === 'delayed'  ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {s.status === 'received' ? 'Recebido' : s.status === 'delayed' ? 'Atrasado' : 'Previsto'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            )}
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 text-xs text-slate-400">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          Valores estimados com base nas transações aprovadas e nas regras de pagamento de cada plataforma.
        </div>

      </div>
    </div>
  )
}
