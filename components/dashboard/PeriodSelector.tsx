'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { PERIOD_OPTIONS, type Period } from '@/lib/periods'

interface Props {
  current: Period
}

export function PeriodSelector({ current }: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  function select(period: Period) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-xl"
      style={{ background: '#f0f2f8' }}
    >
      {PERIOD_OPTIONS.map(opt => {
        const active = current === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => select(opt.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap"
            style={{
              background: active ? '#ffffff' : 'transparent',
              color:      active ? '#5d5fef' : '#94a3b8',
              boxShadow:  active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
