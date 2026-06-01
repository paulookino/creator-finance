// Utilitários seguros para uso no cliente (sem importar o Stripe SDK)

export function isPro(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing'
}

export function isTrialing(status: string | null | undefined, trialEndsAt: string | null | undefined): boolean {
  if (status !== 'trialing') return false
  if (!trialEndsAt) return false
  return new Date(trialEndsAt) > new Date()
}

export function trialDaysLeft(trialEndsAt: string | null | undefined): number {
  if (!trialEndsAt) return 0
  return Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
}

export const PLAN_LABELS = {
  monthly: 'Pro Mensal — R$97/mês',
  annual:  'Pro Anual — R$797/ano',
}
