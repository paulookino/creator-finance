'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { PlatformBadge } from '@/components/dashboard/PlatformBadge'
import { EditTransactionModal } from './EditTransactionModal'
import { formatCurrency, formatDate } from '@/lib/calculations/metrics'
import type { Transaction, Platform } from '@/lib/types'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  approved:  { label: 'Aprovado',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending:   { label: 'Pendente',  className: 'bg-amber-50 text-amber-700 border-amber-200' },
  refunded:  { label: 'Reembolso', className: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelado', className: 'bg-slate-50 text-slate-600 border-slate-200' },
}

interface Props {
  transactions: Transaction[]
}

export function TransactionsTable({ transactions }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [, startTransition] = useTransition()

  function handleSaved() {
    setEditing(null)
    startTransition(() => router.refresh())
  }

  if (transactions.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-slate-400 text-sm">
        Nenhuma transação ainda. Adicione um lançamento manual ou configure o webhook Kiwify em Integrações.
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400 bg-slate-50">
              <th className="text-left px-6 py-3 font-medium">Data</th>
              <th className="text-left px-4 py-3 font-medium">Produto</th>
              <th className="text-left px-4 py-3 font-medium">Plataforma</th>
              <th className="text-right px-4 py-3 font-medium">Bruto</th>
              <th className="text-right px-4 py-3 font-medium">Taxa</th>
              <th className="text-right px-4 py-3 font-medium">Líquido</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const s = STATUS_LABELS[t.status] ?? STATUS_LABELS.approved
              return (
                <tr key={t.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-3 text-slate-500 whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">{t.product_name}</td>
                  <td className="px-4 py-3"><PlatformBadge platform={t.platform as Platform} size="sm" /></td>
                  <td className={`px-4 py-3 text-right font-mono ${t.status === 'refunded' ? 'text-red-500 line-through' : 'text-slate-800'}`}>
                    {formatCurrency(Number(t.amount))}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-red-400">
                    {Number(t.platform_fee) > 0 ? `–${formatCurrency(Number(t.platform_fee))}` : '–'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-600">
                    {formatCurrency(Number(t.net_amount))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${s.className}`}>{s.label}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(t)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all ml-auto"
                    >
                      <Pencil className="w-3 h-3" />
                      Editar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditTransactionModal
          transaction={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
