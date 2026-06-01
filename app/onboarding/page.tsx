'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, Check, ChevronRight, Zap, FileSpreadsheet, Calculator } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TAX_REGIME_LABELS, DEFAULT_RATES } from '@/lib/calculations/taxes'
import type { TaxRegime } from '@/lib/types'

const STEPS = ['Boas-vindas', 'Seu regime', 'Plataformas', 'Pronto!']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep]           = useState(0)
  const [name, setName]           = useState('')
  const [regime, setRegime]       = useState<TaxRegime>('simples')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [saving, setSaving]       = useState(false)

  function togglePlatform(p: string) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function finish() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        name: name || user.email?.split('@')[0],
        tax_regime:   regime,
        simples_rate: DEFAULT_RATES[regime],
      }).eq('id', user.id)
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f0f2f8' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}>
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: '#1a1d2e' }}>CreatorFinance</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: i < step ? '#5d5fef' : i === step ? 'linear-gradient(135deg, #5d5fef, #4f46e5)' : '#e8eaef',
                  color:      i <= step ? '#fff' : '#94a3b8',
                  boxShadow:  i === step ? '0 0 0 3px rgba(93,95,239,0.2)' : 'none',
                }}
              >
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-0.5 flex-1 rounded-full" style={{ background: i < step ? '#5d5fef' : '#e8eaef' }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8" style={{ border: '1px solid #e8eaef', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

          {/* Step 0 — Boas-vindas */}
          {step === 0 && (
            <div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(93,95,239,0.08)' }}>
                <Zap className="w-7 h-7" style={{ color: '#5d5fef' }} />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#1a1d2e' }}>Bem-vindo!</h1>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>
                Vamos configurar seu painel em 2 minutos. Depois você pode importar seu histórico da Kiwify e Hotmart.
              </p>
              <div className="mb-6">
                <label className="text-xs font-semibold block mb-2" style={{ color: '#64748b' }}>Como quer ser chamado?</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome ou apelido"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: '#f0f2f8', border: '1px solid transparent', color: '#1a1d2e' }}
                />
              </div>
              <button
                onClick={() => setStep(1)}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}
              >
                Começar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1 — Regime */}
          {step === 1 && (
            <div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(93,95,239,0.08)' }}>
                <Calculator className="w-7 h-7" style={{ color: '#5d5fef' }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#1a1d2e' }}>Qual é seu regime tributário?</h2>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>Usamos isso para calcular o imposto que você deve separar mensalmente.</p>
              <div className="space-y-3 mb-6">
                {(Object.keys(TAX_REGIME_LABELS) as TaxRegime[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setRegime(r)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      background: regime === r ? 'rgba(93,95,239,0.08)' : '#f8f9fa',
                      border: `1px solid ${regime === r ? 'rgba(93,95,239,0.3)' : '#e8eaef'}`,
                      color: '#1a1d2e',
                    }}
                  >
                    <span className="font-medium">{TAX_REGIME_LABELS[r]}</span>
                    {regime === r && <Check className="w-4 h-4" style={{ color: '#5d5fef' }} />}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: '#f0f2f8', color: '#64748b' }}>Voltar</button>
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}>
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Plataformas */}
          {step === 2 && (
            <div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(93,95,239,0.08)' }}>
                <FileSpreadsheet className="w-7 h-7" style={{ color: '#5d5fef' }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#1a1d2e' }}>Onde você vende?</h2>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>Vamos priorizar as integrações mais importantes para você.</p>
              <div className="space-y-3 mb-6">
                {[
                  { id: 'kiwify',  name: 'Kiwify',  color: '#7c3aed', desc: 'Webhook em tempo real disponível agora' },
                  { id: 'hotmart', name: 'Hotmart',  color: '#e63946', desc: 'Import CSV disponível agora' },
                  { id: 'adsense', name: 'AdSense',  color: '#4285f4', desc: 'YouTube e blog' },
                  { id: 'outros',  name: 'Outros',   color: '#64748b', desc: 'Lançamento manual' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      background: platforms.includes(p.id) ? `${p.color}10` : '#f8f9fa',
                      border: `1px solid ${platforms.includes(p.id) ? p.color + '40' : '#e8eaef'}`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0" style={{ background: p.color }}>
                      {p.name[0]}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold" style={{ color: '#1a1d2e' }}>{p.name}</p>
                      <p className="text-[10px]" style={{ color: '#94a3b8' }}>{p.desc}</p>
                    </div>
                    {platforms.includes(p.id) && <Check className="w-4 h-4 flex-shrink-0" style={{ color: p.color }} />}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: '#f0f2f8', color: '#64748b' }}>Voltar</button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}>
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Pronto */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(40,199,111,0.1)' }}>
                <Check className="w-8 h-8" style={{ color: '#28c76f' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a1d2e' }}>Tudo pronto, {name || 'criador'}!</h2>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>
                Seu painel está configurado. O próximo passo é conectar suas plataformas em Integrações.
              </p>
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left space-y-2">
                <p className="text-xs font-bold mb-2" style={{ color: '#94a3b8' }}>PRÓXIMOS PASSOS</p>
                {[
                  platforms.includes('kiwify')  && '① Configure o webhook Kiwify (5 min)',
                  platforms.includes('hotmart') && '② Importe o CSV histórico do Hotmart',
                  '③ Veja seu dashboard com dados reais',
                ].filter(Boolean).map((s, i) => (
                  <p key={i} className="text-sm font-medium" style={{ color: '#1a1d2e' }}>{s as string}</p>
                ))}
              </div>
              <button
                onClick={finish}
                disabled={saving}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}
              >
                {saving ? 'Salvando...' : 'Ir para o dashboard'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#94a3b8' }}>
          Você pode alterar qualquer configuração depois em Configurações.
        </p>
      </div>
    </div>
  )
}
