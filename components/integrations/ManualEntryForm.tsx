'use client'

import { useState } from 'react'
import { Plus, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ManualEntryForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState<'brand_deal' | 'sale' | 'affiliate'>('brand_deal')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState<{ name: string; amount: number } | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !amount || !date) return

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Sessão expirada. Faça login novamente.')
      setLoading(false)
      return
    }

    const grossAmount = parseFloat(amount)

    const { error: dbError } = await supabase.from('transactions').insert({
      user_id: user.id,
      platform: 'manual',
      external_id: `manual-${Date.now()}`,
      product_name: name,
      amount: grossAmount,
      platform_fee: 0,
      net_amount: grossAmount,
      type,
      status: 'approved',
      transaction_date: new Date(date).toISOString(),
    })

    if (dbError) {
      setError('Erro ao salvar. Tente novamente.')
      setLoading(false)
      return
    }

    setSaved({ name, amount: grossAmount })
    setName('')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setType('brand_deal')
    setLoading(false)
    // Invalida o cache do server component
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Nome / Descrição</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex: Brand Deal Marca X"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Valor (R$)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="5000"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="brand_deal">Brand Deal</option>
            <option value="sale">Venda direta</option>
            <option value="affiliate">Afiliado</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {saved && (
        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-emerald-700 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">"{saved.name}" salvo — R$ {saved.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push('/receita')}
              className="flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline"
            >
              Ver em Receita <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-emerald-300">·</span>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline"
            >
              Ver Dashboard <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Adicionar lançamento
      </button>
    </form>
  )
}
