'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Package, Calculator, Calendar, Plug, Zap } from 'lucide-react'

const NAV = [
  { href: '/demo/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/demo/receita',     icon: TrendingUp,       label: 'Receita' },
  { href: '/demo/produtos',    icon: Package,          label: 'Produtos' },
  { href: '/demo/impostos',    icon: Calculator,       label: 'Impostos' },
  { href: '/demo/calendario',  icon: Calendar,         label: 'Recebimentos' },
  { href: '/demo/integracoes', icon: Plug,             label: 'Integrações' },
]

export function DemoSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-56 min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #5d5fef 0%, #4f46e5 100%)' }}
    >
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm">CreatorFinance</span>
            <span
              className="block text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}
            >
              Demo
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                color:      active ? '#5d5fef' : 'rgba(255,255,255,0.75)',
                background: active ? '#ffffff' : 'transparent',
                fontWeight: active ? 600 : 500,
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* CTA criar conta */}
      <div className="mx-3 mb-5 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <p className="text-white text-xs font-bold mb-1">Gostou do sistema?</p>
        <p className="text-white/60 text-[10px] mb-3">Conecte seus dados reais da Kiwify e Hotmart.</p>
        <Link
          href="/signup"
          className="block text-center text-xs font-bold py-2 rounded-xl transition-colors hover:opacity-90"
          style={{ background: '#ffffff', color: '#4f46e5' }}
        >
          Criar conta grátis
        </Link>
      </div>
    </aside>
  )
}
