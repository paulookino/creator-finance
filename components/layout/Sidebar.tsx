'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, Package,
  Calculator, Calendar, Plug, Settings,
  LogOut, Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/receita',     icon: TrendingUp,       label: 'Receita' },
  { href: '/produtos',    icon: Package,          label: 'Produtos' },
  { href: '/impostos',    icon: Calculator,       label: 'Impostos' },
  { href: '/calendario',  icon: Calendar,         label: 'Recebimentos' },
  { href: '/integracoes', icon: Plug,             label: 'Integrações' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

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
          <span className="text-white font-bold text-sm tracking-wide">CreatorFinance</span>
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
                background: active ? '#ffffff'  : 'transparent',
                fontWeight: active ? 600 : 500,
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Pro card */}
      <div className="mx-3 mb-4 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <div
          className="p-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <p className="text-white text-xs font-semibold mb-0.5">Creator Finance</p>
          <p className="text-white/60 text-[10px] mb-3">Gerencie sua receita com IA</p>
          <Link
            href="/integracoes"
            className="block text-center text-xs font-semibold py-1.5 rounded-lg transition-colors hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #fff, #e0e7ff)', color: '#4f46e5' }}
          >
            + Adicionar dados
          </Link>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
        <Link
          href="/configuracoes"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          <Settings className="w-4 h-4" />
          Configurações
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
