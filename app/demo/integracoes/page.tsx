import { DemoHeader } from '@/components/demo/DemoHeader'
import { DarkCard, DarkCardHeader, DarkCardTitle, DarkCardContent } from '@/components/ui/dark-card'
import { Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const INTEGRATIONS = [
  { name: 'Kiwify',  color: '#7c3aed', desc: 'Webhook em tempo real — toda venda entra automaticamente.' },
  { name: 'Hotmart', color: '#e63946', desc: 'OAuth — importa vendas, reembolsos e assinaturas.' },
  { name: 'AdSense', color: '#4285f4', desc: 'OAuth Google — receita mensal de YouTube e blog.' },
]

export default function DemoIntegracoesPage() {
  return (
    <div>
      <DemoHeader title="Integrações" />
      <div className="p-6 space-y-5">

        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Integrações — <span className="normal-case font-semibold" style={{ color: '#5d5fef' }}>Demonstração</span></p>
        </div>

        {/* CTA criar conta */}
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #5d5fef, #4f46e5)', color: '#fff' }}>
          <p className="text-lg font-bold mb-2">Conecte suas plataformas</p>
          <p className="text-sm text-white/75 mb-4">Crie sua conta gratuitamente e importe todo o seu histórico de vendas da Kiwify e Hotmart em minutos.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity" style={{ color: '#4f46e5' }}>
            Criar conta grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards de integrações bloqueadas */}
        {INTEGRATIONS.map(int => (
          <DarkCard key={int.name} className="opacity-75">
            <DarkCardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ background: int.color }}>
                    {int.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1a1d2e' }}>{int.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{int.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-not-allowed" style={{ background: '#f0f2f8', color: '#94a3b8' }}>
                  <Lock className="w-3.5 h-3.5" />
                  Requer conta
                </div>
              </div>
            </DarkCardContent>
          </DarkCard>
        ))}

        {/* Import CSV demo */}
        <DarkCard className="opacity-75">
          <DarkCardHeader><DarkCardTitle>Importar histórico via CSV</DarkCardTitle></DarkCardHeader>
          <DarkCardContent>
            <p className="text-sm mb-4" style={{ color: '#64748b' }}>Exporte o relatório de vendas da Kiwify ou Hotmart e importe todo o histórico com um clique.</p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-not-allowed w-fit" style={{ background: '#f0f2f8', color: '#94a3b8' }}>
              <Lock className="w-3.5 h-3.5" />
              Disponível com conta real
            </div>
          </DarkCardContent>
        </DarkCard>

      </div>
    </div>
  )
}
