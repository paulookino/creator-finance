import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { UpgradeBanner } from '@/components/layout/UpgradeBanner'
import { createClient } from '@/lib/supabase/server'
import { isPro, trialDaysLeft } from '@/lib/stripe-utils'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_ends_at')
    .eq('id', user.id)
    .single()

  const status   = profile?.subscription_status ?? 'free'
  const trialEnd = profile?.trial_ends_at ?? null

  // Permite acesso apenas se:
  // - assinatura ativa (active)
  // - OU trial válido (trialing + ainda não expirou)
  const hasAccess =
    status === 'active' ||
    (status === 'trialing' && trialDaysLeft(trialEnd) > 0)

  if (!hasAccess) {
    redirect('/pricing?reason=access')
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f0f2f8' }}>
      <UpgradeBanner />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
