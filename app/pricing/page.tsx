'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DollarSign, Check, Zap, ArrowRight, Star, Shield, TrendingUp, Calculator, Calendar, Plug, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const FEATURES = [
  { icon: TrendingUp,  text: 'Receita consolidada — Kiwify, Hotmart, AdSense' },
  { icon: Calculator,  text: 'Calculadora de imposto automática (MEI, Simples, Presumido)' },
  { icon: Calendar,    text: 'Calendário de recebimentos com datas estimadas' },
  { icon: Plug,        text: 'Webhook Kiwify em tempo real + import CSV histórico' },
  { icon: TrendingUp,  text: 'Dashboard com filtros por período e plataforma' },
  { icon: DollarSign,  text: 'Ticket médio, taxas e reembolsos detalhados' },
]

const TESTIMONIALS = [
  { name: 'Ana Carvalho', role: 'Mentora de finanças', text: 'Finalmente sei exatamente quanto separar de imposto. Antes adivinhava.' },
  { name: 'Lucas Fernandes', role: 'Infoprodutor', text: 'Em 10 minutos importei 2 anos de histórico da Kiwify. Inacreditável.' },
  { name: 'Mariana Costa', role: 'Coach e criadora', text: 'Uso toda segunda para ver a performance da semana. Virou rotina.' },
]

