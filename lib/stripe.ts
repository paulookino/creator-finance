// SERVER ONLY — não importar em componentes cliente
import 'server-only'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
})

export const PLANS = {
  monthly: {
    name: 'Pro Mensal',
    price: 9700,
    currency: 'brl',
    interval: 'month' as const,
    priceId: process.env.STRIPE_PRICE_MONTHLY ?? '',
  },
  annual: {
    name: 'Pro Anual',
    price: 79700,
    currency: 'brl',
    interval: 'year' as const,
    priceId: process.env.STRIPE_PRICE_ANNUAL ?? '',
    savings: 'Economize R$ 367 (4 meses grátis)',
  },
}

// Re-export utils for server use
export { isPro, isTrialing, trialDaysLeft } from './stripe-utils'
