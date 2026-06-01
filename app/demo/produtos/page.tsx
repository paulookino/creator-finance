import { DemoHeader } from '@/components/demo/DemoHeader'
import { PlatformBadge } from '@/components/dashboard/PlatformBadge'
import { DarkCard, DarkCardHeader, DarkCardTitle, DarkCardContent } from '@/components/ui/dark-card'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/calculations/metrics'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { Platform } from '@/lib/types'

const total = MOCK_PRODUCTS.reduce((s, p) => s + p.total_revenue, 0)

export default function DemoProdutosPage() {
  return (
    <div>
      <DemoHeader title="Produtos" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Produtos — <span className="normal-case font-semibold" style={{ color: '#5d5fef' }}>Dados de demonstração</span></p>
        </div>

        <DarkCard>
          <DarkCardHeader><DarkCardTitle>Receita por Produto</DarkCardTitle></DarkCardHeader>
          <DarkCardContent className="space-y-3">
            {MOCK_PRODUCTS.map(p => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: '#1a1d2e' }}>{p.name}</span>
                    <PlatformBadge platform={p.platform as Platform} size="sm" />
                  </div>
                  <span className="text-sm font-mono font-bold" style={{ color: '#1a1d2e' }}>{formatCurrency(p.total_revenue)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${Math.min(p.pct_of_total, 100)}%`, background: 'linear-gradient(90deg, #5d5fef, #7c3aed)' }} />
                </div>
              </div>
            ))}
          </DarkCardContent>
        </DarkCard>

        <DarkCard>
          <DarkCardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f2f8' }}>
                  {['Produto','Plataforma','Vendas','Receita','Ticket Médio','%','Tendência'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold uppercase" style={{ color: '#94a3b8', background: '#fafbfc' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_PRODUCTS.map((p, i) => (
                  <tr key={p.name} className="hover:bg-slate-50" style={{ borderTop: i > 0 ? '1px solid #f8f9fa' : undefined }}>
                    <td className="px-6 py-3 font-semibold text-xs" style={{ color: '#1a1d2e' }}>{p.name}</td>
                    <td className="px-4 py-3"><PlatformBadge platform={p.platform as Platform} size="sm" /></td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#64748b' }}>{p.total_sales}</td>
                    <td className="px-4 py-3 font-bold text-xs tabular-nums" style={{ color: '#1a1d2e' }}>{formatCurrency(p.total_revenue)}</td>
                    <td className="px-4 py-3 text-xs tabular-nums" style={{ color: '#64748b' }}>{formatCurrency(p.avg_ticket)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#64748b' }}>{p.pct_of_total.toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      {p.trend === 'up'     && <TrendingUp className="w-4 h-4" style={{ color: '#28c76f' }} />}
                      {p.trend === 'down'   && <TrendingDown className="w-4 h-4" style={{ color: '#ff6b6b' }} />}
                      {p.trend === 'stable' && <Minus className="w-4 h-4" style={{ color: '#94a3b8' }} />}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #e8eaef' }}>
                  <td colSpan={3} className="px-6 py-3 text-sm font-bold" style={{ color: '#1a1d2e' }}>Total</td>
                  <td className="px-4 py-3 font-bold text-sm tabular-nums" style={{ color: '#5d5fef' }}>{formatCurrency(total)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </DarkCardContent>
        </DarkCard>
      </div>
    </div>
  )
}
