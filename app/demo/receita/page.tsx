import { DemoHeader } from '@/components/demo/DemoHeader'
import { PlatformBadge } from '@/components/dashboard/PlatformBadge'
import { DarkCard, DarkCardContent } from '@/components/ui/dark-card'
import { MOCK_TRANSACTIONS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/calculations/metrics'
import type { Platform } from '@/lib/types'

const SUMMARY = {
  gross:    MOCK_TRANSACTIONS.filter(t => t.status === 'approved').reduce((s, t) => s + Number(t.amount), 0),
  fees:     MOCK_TRANSACTIONS.filter(t => t.status === 'approved').reduce((s, t) => s + Number(t.platform_fee), 0),
  net:      MOCK_TRANSACTIONS.filter(t => t.status === 'approved').reduce((s, t) => s + Number(t.net_amount), 0),
  refunds:  MOCK_TRANSACTIONS.filter(t => t.status === 'refunded').reduce((s, t) => s + Number(t.amount), 0),
  avgTicket:0,
}
SUMMARY.avgTicket = MOCK_TRANSACTIONS.filter(t => t.status === 'approved').length
  ? SUMMARY.gross / MOCK_TRANSACTIONS.filter(t => t.status === 'approved').length : 0

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  approved:  { bg: 'rgba(40,199,111,0.1)',  color: '#28c76f' },
  pending:   { bg: 'rgba(255,159,67,0.1)',   color: '#ff9f43' },
  refunded:  { bg: 'rgba(255,107,107,0.1)',  color: '#ff6b6b' },
  cancelled: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
}
const STATUS_LABELS: Record<string, string> = {
  approved: 'Aprovado', pending: 'Pendente', refunded: 'Reembolso', cancelled: 'Cancelado',
}

export default function DemoReceitaPage() {
  return (
    <div>
      <DemoHeader title="Receita" />
      <div className="p-6 space-y-5">

        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
            Receita — <span className="normal-case font-semibold" style={{ color: '#5d5fef' }}>Dados de demonstração</span>
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Bruto',    value: SUMMARY.gross,     color: '#1a1d2e', bg: 'rgba(93,95,239,0.06)' },
            { label: 'Total de Taxas', value: SUMMARY.fees,      color: '#ff6b6b', bg: 'rgba(255,107,107,0.06)' },
            { label: 'Total Líquido',  value: SUMMARY.net,       color: '#28c76f', bg: 'rgba(40,199,111,0.06)' },
            { label: 'Reembolsos',     value: SUMMARY.refunds,   color: '#ff9f43', bg: 'rgba(255,159,67,0.06)' },
            { label: 'Ticket Médio',   value: SUMMARY.avgTicket, color: '#5d5fef', bg: 'rgba(93,95,239,0.06)' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="rounded-2xl p-4" style={{ background: bg, border: '1px solid rgba(0,0,0,0.04)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>{label}</p>
              <p className="text-lg font-bold tabular-nums" style={{ color }}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        <DarkCard>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid #f0f2f8' }}>
            <h2 className="text-sm font-bold" style={{ color: '#1a1d2e' }}>Transações <span className="text-xs font-normal" style={{ color: '#94a3b8' }}>{MOCK_TRANSACTIONS.length} registros (demo)</span></h2>
          </div>
          <DarkCardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f2f8' }}>
                    {['Data', 'Produto', 'Plataforma', 'Bruto', 'Taxa', 'Líquido', 'Status'].map(h => (
                      <th key={h} className={`py-3 text-[11px] font-semibold uppercase tracking-wider ${['Bruto','Taxa','Líquido'].includes(h) ? 'text-right pr-4' : h === 'Status' ? 'text-center px-4' : 'text-left'} ${h === 'Data' ? 'pl-6 pr-4' : 'px-4'}`}
                        style={{ color: '#94a3b8', background: '#fafbfc' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TRANSACTIONS.map((t, i) => {
                    const s = STATUS_COLORS[t.status] ?? STATUS_COLORS.cancelled
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors"
                        style={{ borderBottom: i < MOCK_TRANSACTIONS.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                        <td className="pl-6 pr-4 py-3 whitespace-nowrap">
                          <p className="text-xs font-semibold" style={{ color: '#1a1d2e' }}>{new Date(t.transaction_date).toLocaleDateString('pt-BR')}</p>
                          <p className="text-[10px]" style={{ color: '#94a3b8' }}>{new Date(t.transaction_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <p className="text-xs font-semibold truncate" style={{ color: '#1a1d2e' }}>{t.product_name}</p>
                        </td>
                        <td className="px-4 py-3"><PlatformBadge platform={t.platform as Platform} size="sm" /></td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-bold tabular-nums" style={{ color: t.status === 'refunded' ? '#ff6b6b' : '#1a1d2e', textDecoration: t.status === 'refunded' ? 'line-through' : 'none' }}>
                            {formatCurrency(Number(t.amount))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right"><span className="text-xs tabular-nums" style={{ color: '#ff6b6b' }}>{Number(t.platform_fee) > 0 ? `–${formatCurrency(Number(t.platform_fee))}` : '–'}</span></td>
                        <td className="px-4 py-3 text-right"><span className="text-xs font-bold tabular-nums" style={{ color: '#28c76f' }}>{formatCurrency(Number(t.net_amount))}</span></td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full" style={{ background: s.bg, color: s.color }}>
                            {STATUS_LABELS[t.status] ?? t.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </DarkCardContent>
        </DarkCard>

      </div>
    </div>
  )
}
