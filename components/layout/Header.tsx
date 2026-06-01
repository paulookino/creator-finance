'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GlobalSearch } from './GlobalSearch'
import { NotificationsDropdown } from './NotificationsDropdown'

interface HeaderProps { title: string }

export function Header({ title }: HeaderProps) {
  const router = useRouter()
  const [open, setOpen]   = useState(false)
  const [email, setEmail] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  async function handleLogout() {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = email ? email[0].toUpperCase() : 'U'
  const name     = email ? email.split('@')[0] : 'Usuário'

  return (
    <header
      className="h-16 flex items-center justify-between px-6"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e8eaef',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <h1 className="text-lg font-bold" style={{ color: '#1a1d2e' }}>{title}</h1>

      <div className="flex items-center gap-3">
        {/* Busca global */}
        <GlobalSearch />

        {/* Notificações */}
        <NotificationsDropdown />

        {/* Avatar dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl transition-colors hover:bg-slate-50"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}
            >
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold" style={{ color: '#1a1d2e' }}>{name}</p>
              <p className="text-[10px]" style={{ color: '#94a3b8' }}>Creator</p>
            </div>
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-200"
              style={{ color: '#94a3b8', transform: open ? 'rotate(180deg)' : '' }}
            />
          </button>

          {open && (
            <div
              className="absolute right-0 top-12 w-52 rounded-2xl py-2 z-50"
              style={{
                background: '#ffffff',
                border: '1px solid #e8eaef',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}
            >
              {email && (
                <div className="px-4 py-2 mb-1" style={{ borderBottom: '1px solid #f0f2f8' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Logado como</p>
                  <p className="text-xs font-medium truncate" style={{ color: '#475569' }}>{email}</p>
                </div>
              )}
              <button
                onClick={() => { setOpen(false); router.push('/configuracoes') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50"
                style={{ color: '#475569' }}
              >
                <Settings className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
                Configurações
              </button>
              <div style={{ borderTop: '1px solid #f0f2f8', marginTop: 4, paddingTop: 4 }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-red-50"
                  style={{ color: '#ef4444' }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair da conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
