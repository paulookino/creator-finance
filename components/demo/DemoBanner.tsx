'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

export function DemoBanner() {
  return (
    <div
      className="flex items-center justify-between px-4 py-2 text-sm font-medium"
      style={{
        background: 'linear-gradient(90deg, #5d5fef, #7c3aed)',
        color: '#ffffff',
      }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-xs">
          <strong>Modo demonstração</strong> — dados fictícios para explorar o sistema
        </span>
      </div>
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg transition-colors hover:bg-white/20 flex-shrink-0 ml-4 whitespace-nowrap"
        style={{ border: '1px solid rgba(255,255,255,0.3)' }}
      >
        Entrar com minha conta <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}
