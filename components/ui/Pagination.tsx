'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  page:       number
  totalPages: number
  total:      number
  perPage:    number
}

export function Pagination({ page, totalPages, total, perPage }: PaginationProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  const from = (page - 1) * perPage + 1
  const to   = Math.min(page * perPage, total)

  // Gerar páginas ao redor da atual
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3)                     pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2)        pages.push('...')
    pages.push(totalPages)
  }

  const btn = (label: React.ReactNode, onClick: () => void, disabled: boolean) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ color: '#64748b' }}
    >
      {label}
    </button>
  )

  return (
    <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid #f0f2f8' }}>
      <p className="text-xs" style={{ color: '#94a3b8' }}>
        <span className="font-semibold" style={{ color: '#64748b' }}>{from}–{to}</span> de <span className="font-semibold" style={{ color: '#64748b' }}>{total.toLocaleString('pt-BR')}</span> transações
      </p>

      <div className="flex items-center gap-1">
        {btn(<ChevronsLeft className="w-3.5 h-3.5" />, () => goTo(1),         page === 1)}
        {btn(<ChevronLeft  className="w-3.5 h-3.5" />, () => goTo(page - 1),  page === 1)}

        {pages.map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-xs" style={{ color: '#94a3b8' }}>…</span>
            : (
              <button
                key={p}
                onClick={() => goTo(p as number)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: p === page ? 'linear-gradient(135deg, #5d5fef, #4f46e5)' : 'transparent',
                  color:      p === page ? '#ffffff' : '#64748b',
                  boxShadow:  p === page ? '0 2px 8px rgba(93,95,239,0.3)' : 'none',
                }}
              >
                {p}
              </button>
            )
        )}

        {btn(<ChevronRight  className="w-3.5 h-3.5" />, () => goTo(page + 1),  page === totalPages)}
        {btn(<ChevronsRight className="w-3.5 h-3.5" />, () => goTo(totalPages), page === totalPages)}
      </div>

      {/* Seletor de linhas por página */}
      <div className="flex items-center gap-2">
        <p className="text-xs" style={{ color: '#94a3b8' }}>Linhas:</p>
        {[25, 50, 100].map(n => (
          <button
            key={n}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              params.set('perPage', String(n))
              params.set('page', '1')
              router.push(`${pathname}?${params.toString()}`)
            }}
            className="px-2 py-1 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: perPage === n ? 'rgba(93,95,239,0.1)' : 'transparent',
              color:      perPage === n ? '#5d5fef' : '#94a3b8',
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
