'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface KiwifyConnectProps {
  userId: string
  isActive: boolean
}

export function KiwifyConnect({ userId, isActive }: KiwifyConnectProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(!isActive)
  const [saving, setSaving] = useState(false)
  const [active, setActive] = useState(isActive)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL ?? ''
  const webhookUrl = `${baseUrl}/api/webhooks/kiwify/${userId}`

  async function copyUrl() {
    await navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleActivate() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('integrations').upsert({
      user_id: userId,
      platform: 'kiwify',
      is_active: true,
      last_sync_at: new Date().toISOString(),
    }, { onConflict: 'user_id,platform' })
    setActive(true)
    setExpanded(false)
    setSaving(false)
  }

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm bg-violet-600">K</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">Kiwify</h3>
                {active
                  ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> Webhook ativo</span>
                  : <span className="flex items-center gap-1 text-xs text-slate-400"><XCircle className="w-3.5 h-3.5" /> Não configurado</span>
                }
              </div>
              <p className="text-sm text-slate-500 mt-0.5">Recebe notificações de venda em tempo real. Toda compra aprovada entra automaticamente.</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex-shrink-0"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {active ? 'Ver URL' : 'Configurar'}
          </button>
        </div>

        {expanded && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            {/* URL do webhook */}
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">1. Copie esta URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-violet-700 bg-violet-50 border border-violet-200 px-3 py-2 rounded-lg font-mono break-all">
                  {webhookUrl}
                </code>
                <button
                  onClick={copyUrl}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex-shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Instruções */}
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">2. Cole no painel Kiwify</p>
              <div className="bg-slate-50 rounded-lg px-4 py-3 space-y-1.5">
                {[
                  'Acesse kiwify.com.br → sua conta',
                  'Vá em Configurações → Webhooks',
                  'Clique em "+ Novo Webhook"',
                  'Cole a URL acima no campo de URL',
                  'Selecione os eventos: Compra aprovada, Reembolso',
                  'Clique em Salvar',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmar */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleActivate}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Salvando...' : '✓ Configurei o webhook, ativar'}
              </button>
              {active && <p className="text-xs text-emerald-600">Webhook ativo — novas vendas entram automaticamente.</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
