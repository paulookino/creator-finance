import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ManualEntryForm } from '@/components/integrations/ManualEntryForm'
import { KiwifyConnect } from '@/components/integrations/KiwifyConnect'
import { PlatformBadge } from '@/components/dashboard/PlatformBadge'
import { createClient } from '@/lib/supabase/server'
import { ExternalLink, ArrowRight } from 'lucide-react'
import { CsvImport } from '@/components/integrations/CsvImport'
import { formatCurrency, formatDate } from '@/lib/calculations/metrics'
import Link from 'next/link'
import type { Platform } from '@/lib/types'

const STATIC_INTEGRATIONS = [
  {
    id: 'hotmart',
    name: 'Hotmart',
    color: '#e63946',
    description: 'Importa vendas, reembolsos e assinaturas automaticamente via OAuth.',
    status: 'coming_soon',
  },
  {
    id: 'adsense',
    name: 'AdSense',
    color: '#4285f4',
    description: 'Importa receita mensal do Google AdSense via OAuth.',
    status: 'coming_soon',
  },
]

export const dynamic = 'force-dynamic'

export default async function IntegracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: integrations }, { data: recentTxns }] = await Promise.all([
    user
      ? supabase.from('integrations').select('platform,is_active,last_sync_at').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from('transactions').select('id,product_name,platform,amount,net_amount,transaction_date,status')
          .eq('user_id', user.id).order('transaction_date', { ascending: false }).limit(8)
      : Promise.resolve({ data: [] }),
  ])

  const kiwifyStatus = integrations?.find(i => i.platform === 'kiwify')

  return (
    <div>
      <Header title="Integrações" />
      <div className="p-6 space-y-6">

        {/* Kiwify — webhook funcional */}
        <KiwifyConnect userId={user?.id ?? ''} isActive={!!kiwifyStatus?.is_active} />

        {/* Hotmart e AdSense — em breve */}
        {STATIC_INTEGRATIONS.map((integration) => (
          <Card key={integration.id} className="border border-slate-200 shadow-sm opacity-70">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                    style={{ backgroundColor: integration.color }}
                  >
                    {integration.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">{integration.name}</h3>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Em breve</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{integration.description}</p>
                  </div>
                </div>
                <button disabled className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 text-sm font-medium rounded-lg cursor-not-allowed flex-shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Conectar
                </button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Lançamento manual */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Lançamento Manual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">Brand deals, PIX direto, parcerias e qualquer receita fora das plataformas.</p>
            <ManualEntryForm />
          </CardContent>
        </Card>

        {/* Últimas transações recebidas */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Últimas transações recebidas
                {recentTxns && recentTxns.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-400">{recentTxns.length} registro{recentTxns.length !== 1 ? 's' : ''}</span>
                )}
              </CardTitle>
              {recentTxns && recentTxns.length > 0 && (
                <Link href="/receita" className="flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium">
                  Ver todas <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!recentTxns || recentTxns.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">
                Nenhuma transação ainda. Adicione um lançamento manual acima ou configure o webhook Kiwify.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 bg-slate-50">
                    <th className="text-left px-6 py-3 font-medium">Data</th>
                    <th className="text-left px-4 py-3 font-medium">Produto</th>
                    <th className="text-left px-4 py-3 font-medium">Plataforma</th>
                    <th className="text-right px-4 py-3 font-medium">Valor</th>
                    <th className="text-right px-4 py-3 font-medium">Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTxns.map((t) => (
                    <tr key={t.id} className="border-t border-slate-50 hover:bg-slate-50">
                      <td className="px-6 py-3 text-slate-500 whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">{t.product_name}</td>
                      <td className="px-4 py-3"><PlatformBadge platform={t.platform as Platform} size="sm" /></td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">{formatCurrency(Number(t.amount))}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-600">{formatCurrency(Number(t.net_amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Import CSV — histórico de lançamentos */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Importar histórico via CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              Exporte o relatório de vendas da Kiwify ou Hotmart e importe aqui para trazer todo o histórico para o sistema.
              Transações duplicadas são automaticamente ignoradas.
            </p>
            <CsvImport />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
