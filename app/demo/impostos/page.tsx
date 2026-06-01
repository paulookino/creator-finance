import { DemoHeader } from '@/components/demo/DemoHeader'
import { DarkCard, DarkCardHeader, DarkCardTitle, DarkCardContent } from '@/components/ui/dark-card'
import { MOCK_METRICS, MOCK_MONTHLY_REVENUE } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/calculations/metrics'
import { estimateTax } from '@/lib/calculations/taxes'
import { AlertTriangle, Info } from 'lucide-react'

const regime = 'simples', rate = 0.06
const { gross_revenue } = MOCK_METRICS
const tax = estimateTax(gross_revenue, regime, rate)
const taxPct = ((tax / gross_revenue) * 100).toFixed(1)

export default function DemoImpostosPage() {
  return (
    <div>
      <DemoHeader title="Impostos" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Impostos — <span className="normal-case font-semibold" style={{ color: '#5d5fef' }}>Dados de demonstração</span></p>
        </div>

        <DarkCard>
          <DarkCardHeader><DarkCardTitle>Configuração Tributária</DarkCardTitle></DarkCardHeader>
          <DarkCardContent>
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-xs text-slate-500 mb-1">Regime</p><p className="font-semibold text-slate-800">Simples Nacional</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Alíquota</p><p className="font-semibold text-slate-800">6,0%</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Próximo vencimento</p><p className="font-semibold text-slate-800">20/07/2026</p></div>
            </div>
          </DarkCardContent>
        </DarkCard>

        <DarkCard>
          <DarkCardHeader><DarkCardTitle>Resumo — Junho 2026 (demo)</DarkCardTitle></DarkCardHeader>
          <DarkCardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #f0f2f8' }}>
                <span className="text-sm text-slate-600">Receita bruta</span>
                <span className="font-mono font-semibold">{formatCurrency(gross_revenue)}</span>
              </div>
              <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #f0f2f8' }}>
                <span className="text-sm text-slate-600">Imposto estimado (6%)</span>
                <span className="font-mono font-semibold text-amber-600">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /><span className="text-sm font-semibold text-amber-800">Separar este mês</span></div>
                <span className="font-mono font-bold text-lg text-amber-700">{formatCurrency(tax)}</span>
              </div>
            </div>
          </DarkCardContent>
        </DarkCard>

        <DarkCard>
          <DarkCardHeader><DarkCardTitle>Histórico</DarkCardTitle></DarkCardHeader>
          <DarkCardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: '1px solid #f0f2f8' }}>
                {['Mês','Receita Bruta','Imposto Estimado'].map(h => <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold uppercase" style={{ color: '#94a3b8', background: '#fafbfc' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {MOCK_MONTHLY_REVENUE.map(m => (
                  <tr key={m.month} className="hover:bg-slate-50" style={{ borderTop: '1px solid #f8f9fa' }}>
                    <td className="px-6 py-3 font-medium capitalize" style={{ color: '#1a1d2e' }}>{m.month}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: '#64748b' }}>{formatCurrency(m.total)}</td>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: '#ff9f43' }}>{formatCurrency(estimateTax(m.total, regime, rate))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DarkCardContent>
        </DarkCard>

        <div className="flex items-start gap-2 text-xs" style={{ color: '#94a3b8' }}>
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          Estimativas demonstrativas. Com sua conta real, os cálculos usam seu regime tributário e transações reais.
        </div>
      </div>
    </div>
  )
}
