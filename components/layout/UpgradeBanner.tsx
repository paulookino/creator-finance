'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap, X, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trialDaysLeft, isPro } from '@/lib/stripe-utils'

export function UpgradeBanner() {
  const [status, setStatus]   = useState<string | null>(null)
  const [trialEnd, setTrial]  = useState<string | null>(null)
  const [dismissed, dismiss]  = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await createClient()
        .from('profiles')
        .select('subscription_status, trial_ends_at')
        .eq('id', data.user.id)
        .single()
      if (profile) {
        setStatus(profile.subscription_status)
        setTrial(profile.trial_ends_at)
      }
    })
  }, [])

  if (dismissed || !status || isPro(status)) return null
  if (status === 'trialing' && trialDaysLeft(trialEnd) === 0) return null

  const daysLeft = trialDaysLeft(trialEnd)
  const isTrialBanner = status === 'trialing' && daysLeft > 0

  return (
    <div
      className="flex items-center justify-between px-6 py-2.5 text-sm"
      style={{
        background: isTrialBanner
          ? 'linear-gradient(90deg, rgba(93,95,239,0.06), rgba(124,58,237,0.04))'
          : 'linear-gradient(90deg, rgba(255,107,107,0.08), rgba(255,159,67,0.05))',
        borderBottom: '1px solid',
        borderColor: isTrialBanner ? 'rgba(93,95,239,0.15)' : 'rgba(255,107,107,0.2)',
      }}
    >
      <div className="flex items-center gap-2">
        {isTrialBanner
          ? <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#5d5fef' }} />
          : <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ff6b6b' }} />
        }
        <span style={{ color: isTrialBanner ? '#5d5fef' : '#ef4444' }}>
          {isTrialBanner
            ? <><strong>Trial gratuito:</strong> {daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante{daysLeft !== 1 ? 's' : ''}</>
            : <><strong>Sua conta é gratuita.</strong> Faça upgrade para desbloquear todos os recursos.</>
          }
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/pricing"
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
          style={{
            background: isTrialBanner ? '#5d5fef' : '#ef4444',
            color: '#fff',
          }}
        >
          {isTrialBanner ? 'Assinar agora' : 'Ver planos'}
        </Link>
        <button onClick={() => dismiss(true)}>
          <X className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
        </button>
      </div>
    </div>
  )
}
