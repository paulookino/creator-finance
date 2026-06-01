'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateNetAmount, calculateFee } from '@/lib/calculations/platform-fees'
import type { Transaction, Platform } from '@/lib/types'

interface Props {
  transaction: Transaction
  onClose: () => void
  onSaved: () => void
}

const PLATFORM_LABELS: Record<Platform, string> = {
  hotmart: 'Hotmart', kiwify: 'Kiwify', adsense: 'AdSense', manual: 'Manual',
}

const TYPE_LABELS = [
  { value: 'sale',       label: 'Venda' },
  { value: 'refund',     label: 'Reembolso' },
  { value: 'brand_deal', label: 'Brand Deal' },
  { value: 'affiliate',  label: 'Afiliado' },
  { value: 'adsense',    label: 'AdSense' },
  { value: 'subscription', label: 'Assinatura' },
]

export function EditTransactionModal({ transaction: t, onClose, onSaved }: Props) {
  const [name,     setName]     = useState(t.product_name)
  const [amount,   setAmount]   = useState(String(t.amount))
  const [date,     setDate]     = useState(t.transaction_date.split('T')[0])
  const [type,     setType]     = useState(t.type)
  const [platform, setPlatform] = useState<Platform>(t.platform as Platform)
  const [notes,    setNotes]    = useState(t.notes ?? '')
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error,    setError]    = useState('')

  // Fechar com Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const gross = parseFloat(amount)
    const supabase = createClient()

    const { error: dbError } = await supabase
      .from('transactions')
      .update({
        product_name:     name,
        amount:           gross,
        platform_fee:     calculateFee(platform, gross),
        net_amount:       calculateNetAmount(platform, gross),
        transaction_date: new Date(date).toISOString(),
        type,
        platform,
        notes: notes || null,
      })
      .eq('id', t.id)

    if (dbError) {
      setError('Erro ao salvar. Tente novamente.')
      setSaving(false)
      return
    }
    onSaved()
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('transactions').delete().eq('id', t.id)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Editar lançamento</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Nome / Produto</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Valor bruto (R$)</label>
              <input
                type="number" min="0.01" step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Plataforma</label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value as Platform)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {(Object.keys(PLATFORM_LABELS) as Platform[]).map(p => (
                  <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Tipo</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as Transaction['type'])}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TYPE_LABELS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Ex: referência do contrato, parcela, etc."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                confirmDelete
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'text-red-500 hover:bg-red-50 border border-red-200'
              }`}
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {confirmDelete ? 'Confirmar exclusão' : 'Excluir'}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
