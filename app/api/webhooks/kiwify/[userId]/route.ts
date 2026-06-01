import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateNetAmount, calculateFee } from '@/lib/calculations/platform-fees'

interface KiwifyPayload {
  webhook_event_type: 'order_approved' | 'order_refunded' | 'subscription_canceled' | string
  order: {
    id: string
    product: { name: string; id: string; price: number }
    customer: { email: string }
    payment: { amount: number; installments: number }
    commission?: { store_amount: number }
    approved_date?: string
    refund_date?: string
    subscription?: { status: string }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  if (!userId) {
    return NextResponse.json({ error: 'userId ausente' }, { status: 400 })
  }

  let payload: KiwifyPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'payload inválido' }, { status: 400 })
  }

  const { webhook_event_type, order } = payload
  if (!order?.id) {
    return NextResponse.json({ error: 'order inválida' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Verificar se o usuário existe
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'usuário não encontrado' }, { status: 404 })
  }

  const grossAmount = order.payment?.amount ?? order.product?.price ?? 0
  const netAmount = order.commission?.store_amount ?? calculateNetAmount('kiwify', grossAmount)
  const fee = grossAmount - netAmount

  const type =
    webhook_event_type === 'order_refunded' ? 'refund' :
    webhook_event_type === 'subscription_canceled' ? 'refund' : 'sale'

  const status =
    webhook_event_type === 'order_approved' ? 'approved' :
    webhook_event_type === 'order_refunded' ? 'refunded' : 'cancelled'

  const transactionDate = order.approved_date ?? order.refund_date ?? new Date().toISOString()

  const { error } = await supabase.from('transactions').upsert({
    user_id: userId,
    platform: 'kiwify',
    external_id: order.id,
    product_name: order.product?.name ?? 'Produto Kiwify',
    product_external_id: order.product?.id,
    amount: grossAmount,
    platform_fee: fee,
    net_amount: netAmount,
    type,
    status,
    transaction_date: transactionDate,
    buyer_email: order.customer?.email,
  }, {
    onConflict: 'platform,external_id,user_id',
    ignoreDuplicates: false,
  })

  if (error) {
    console.error('Erro ao salvar transação Kiwify:', error)
    return NextResponse.json({ error: 'erro ao salvar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
