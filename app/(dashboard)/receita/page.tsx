export const dynamic = 'force-dynamic'

import { Header } from '@/components/layout/Header'
import { PlatformBadge } from '@/components/dashboard/PlatformBadge'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { Pagination } from '@/components/ui/Pagination'
import { DarkCard, DarkCardContent } from '@/components/ui/dark-card'
import { getUserId, getTransactionsPaged, getTransactionSummary } from '@/lib/queries'
import { formatCurrency } from '@/lib/calculations/metrics'
import { type Period, PERIOD_OPTIONS } from '@/lib/periods'
import type { Platform } from '@/lib/types'

export default async function ReceitaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params  = await searchParams
  const userId  = await getUserId()
  const period  = (params.period as Period) ?? 'all'
  const page    = Math.max(1, parseInt(params.page    ?? '1',  10))
  const perPage = Math.min(100, parseInt(params.perPage ?? '50', 10))

  const [{ transactions, total, totalPages }, summary] = await Promise.all([
    userId
      ? getTransactionsPaged(userId, { page, perPage, platform: params.platform, status: params.status, type: params.type, search: params.search, period })
      : Promise.resolve({ transactions: [], total: 0, totalPages: 0 }),
    userId
      ? getTransactionSummary(userId, { platform: params.platform, status: params.status, search: params.search, period })
      : Promise.resolve({ totalGross: 0, totalFees: 0, totalNet: 0, totalRefunds: 0, avgTicket: 0, salesCount: 0 }),
  ])

  const { totalGross, totalFees, totalNet, totalRefunds, avgTicket } = summary
  const periodLabel = PERIOD_OPTIONS.find(o => o.value === period)?.label ?? 'Desde sempre'

  const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    approved:  { bg: 'rgba(40,199,111,0.1)',  color: '#28c76f' },
    pending:   { bg: 'rgba(255,159,67,0.1)',   color: '#ff9f43' },
    refunded:  { bg: 'rgba(255,107,107,0.1)',  color: '#ff6b6b' },
    cancelled: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
  }
  const STATUS_LABELS: Record<string, string> = {
    approved: 'Aprovado', pending: 'Pendente', refunded: 'Reembolso', cancelled: 'Cancelado',
  }

  return (
    <div>
      <Header title="Receita" />
      <div className="p-6 space-y-5">

        {/* Seletor de período */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
            Receita — <span className="capitalize normal-case font-semibold" style={{ color: '#5d5fef' }}>{periodLabel}</span>
          </p>
          <PeriodSelector current={period} />
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Bruto',    value: totalGross,   color: '#1a1d2e', bg: 'rgba(93,95,239,0.06)' },
            { label: 'Total de Taxas', value: totalFees,    color: '#ff6b6b', bg: 'rgba(255,107,107,0.06)' },
            { label: 'Total Líquido',  value: totalNet,     color: '#28c76f', bg: 'rgba(40,199,111,0.06)' },
            { label: 'Reembolsos',     value: totalRefunds, color: '#ff9f43', bg: 'rgba(255,159,67,0.06)' },
            { label: 'Ticket Médio',   value: avgTicket,    color: '#5d5fef', bg: 'rgba(93,95,239,0.06)' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="rounded-2xl p-4" style={{ background: bg, border: '1px solid rgba(0,0,0,0.04)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>{label}</p>
              <p className="text-lg font-bold tabular-nums" style={{ color }}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <DarkCard>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid #f0f2f8' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold" style={{ color: '#1a1d2e' }}>Transações</h2>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                  {total.toLocaleString('pt-BR')} registro{total !== 1 ? 's' : ''}
                  {(params.platform || params.status || params.search) && ' (filtrado)'}
                </p>
              </div>
            </div>
            <TransactionFilters />
          </div>

          <DarkCardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                  {total === 0 ? 'Nenhuma transação no período selecionado.' : 'Nenhuma transação para os filtros selecionados.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f0f2f8' }}>
                      {['Data', 'Produto', 'Plataforma', 'Bruto', 'Taxa', 'Líquido', 'Status', ''].map(h => (
                        <th key={h}
                          className={`py-3 text-[11px] font-semibold uppercase tracking-wider ${
                            ['Bruto','Taxa','Líquido'].includes(h) ? 'text-right pr-4' :
                            h === 'Status' ? 'text-center px-4' : 'text-left'
                          } ${h === 'Data' ? 'pl-6 pr-4' : 'px-4'}`}
                          style={{ color: '#94a3b8', background: '#fafbfc' }}
                        >{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, i) => {
                      const s = STATUS_COLORS[t.status] ?? STATUS_COLORS.cancelled
                      return (
                        <tr key={t.id} className="group transition-colors hover:bg-slate-50"
                          style={{ borderBottom: i < transactions.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                          <td className="pl-6 pr-4 py-3 whitespace-nowrap">
                            <p className="text-xs font-semibold" style={{ color: '#1a1d2e' }}>
                              {new Date(t.transaction_date).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-[10px]" style={{ color: '#94a3b8' }}>
                              {new Date(t.transaction_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
                            <p className="text-xs font-semibold truncate" style={{ color: '#1a1d2e' }}>{t.product_name}</p>
                            {t.buyer_email && <p className="text-[10px] truncate" style={{ color: '#94a3b8' }}>{t.buyer_email}</p>}
                          </td>
                          <td className="px-4 py-3"><PlatformBadge platform={t.platform as Platform} size="sm" /></td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-bold tabular-nums"
                              style={{ color: t.status === 'refunded' ? '#ff6b6b' : '#1a1d2e',
                                       textDecoration: t.status === 'refunded' ? 'line-through' : 'none' }}>
                              {formatCurrency(Number(t.amount))}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs tabular-nums" style={{ color: '#ff6b6b' }}>
                              {Number(t.platform_fee) > 0 ? `–${formatCurrency(Number(t.platform_fee))}` : '–'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-bold tabular-nums" style={{ color: '#28c76f' }}>
                              {formatCurrency(Number(t.net_amount))}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full"
                              style={{ background: s.bg, color: s.color }}>
                              {STATUS_LABELS[t.status] ?? t.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 w-8" />
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DarkCardContent>

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} total={total} perPage={perPage} />
          )}
        </DarkCard>

      </div>
    </div>
  )
}
