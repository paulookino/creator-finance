import { DemoHeader } from '@/components/demo/DemoHeader'
import { PlatformBadge } from '@/components/dashboard/PlatformBadge'
import { DarkCard, DarkCardHeader, DarkCardTitle, DarkCardContent } from '@/components/ui/dark-card'
import { MOCK_PAYMENT_SCHEDULE } from '@/lib/mock-data'
import { formatCurrency, formatDate } from '@/lib/calculations/metrics'
import { Info } from 'lucide-react'
import type { Platform } from '@/lib/types'

const RULES = [
  { platform: 'hotmart' as Platform, rule: 'D+30 após aprovação, em ciclos quinzenais' },
  { platform: 'kiwify'  as Platform, rule: 'Toda sexta-feira, D+14 após aprovação' },
  { platform: 'adsense' as Platform, rule: 'Todo dia 21 do mês seguinte (mín. $100)' },
  { platform: 'manual'  as Platform, rule: 'Definido no contrato' },
]
const total = MOCK_PAYMENT_SCHEDULE.reduce((s, p) => s + Number(p.amount), 0)

export default function DemoCalendarioPage() {
  return (
    <div>
      <DemoHeader title="Calendário de Recebimentos" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Recebimentos — <span className="normal-case font-semibold" style={{ color: '#5d5fef' }}>Dados de demonstração</span></p>
        </div>

        <DarkCard>
          <DarkCardHeader><DarkCardTitle>Quando cada plataforma paga</DarkCardTitle></DarkCardHeader>
          <DarkCardContent>
            <div className="grid grid-cols-2 gap-3">
              {RULES.map(({ platform, rule }) => (
                <div key={platform} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#f8f9fa' }}>
                  <PlatformBadge platform={platform} />
                  <p className="text-sm" style={{ color: '#64748b' }}>{rule}</p>
                </div>
              ))}
            </div>
          </DarkCardContent>
        </DarkCard>

        <DarkCard>
          <DarkCardHeader>
            <div className="flex items-center justify-between">
              <DarkCardTitle>Próximos Recebimentos</DarkCardTitle>
              <span className="text-sm font-mono font-bold" style={{ color: '#5d5fef' }}>Total: {formatCurrency(total)}</span>
            </div>
          </DarkCardHeader>
          <DarkCardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: '1px solid #f0f2f8' }}>
                {['Data','Plataforma','Período','Valor','Status'].map(h => <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold uppercase" style={{ color: '#94a3b8', background: '#fafbfc' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {MOCK_PAYMENT_SCHEDULE.map((s, i) => {
                  const days = Math.ceil((new Date(s.expected_date).getTime() - Date.now()) / 86400000)
                  return (
                    <tr key={s.id} className="hover:bg-slate-50" style={{ borderTop: i > 0 ? '1px solid #f8f9fa' : undefined }}>
                      <td className="px-6 py-3">
                        <p className="font-semibold text-xs" style={{ color: '#1a1d2e' }}>{formatDate(s.expected_date)}</p>
                        <p className="text-[10px]" style={{ color: '#94a3b8' }}>{days > 0 ? `em ${days} dias` : 'hoje'}</p>
                      </td>
                      <td className="px-4 py-3"><PlatformBadge platform={s.platform as Platform} /></td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>
                        {s.period_start && s.period_end ? `${formatDate(s.period_start)} – ${formatDate(s.period_end)}` : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-xs" style={{ color: '#1a1d2e' }}>{formatCurrency(Number(s.amount))}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full" style={{ background: 'rgba(255,159,67,0.1)', color: '#ff9f43' }}>Previsto</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </DarkCardContent>
        </DarkCard>

        <div className="flex items-start gap-2 text-xs" style={{ color: '#94a3b8' }}>
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          Com conta real, os recebimentos são calculados automaticamente a partir das suas transações Kiwify e Hotmart.
        </div>
      </div>
    </div>
  )
}
