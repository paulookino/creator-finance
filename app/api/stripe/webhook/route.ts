import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

async function updateSubscription(customerId: string, data: {
  status: string
  plan?: string | null
  subscriptionId?: string
  trialEnd?: number | null
  currentPeriodEnd?: number
}) {
  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) return

  await supabase.from('profiles').update({
    subscription_status: data.status,
    subscription_plan: data.plan,
    stripe_subscription_id: data.subscriptionId,
    trial_ends_at: data.trialEnd ? new Date(data.trialEnd * 1000).toISOString() : null,
    subscription_ends_at: data.currentPeriodEnd ? new Date(data.currentPeriodEnd * 1000).toISOString() : null,
  }).eq('id', profile.id)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig  = request.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const plan = sub.items.data[0]?.price.recurring?.interval === 'year' ? 'annual' : 'monthly'
      const periodEnd = (sub as { current_period_end?: number }).current_period_end
      await updateSubscription(sub.customer as string, {
        status:           sub.status,
        plan:             sub.status === 'canceled' ? null : plan,
        subscriptionId:   sub.id,
        trialEnd:         sub.trial_end,
        currentPeriodEnd: periodEnd,
      })
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await updateSubscription(sub.customer as string, { status: 'canceled', plan: null })
      break
    }
    case 'invoice.payment_failed': {
      const inv = event.data.object as Stripe.Invoice
      if (inv.customer) {
        await updateSubscription(inv.customer as string, { status: 'past_due' })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
