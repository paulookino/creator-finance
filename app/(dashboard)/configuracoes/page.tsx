'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { TAX_REGIME_LABELS, DEFAULT_RATES } from '@/lib/calculations/taxes'
import type { TaxRegime } from '@/lib/types'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('simples')
  const [simplesRate, setSimplesRate] = useState('6')
  const [meiDas, setMeiDas] = useState('75.90')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, tax_regime, simples_rate, mei_das')
        .eq('id', user.id)
        .single()
      if (profile) {
        setName(profile.name ?? '')
        setTaxRegime(profile.tax_regime as TaxRegime ?? 'simples')
        setSimplesRate(String((profile.simples_rate * 100).toFixed(1)))
        setMeiDas(String(profile.mei_das ?? 75.90))
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        name,
        tax_regime: taxRegime,
        simples_rate: parseFloat(simplesRate) / 100,
        mei_das: parseFloat(meiDas),
      })
      .eq('id', user.id)

    if (dbError) {
      setError('Erro ao salvar. Tente novamente.')
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div>
        <Header title="Configurações" />
        <div className="p-6 flex items-center gap-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Configurações" />
      <div className="p-6 max-w-xl space-y-6">

        <form onSubmit={handleSave} className="space-y-6">

          {/* Perfil */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Nome</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
                <input
                  value={email}
                  disabled
                  className="w-full border border-slate-100 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">O email não pode ser alterado aqui.</p>
              </div>
            </CardContent>
          </Card>

          {/* Tributação */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Tributação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Regime tributário</label>
                <select
                  value={taxRegime}
                  onChange={(e) => {
                    const r = e.target.value as TaxRegime
                    setTaxRegime(r)
                    if (r !== 'mei') setSimplesRate(String((DEFAULT_RATES[r] * 100).toFixed(1)))
                  }}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {(Object.keys(TAX_REGIME_LABELS) as TaxRegime[]).map((r) => (
                    <option key={r} value={r}>{TAX_REGIME_LABELS[r]}</option>
                  ))}
                </select>
              </div>

              {taxRegime === 'mei' ? (
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Valor fixo do DAS (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={meiDas}
                    onChange={(e) => setMeiDas(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Valor mensal fixo do DAS MEI. Atualize conforme reajuste anual.</p>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Alíquota efetiva (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={simplesRate}
                    onChange={(e) => setSimplesRate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Alíquota que seu contador calculou para seu faturamento atual.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4" /> Configurações salvas.
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar configurações
          </button>

        </form>
      </div>
    </div>
  )
}
