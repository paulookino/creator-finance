'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Result {
  id: string
  product_name: string
  platform: string
  amount: number
  status: string
  transaction_date: string
}

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const PLATFORM_COLORS: Record<string, string> = {
  kiwify: '#7c3aed', hotmart: '#e63946', adsense: '#4285f4', manual: '#64748b',
}

export function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<Result[]>([])
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [, startTransition]     = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Busca com debounce
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setOpen(false); return }

    const t = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('transactions')
        .select('id, product_name, platform, amount, status, transaction_date')
        .eq('user_id', user.id)
        .ilike('product_name', `%${query}%`)
        .order('transaction_date', { ascending: false })
        .limit(6)

      setResults(data ?? [])
      setOpen(true)
      setLoading(false)
    }, 300)

    return () => clearTimeout(t)
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && query.trim()) {
      setOpen(false)
      startTransition(() => router.push(`/receita?search=${encodeURIComponent(query.trim())}`))
    }
    if (e.key === 'Escape') { setOpen(false); setQuery('') }
  }

  function goToAll() {
    setOpen(false)
    startTransition(() => router.push(`/receita?search=${encodeURIComponent(query.trim())}`))
  }

  function clear() {
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
        style={{
          background: open ? '#ffffff' : '#f0f2f8',
          border: open ? '1px solid rgba(93,95,239,0.3)' : '1px solid transparent',
          width: open ? 280 : 200,
          boxShadow: open ? '0 0 0 3px rgba(93,95,239,0.08)' : 'none',
        }}
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: loading ? '#5d5fef' : '#94a3b8' }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar produto, valor..."
          className="bg-transparent text-sm outline-none flex-1 min-w-0"
          style={{ color: '#1a1d2e' }}
        />
        {query && (
          <button onClick={clear} className="flex-shrink-0">
            <X className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {open && (
        <div
          className="absolute top-11 left-0 rounded-2xl z-50 overflow-hidden"
          style={{
            width: 320,
            background: '#fff',
            border: '1px solid #e8eaef',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: '#94a3b8' }}>
              Nenhum resultado para "{query}"
            </div>
          ) : (
            <>
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setOpen(false)
                    router.push(`/receita?search=${encodeURIComponent(r.product_name)}`)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                  style={{ borderBottom: '1px solid #f0f2f8' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: PLATFORM_COLORS[r.platform] ?? '#64748b' }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#1a1d2e' }}>
                        {r.product_name}
                      </p>
                      <p className="text-[10px]" style={{ color: '#94a3b8' }}>
                        {new Date(r.transaction_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold tabular-nums flex-shrink-0 ml-2"
                    style={{ color: r.status === 'refunded' ? '#ff6b6b' : '#28c76f' }}
                  >
                    {fmt.format(Number(r.amount))}
                  </span>
                </button>
              ))}
              <button
                onClick={goToAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-indigo-50 transition-colors"
                style={{ color: '#5d5fef' }}
              >
                Ver todos os resultados <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
