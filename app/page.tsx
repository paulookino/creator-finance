'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { DollarSign, ArrowRight, TrendingUp, Calculator, CalendarClock, Check, Zap, Shield } from 'lucide-react'

// ─── Contador animado ────────────────────────────────────────────────────────
function AnimatedCounter({ target, prefix = '', suffix = '', duration = 2000 }: {
  target: number; prefix?: string; suffix?: string; duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(ease * target))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])

  const fmt = new Intl.NumberFormat('pt-BR')
  return <span ref={ref}>{prefix}{fmt.format(count)}{suffix}</span>
}

// ─── Fade-in ao scroll ───────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, direction = 'up' }: {
  children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const transforms = { up: 'translateY(32px)', left: 'translateX(-32px)', right: 'translateX(32px)' }

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : transforms[direction],
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

// ─── Card flutuante de métrica ────────────────────────────────────────────────
function FloatingCard({ value, label, color, delay, platform }:
  { value: string; label: string; color: string; delay: string; platform: string }) {
  return (
    <div className="absolute rounded-2xl px-4 py-3 backdrop-blur-xl"
      style={{
        background: 'rgba(10,22,48,0.85)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${color}20`,
        animation: `float 4s ease-in-out ${delay} infinite`,
      }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{platform}</p>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs" style={{ color }}>{label}</p>
    </div>
  )
}

const FEATURES = [
  { icon: TrendingUp,    title: 'Receita consolidada',      desc: 'Hotmart, Kiwify e AdSense num único painel. Chega de planilha e aba de aba.' },
  { icon: Calculator,   title: 'Imposto automático',        desc: 'MEI, Simples Nacional ou Presumido. Calcula exatamente o quanto separar.' },
  { icon: CalendarClock,title: 'Calendário de recebimentos', desc: 'Sabe quando cada plataforma vai depositar. Zero surpresa no fluxo de caixa.' },
  { icon: Zap,          title: 'Webhook em tempo real',     desc: 'Cada venda aprovada na Kiwify aparece instantaneamente no dashboard.' },
  { icon: Shield,       title: 'Dados seguros',             desc: 'Supabase com Row-Level Security. Só você vê seus dados financeiros.' },
  { icon: DollarSign,   title: 'Import de histórico',       desc: 'Importe anos de vendas via CSV em minutos. Tudo categorizado e calculado.' },
]

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#050b18', fontFamily: 'var(--font-sans)' }}>

      {/* ── CSS global de animações ─────────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) }
          50%       { transform: translateY(-10px) }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg) }
          to   { transform: rotate(360deg) }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(93,95,239,0.4), 0 0 60px rgba(93,95,239,0.2) }
          50%       { box-shadow: 0 0 50px rgba(93,95,239,0.7), 0 0 100px rgba(93,95,239,0.35) }
        }
        @keyframes shimmer-btn {
          from { background-position: -200% center }
          to   { background-position:  200% center }
        }
        @keyframes gradient-bg {
          0%   { transform: rotate(0deg)   scale(1) }
          33%  { transform: rotate(120deg) scale(1.1) }
          66%  { transform: rotate(240deg) scale(0.95) }
          100% { transform: rotate(360deg) scale(1) }
        }
        @keyframes ticker {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
        .shimmer-btn {
          background: linear-gradient(90deg, #5d5fef 0%, #7c3aed 30%, #a78bfa 50%, #7c3aed 70%, #5d5fef 100%);
          background-size: 200% auto;
        }
        .shimmer-btn:hover {
          animation: shimmer-btn 1.5s linear infinite;
        }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300"
        style={{
          background: scrollY > 20 ? 'rgba(5,11,24,0.9)' : 'transparent',
          backdropFilter: scrollY > 20 ? 'blur(16px)' : 'none',
          borderBottom: scrollY > 20 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)', boxShadow: '0 0 20px rgba(93,95,239,0.4)' }}>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">CreatorFinance</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Demo
          </Link>
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Entrar
          </Link>
          <Link href="/pricing" className="shimmer-btn text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}>
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">

        {/* Orbs de fundo animados */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{ position: 'absolute', top: '10%', left: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(93,95,239,0.15) 0%, transparent 70%)', animation: 'gradient-bg 20s linear infinite' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', animation: 'gradient-bg 25s linear infinite reverse' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(40,199,111,0.04) 0%, transparent 60%)' }} />
          {/* Grade de pontos */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Badge */}
        <div className="relative mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(93,95,239,0.12)', border: '1px solid rgba(93,95,239,0.3)', color: '#a78bfa' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Stripe ativo · 7 dias grátis
          </div>
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl"
          style={{ animationDelay: '200ms' }}>
          <span className="text-white">Toda a sua receita de criador.</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8, #5d5fef, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Um lugar só.
          </span>
        </h1>

        <p className="relative text-lg md:text-xl mb-10 max-w-2xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', animationDelay: '300ms' }}>
          Conecta Kiwify, Hotmart e AdSense. Vê o que você <strong style={{ color: 'rgba(255,255,255,0.8)' }}>realmente ganha</strong>,
          quanto separar de imposto e quando o dinheiro cai.
        </p>

        {/* CTAs */}
        <div className="relative flex items-center gap-4 mb-16" style={{ animationDelay: '400ms' }}>
          <Link
            href="/pricing"
            className="shimmer-btn inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-lg"
            style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
          >
            Começar 7 dias grátis <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
          >
            Ver demo
          </Link>
        </div>

        {/* Preview do dashboard com cards flutuantes */}
        <div className="relative w-full max-w-4xl" style={{ animationDelay: '500ms' }}>

          {/* Cards flutuantes */}
          <div style={{ position: 'absolute', top: '8%',   left: '-2%'  }}><FloatingCard value="R$ 924,82"  label="↑ Aprovado agora" color="#28c76f" delay="0s"   platform="Kiwify"  /></div>
          <div style={{ position: 'absolute', top: '12%',  right: '-2%' }}><FloatingCard value="R$ 273,75"  label="↑ Nova venda"    color="#5d5fef" delay="0.8s" platform="Hotmart" /></div>
          <div style={{ position: 'absolute', bottom: '22%',left: '-2%' }}><FloatingCard value="R$ 1.240"   label="AdSense · Jun"  color="#4285f4" delay="1.6s" platform="AdSense" /></div>
          <div style={{ position: 'absolute', bottom: '28%',right: '-2%'}}><FloatingCard value="6% Simples" label="Imposto do mês" color="#ff9f43" delay="2.4s" platform="DAS"     /></div>

          {/* Mock do dashboard */}
          <div className="rounded-3xl overflow-hidden mx-auto"
            style={{
              background: 'rgba(10,22,48,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(93,95,239,0.15)',
              backdropFilter: 'blur(20px)',
            }}>

            {/* Barra de título */}
            <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,11,24,0.5)' }}>
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>creator-finance-pi.vercel.app/dashboard</span>
            </div>

            {/* Conteúdo do dashboard mock */}
            <div className="p-6 grid grid-cols-4 gap-3 mb-2">
              {[
                { label: 'Receita Bruta',  value: 'R$ 848.941', color: '#818cf8', up: '+23%' },
                { label: 'Receita Líquida', value: 'R$ 726.955', color: '#28c76f', up: '+21%' },
                { label: 'Total Vendas',   value: '1.885',       color: '#ff9f43', up: '+18%' },
                { label: 'Reservar Imp.',  value: 'R$ 43.617',  color: '#ff6b6b', up: '6%' },
              ].map(({ label, value, color, up }) => (
                <div key={label} className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                  <p className="text-base font-bold text-white">{value}</p>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>{up}</span>
                </div>
              ))}
            </div>

            {/* Barras do gráfico */}
            <div className="px-6 pb-6">
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-end justify-between gap-2 h-24">
                  {[40, 55, 48, 70, 63, 85, 72, 90, 78, 95, 88, 100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-lg" style={{
                      height: `${h}%`,
                      background: i === 11 ? 'linear-gradient(180deg, #5d5fef, #4f46e5)' : 'rgba(93,95,239,0.25)',
                      transition: `height 1s ease ${i * 60}ms`,
                    }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map(m => (
                    <span key={m} style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reflexo/sombra */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-20 blur-3xl"
            style={{ background: 'rgba(93,95,239,0.2)' }} />
        </div>
      </section>

      {/* ── TICKER ─────────────────────────────────────────────────────────── */}
      <div className="py-6 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex gap-12 whitespace-nowrap" style={{ animation: 'ticker 20s linear infinite' }}>
          {['Kiwify ✦', 'Hotmart ✦', 'AdSense ✦', 'MEI ✦', 'Simples Nacional ✦', 'Dashboard ✦', 'Imposto automático ✦', 'Webhook em tempo real ✦',
            'Kiwify ✦', 'Hotmart ✦', 'AdSense ✦', 'MEI ✦', 'Simples Nacional ✦', 'Dashboard ✦', 'Imposto automático ✦', 'Webhook em tempo real ✦',
          ].map((t, i) => (
            <span key={i} className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          {[
            { value: 730633, prefix: 'R$ ', suffix: '+', label: 'em receita monitorada', color: '#28c76f' },
            { value: 3232,   prefix: '',    suffix: '+', label: 'transações importadas', color: '#5d5fef' },
            { value: 7,      prefix: '',    suffix: ' min', label: 'para importar o histórico', color: '#ff9f43' },
          ].map(({ value, prefix, suffix, label, color }) => (
            <FadeIn key={label} direction="up" delay={0}>
              <div className="text-center p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-4xl font-bold mb-2" style={{ color }}>
                  <AnimatedCounter target={value} prefix={prefix} suffix={suffix} />
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Tudo que você precisa.</h2>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>Nada que você não vai usar.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} direction="up" delay={i * 80}>
                <div
                  className="p-6 rounded-2xl h-full transition-all duration-300 group"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(93,95,239,0.06)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(93,95,239,0.2)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(93,95,239,0.12)' }}>
                    <Icon className="w-5 h-5" style={{ color: '#818cf8' }} />
                  </div>
                  <h3 className="font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-lg mx-auto">
          <FadeIn direction="up">
            <div className="relative rounded-3xl p-8 overflow-hidden text-center"
              style={{
                background: 'linear-gradient(135deg, #1a1060 0%, #0f0a30 50%, #050b18 100%)',
                border: '1px solid rgba(93,95,239,0.3)',
                boxShadow: '0 0 80px rgba(93,95,239,0.2)',
              }}>
              {/* Brilho decorativo */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(93,95,239,0.8), transparent)' }} />

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                7 dias grátis · sem cartão
              </div>

              <div className="mb-6">
                <p className="text-5xl font-bold text-white mb-1">R$97<span className="text-xl text-white/50">/mês</span></p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>ou R$797/ano (4 meses grátis)</p>
              </div>

              <div className="space-y-2.5 mb-8 text-left">
                {['Kiwify webhook em tempo real', 'Import CSV histórico completo', 'Calculadora de imposto automática', 'Dashboard com todos os períodos', 'Suporte por email'].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(40,199,111,0.15)' }}>
                      <Check className="w-3 h-3" style={{ color: '#28c76f' }} />
                    </div>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/pricing"
                className="shimmer-btn block w-full py-4 rounded-2xl text-white font-bold text-lg text-center"
                style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
              >
                Começar 7 dias grátis <ArrowRight className="inline w-5 h-5 ml-1" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}>
              <DollarSign className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>CreatorFinance</span>
          </div>
          <div className="flex items-center gap-6">
            {[['Demo', '/demo'], ['Preços', '/pricing'], ['Entrar', '/login']].map(([label, href]) => (
              <Link key={label} href={href} className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
