'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useTransition, useState, useEffect } from 'react'

const PLATFORMS = [
  { value: 'all',     label: 'Todas' },
  { value: 'kiwify',  label: 'Kiwify' },
  { value: 'hotmart', label: 'Hotmart' },
  { value: 'adsense', label: 'AdSense' },
  { value: 'manual',  label: 'Manual' },
]

const STATUSES = [
  { value: 'all',       label: 'Todos' },
  { value: 'approved',  label: 'Aprovado' },
  { value: 'pending',   label: 'Pendente' },
  { value: 'refunded',  label: 'Reembolso' },
  { value: 'cancelled', label: 'Cancelado' },
]

export function TransactionFilters() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const platform = searchParams.get('platform') ?? 'all'
  const status   = searchParams.get('status')   ?? 'all'
  const search   = searchParams.get('search')   ?? ''
  const [searchInput, setSearchInput] = useState(search)

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '') params.delete(key)
    else params.set(key, value)
    params.delete('page') // reset para página 1
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  // Debounce na busca
  useEffect(() => {
    const t = setTimeout(() => setParam('search', searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const hasFilters = platform !== 'all' || status !== 'all' || search !== ''

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('platform')
    params.delete('status')
    params.delete('search')
    params.delete('page')
    setSearchInput('')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Busca */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[180px] max-w-[260px]"
        style={{ background: '#f0f2f8' }}
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Buscar produto..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="bg-transparent text-sm outline-none flex-1 min-w-0"
          style={{ color: '#1a1d2e' }}
        />
        {searchInput && (
          <button onClick={() => setSearchInput('')}>
            <X className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
          </button>
        )}
      </div>

      {/* Plataforma */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#f0f2f8' }}>
        {PLATFORMS.map(p => (
          <button
            key={p.value}
            onClick={() => setParam('platform', p.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: platform === p.value ? '#fff' : 'transparent',
              color:      platform === p.value ? '#5d5fef' : '#94a3b8',
              boxShadow:  platform === p.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Status */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#f0f2f8' }}>
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setParam('status', s.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: status === s.value ? '#fff' : 'transparent',
              color:      status === s.value ? '#5d5fef' : '#94a3b8',
              boxShadow:  status === s.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Limpar filtros */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
          style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
        >
          <X className="w-3 h-3" /> Limpar
        </button>
      )}
    </div>
  )
}