export default function PricingPage() {
  const router = useRouter()
  const [billing, setBilling]   = useState<'monthly' | 'annual'>('annual')
  const [userEmail, setEmail]   = useState<string | null>(null)
  const [blocked, setBlocked]   = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  useEffect(() => {
    setBlocked(new URLSearchParams(window.location.search).get('reason') === 'access')
    createClient().auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [])

  async function handleLogout() {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }
  const [loading, setLoading]  = useState<string | null>(null)

  async function handleCheckout(plan: 'monthly' | 'annual') {
    setLoading(plan)
    setCheckoutError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/signup?plan=${plan}`)
        return
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      let data: { url?: string; error?: string }
      try {
        data = await res.json()
      } catch {
        setCheckoutError('Erro de comunicação com o servidor. Tente novamente.')
        setLoading(null)
        return
      }

      if (!res.ok || data.error || !data.url) {
        setCheckoutError(data.error ?? 'Não foi possível iniciar o checkout.')
        setLoading(null)
        return
      }

      window.location.href = data.url
    } catch (err) {
      setCheckoutError('Erro inesperado. Tente novamente.')
      setLoading(null)
    }
  }

  const monthlyPrice  = 97
  const annualMonthly = 66   // 797/12 arredondado
  const displayPrice  = billing === 'annual' ? annualMonthly : monthlyPrice
  const totalAnnual   = 797

  return (
    <div className="min-h-screen" style={{ background: '#f0f2f8' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">CreatorFinance</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="text-sm font-medium text-slate-500 hover:text-slate-700">Ver demo</Link>

          {userEmail ? (
            /* Usuário logado sem acesso */
            <div className="flex items-center gap-2 pl-3" style={{ borderLeft: '1px solid #e8eaef' }}>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: '#f8f9fa' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}>
                  {userEmail[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium max-w-[160px] truncate" style={{ color: '#475569' }}>
                  {userEmail}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors hover:bg-red-50"
                style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors hover:bg-slate-100" style={{ color: '#5d5fef' }}>
              Entrar
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Aviso de acesso bloqueado */}
        {blocked && (
          <div className="mb-8 rounded-2xl px-5 py-4 text-center" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)' }}>
            <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>
              Seu período de trial expirou ou sua conta é gratuita.
            </p>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
              Assine para continuar acessando o CreatorFinance.
            </p>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(93,95,239,0.1)', color: '#5d5fef' }}>
            <Star className="w-3.5 h-3.5" />
            7 dias grátis — cancele quando quiser
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#1a1d2e' }}>
            Um preço. Tudo incluído.
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#64748b' }}>
            Para criadores que faturam R$30k–200k/mês e precisam de clareza financeira sem planilha.
          </p>
        </div>

        {/* Toggle mensal/anual */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setBilling('monthly')}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: billing === 'monthly' ? '#5d5fef' : '#ffffff',
              color:      billing === 'monthly' ? '#fff' : '#64748b',
              border: '1px solid ' + (billing === 'monthly' ? '#5d5fef' : '#e8eaef'),
            }}
          >
            Mensal
          </button>
          <button
            onClick={() => setBilling('annual')}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            style={{
              background: billing === 'annual' ? '#5d5fef' : '#ffffff',
              color:      billing === 'annual' ? '#fff' : '#64748b',
              border: '1px solid ' + (billing === 'annual' ? '#5d5fef' : '#e8eaef'),
            }}
          >
            Anual
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: billing === 'annual' ? 'rgba(255,255,255,0.25)' : 'rgba(93,95,239,0.1)',
                color:      billing === 'annual' ? '#fff' : '#5d5fef',
              }}
            >
              -32%
            </span>
          </button>
        </div>

        {/* Card de preço */}
        <div className="max-w-lg mx-auto mb-16">
          <div
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #5d5fef 0%, #4f46e5 100%)',
              boxShadow: '0 20px 60px rgba(93,95,239,0.35)',
            }}
          >
            {/* Brilho decorativo */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
              style={{ background: 'white', transform: 'translate(30%, -30%)' }} />

            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-1">CreatorFinance Pro</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-white">R${displayPrice}</span>
                    <span className="text-white/70 text-sm mb-2">/mês</span>
                  </div>
                  {billing === 'annual' && (
                    <p className="text-white/60 text-xs mt-1">
                      Cobrado R${totalAnnual}/ano — economize R${monthlyPrice * 12 - totalAnnual} (4 meses grátis)
                    </p>
                  )}
                  {billing === 'monthly' && (
                    <p className="text-white/60 text-xs mt-1">Cancele quando quiser</p>
                  )}
                </div>
                <div className="bg-white/20 rounded-2xl px-3 py-1.5 text-white text-xs font-bold">
                  7 dias grátis
                </div>
              </div>

              {/* Features incluídas */}
              <div className="space-y-3 mb-8">
                {[
                  'Kiwify webhook em tempo real',
                  'Import CSV histórico completo',
                  'Dashboard com todos os períodos',
                  'Calculadora de imposto configurável',
                  'Calendário de recebimentos',
                  'Busca global e notificações',
                  'Suporte por email',
                  'Atualizações incluídas para sempre',
                ].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-white/85 text-sm">{f}</p>
                  </div>
                ))}
              </div>

              {checkoutError && (
                <div className="mb-3 px-4 py-3 rounded-xl text-sm font-medium text-center" style={{ background: 'rgba(255,107,107,0.15)', color: '#ffb3b3', border: '1px solid rgba(255,107,107,0.3)' }}>
                  {checkoutError}
                  {checkoutError.includes('Stripe') || checkoutError.includes('configurad') ? (
                    <p className="text-xs mt-1 text-white/50">Configure STRIPE_SECRET_KEY e STRIPE_PRICE_* no .env.local</p>
                  ) : null}
                </div>
              )}

              <button
                onClick={() => handleCheckout(billing)}
                disabled={!!loading}
                className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: '#ffffff', color: '#4f46e5' }}
              >
                {loading === billing
                  ? <><span className="animate-spin mr-1">⟳</span> Redirecionando...</>
                  : <> Começar 7 dias grátis <ArrowRight className="w-4 h-4" /> </>
                }
              </button>

              <p className="text-center text-white/50 text-xs mt-3">
                Sem cartão? Explore a{' '}
                <Link href="/demo" className="text-white/70 underline underline-offset-2">demonstração gratuita</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Por que R$97 */}
        <div className="bg-white rounded-3xl p-8 mb-12" style={{ border: '1px solid #e8eaef' }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1a1d2e' }}>Por que R$97/mês?</h2>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            Criadores que usam o CreatorFinance faturam em média R$60k/mês. R$97 representa <strong>0,16% da receita</strong> — o custo de perder uma única hora tentando entender sua planilha.
          </p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Horas salvas por mês', value: '4–8h', sub: 'De planilha e reunião com contador' },
              { label: 'Imposto recuperado', value: 'R$500+', sub: 'Ao configurar a alíquota correta' },
              { label: 'Payback do investimento', value: '1 dia', sub: 'Do primeiro mês de uso' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold mb-1" style={{ color: '#5d5fef' }}>{value}</p>
                <p className="text-xs font-semibold mb-0.5" style={{ color: '#1a1d2e' }}>{label}</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features detalhadas */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4" style={{ border: '1px solid #e8eaef' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(93,95,239,0.08)' }}>
                <Icon className="w-4 h-4" style={{ color: '#5d5fef' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#1a1d2e' }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Depoimentos */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {TESTIMONIALS.map(({ name, role, text }) => (
            <div key={name} className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e8eaef' }}>
              <p className="text-sm mb-4" style={{ color: '#475569' }}>"{text}"</p>
              <div>
                <p className="text-xs font-bold" style={{ color: '#1a1d2e' }}>{name}</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Garantia */}
        <div className="text-center bg-white rounded-2xl p-8" style={{ border: '1px solid #e8eaef' }}>
          <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: '#5d5fef' }} />
          <h3 className="font-bold text-lg mb-2" style={{ color: '#1a1d2e' }}>7 dias de trial grátis + sem fidelidade</h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: '#64748b' }}>
            Experimente 7 dias sem cobrança. Se não agregar valor, cancele em 1 clique no portal do cliente.
            Sem multa, sem pergunta, sem burocracia.
          </p>
        </div>

      </div>
    </div>
  )
}
