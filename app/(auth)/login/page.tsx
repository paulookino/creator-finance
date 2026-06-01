'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, Loader2, Sparkles, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (error) { setError('Erro ao enviar email. Verifique o endereço.'); setLoading(false); return }
    setResetSent(true)
    setLoading(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f2f8' }}>

      {/* Painel esquerdo — Demo */}
      <div
        className="hidden lg:flex w-2/5 flex-col justify-between p-10"
        style={{ background: 'linear-gradient(135deg, #5d5fef 0%, #4f46e5 60%, #7c3aed 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">CreatorFinance</span>
        </div>

        {/* Conteúdo central */}
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Demonstração interativa
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Explore o sistema<br />antes de criar sua conta
          </h2>
          <p className="text-white/70 text-sm mb-8 leading-relaxed">
            Veja como o CreatorFinance consolida sua receita da Kiwify, Hotmart e AdSense num único painel — sem precisar cadastrar nada.
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {[
              'Dashboard com receita por plataforma',
              'Tabela de transações com filtros',
              'Calculadora de imposto automática',
              'Calendário de recebimentos',
            ].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <p className="text-white/80 text-sm">{f}</p>
              </div>
            ))}
          </div>

          <Link
            href="/demo"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:bg-white hover:text-indigo-600"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <Sparkles className="w-4 h-4" />
            Explorar demonstração
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-white/40 text-xs">
          Dados fictícios · Sem cadastro necessário
        </p>
      </div>

      {/* Painel direito — Login real */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">CreatorFinance</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Demo link mobile */}
          <Link
            href="/demo"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold mb-6 transition-all hover:opacity-90 lg:hidden"
            style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)', color: '#fff' }}
          >
            <Sparkles className="w-4 h-4" />
            Ver demonstração interativa
          </Link>

          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #e8eaef', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

            {/* Reset enviado */}
            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(40,199,111,0.1)' }}>
                  <svg className="w-7 h-7" style={{ color: '#28c76f' }} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 className="text-lg font-bold mb-2" style={{ color: '#1a1d2e' }}>Email enviado!</h2>
                <p className="text-sm mb-5" style={{ color: '#64748b' }}>Verifique sua caixa de entrada em <strong>{email}</strong> e clique no link para redefinir sua senha.</p>
                <button onClick={() => { setResetSent(false); setResetMode(false) }} className="text-sm font-semibold" style={{ color: '#5d5fef' }}>Voltar ao login</button>
              </div>
            ) : resetMode ? (
              /* Modo recuperação */
              <>
                <button onClick={() => setResetMode(false)} className="flex items-center gap-1 text-xs mb-4" style={{ color: '#94a3b8' }}>
                  ← Voltar
                </button>
                <h1 className="text-xl font-bold mb-1" style={{ color: '#1a1d2e' }}>Esqueceu a senha?</h1>
                <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>Informe seu email e enviaremos um link para redefinir.</p>
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: '#64748b' }}>Email</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{ background: '#f0f2f8', border: '1px solid transparent', color: '#1a1d2e' }}
                      placeholder="seu@email.com" />
                  </div>
                  {error && <p className="text-sm rounded-xl px-3 py-2" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 text-white text-sm font-bold rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)', opacity: loading ? 0.6 : 1 }}>
                    {loading ? 'Enviando...' : 'Enviar link de redefinição'}
                  </button>
                </form>
              </>
            ) : (
              /* Modo login normal */
              <>
            <h1 className="text-xl font-bold mb-1" style={{ color: '#1a1d2e' }}>Entrar na sua conta</h1>
            <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>Acesse seus dados financeiros reais</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: '#64748b' }}>Email</label>
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                  style={{ background: '#f0f2f8', border: '1px solid transparent', color: '#1a1d2e' }}
                  onFocus={e => e.target.style.border = '1px solid rgba(93,95,239,0.4)'}
                  onBlur={e => e.target.style.border = '1px solid transparent'}
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: '#64748b' }}>Senha</label>
                <input
                  type="password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                  style={{ background: '#f0f2f8', border: '1px solid transparent', color: '#1a1d2e' }}
                  onFocus={e => e.target.style.border = '1px solid rgba(93,95,239,0.4)'}
                  onBlur={e => e.target.style.border = '1px solid transparent'}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm rounded-xl px-3 py-2" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 text-white text-sm font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Entrar
              </button>
            </form>

            <div className="mt-4 text-center">
              <button onClick={() => { setResetMode(true); setError('') }} className="text-xs hover:underline" style={{ color: '#94a3b8' }}>
                Esqueceu sua senha?
              </button>
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #f0f2f8' }}>
              <p className="text-center text-sm" style={{ color: '#94a3b8' }}>
                Não tem conta?{' '}
                <Link href="/signup" className="font-semibold hover:underline" style={{ color: '#5d5fef' }}>
                  Criar gratuitamente
                </Link>
              </p>
            </div>
            </>
            )}
          </div>

          {/* Demo link desktop */}
          <p className="text-center text-xs mt-4 hidden lg:block" style={{ color: '#94a3b8' }}>
            Quer explorar antes de criar conta?{' '}
            <Link href="/demo" className="font-semibold hover:underline" style={{ color: '#5d5fef' }}>
              Ver demonstração
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
