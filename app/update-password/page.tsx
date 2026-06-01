'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, Loader2, Check, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [show,      setShow]      = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [done,      setDone]      = useState(false)
  const [hasSession, setSession]  = useState(false)

  useEffect(() => {
    // Supabase injeta a sessão via hash na URL após o clique no link
    createClient().auth.getSession().then(({ data }) => {
      setSession(!!data.session)
    })
  }, [])

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 8 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3

  const strengthLabel = ['', 'Fraca', 'Razoável', 'Boa', 'Forte']
  const strengthColor = ['', '#ef4444', '#ff9f43', '#5d5fef', '#28c76f']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 6)  { setError('Senha deve ter pelo menos 6 caracteres.'); return }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f0f2f8' }}>
        <div className="bg-white rounded-2xl p-10 text-center max-w-sm w-full" style={{ border: '1px solid #e8eaef', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(40,199,111,0.1)' }}>
            <Check className="w-8 h-8" style={{ color: '#28c76f' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1a1d2e' }}>Senha atualizada!</h2>
          <p className="text-sm" style={{ color: '#64748b' }}>Redirecionando para o dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f0f2f8' }}>
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}>
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: '#1a1d2e' }}>CreatorFinance</span>
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #e8eaef', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h1 className="text-xl font-bold mb-1" style={{ color: '#1a1d2e' }}>Nova senha</h1>
          <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>Escolha uma senha forte para sua conta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: '#64748b' }}>Nova senha</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none pr-10"
                  style={{ background: '#f0f2f8', border: '1px solid transparent', color: '#1a1d2e' }}
                  placeholder="Mínimo 6 caracteres"
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#94a3b8' }}>
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Barra de força */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthColor[strength] : '#e8eaef' }} />
                    ))}
                  </div>
                  <p className="text-[10px] font-semibold" style={{ color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: '#64748b' }}>Confirmar senha</label>
              <input
                type={show ? 'text' : 'password'}
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{
                  background: '#f0f2f8',
                  border: confirm && confirm !== password ? '1px solid rgba(239,68,68,0.4)' : '1px solid transparent',
                  color: '#1a1d2e',
                }}
                placeholder="Repita a senha"
              />
              {confirm && confirm !== password && (
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>As senhas não coincidem</p>
              )}
            </div>

            {error && (
              <p className="text-sm rounded-xl px-3 py-2" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !hasSession}
              className="w-full flex items-center justify-center gap-2 py-3 text-white text-sm font-bold rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)', opacity: (loading || !hasSession) ? 0.6 : 1 }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {!hasSession ? 'Link inválido ou expirado' : 'Salvar nova senha'}
            </button>

            {!hasSession && (
              <p className="text-center text-xs" style={{ color: '#94a3b8' }}>
                <Link href="/login" className="font-semibold" style={{ color: '#5d5fef' }}>
                  Solicitar novo link →
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
