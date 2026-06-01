import Link from 'next/link'
import { Search, Bell, LogIn } from 'lucide-react'

interface Props { title: string }

export function DemoHeader({ title }: Props) {
  return (
    <header
      className="h-16 flex items-center justify-between px-6"
      style={{ background: '#ffffff', borderBottom: '1px solid #e8eaef' }}
    >
      <h1 className="text-lg font-bold" style={{ color: '#1a1d2e' }}>{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search — desabilitado no demo */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-not-allowed opacity-50"
          style={{ background: '#f0f2f8', width: 200 }}
          title="Busca disponível com conta real"
        >
          <Search className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
          <span className="text-sm" style={{ color: '#94a3b8' }}>Buscar...</span>
        </div>

        {/* Bell — desabilitado no demo */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center opacity-50 cursor-not-allowed"
          style={{ color: '#64748b' }}
          title="Notificações disponíveis com conta real"
        >
          <Bell className="w-4 h-4" />
        </div>

        {/* CTA entrar */}
        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}
        >
          <LogIn className="w-3.5 h-3.5" />
          Entrar
        </Link>
      </div>
    </header>
  )
}
