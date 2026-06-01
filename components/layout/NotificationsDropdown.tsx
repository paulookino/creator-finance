'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, TrendingUp, TrendingDown, CalendarClock, AlertTriangle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  type: 'sale' | 'refund' | 'payment' | 'tax'
  title: string
  description: string
  value?: number
  href?: string
  time: string
  read: boolean
}

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const ICONS = {
  sale:    { icon: TrendingUp,    color: '#28c76f', bg: 'rgba(40,199,111,0.1)' },
  refund:  { icon: TrendingDown,  color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)' },
  payment: { icon: CalendarClock, color: '#5d5fef', bg: 'rgba(93,95,239,0.1)' },
  tax:     { icon: AlertTriangle, color: '#ff9f43', bg: 'rgba(255,159,67,0.1)' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1)  return 'agora'
  if (h < 24) return `${h}h atrás`
  if (d < 7)  return `${d}d atrás`
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export function NotificationsDropdown() {
  const router = useRouter()
  const [open, setOpen]           = useState(false)
  const [notifications, setNotif] = useState<Notification[]>([])
  const [loading, setLoading]     = useState(false)
  const [readIds, setReadIds]     = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const now = new Date()
    const yesterday  = new Date(now.getTime() - 86400000).toISOString()
    const last7days  = new Date(now.getTime() - 7 * 86400000).toISOString()
    const next7days  = new Date(now.getTime() + 7 * 86400000).toISOString()

    const [
      { data: newSales },
      { data: refunds },
      { data: upcoming },
    ] = await Promise.all([
      // Vendas aprovadas nas últimas 24h
      supabase.from('transactions')
        .select('id, product_name, amount, transaction_date, platform')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .gte('transaction_date', yesterday)
        .order('transaction_date', { ascending: false })
        .limit(5),

      // Reembolsos nos últimos 7 dias
      supabase.from('transactions')
        .select('id, product_name, amount, transaction_date')
        .eq('user_id', user.id)
        .eq('status', 'refunded')
        .gte('transaction_date', last7days)
        .order('transaction_date', { ascending: false })
        .limit(3),

      // Pagamentos nos próximos 7 dias
      supabase.from('payment_schedule')
        .select('id, platform, amount, expected_date')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('expected_date', now.toISOString().split('T')[0])
        .lte('expected_date', next7days.split('T')[0])
        .order('expected_date', { ascending: true })
        .limit(3),
    ])

    const notifs: Notification[] = []

    // Agrupamento de vendas recentes
    if (newSales && newSales.length > 0) {
      const total = newSales.reduce((s, t) => s + Number(t.amount), 0)
      if (newSales.length === 1) {
        notifs.push({
          id:          `sale-${newSales[0].id}`,
          type:        'sale',
          title:       'Nova venda',
          description: newSales[0].product_name,
          value:       Number(newSales[0].amount),
          href:        '/receita',
          time:        newSales[0].transaction_date,
          read:        false,
        })
      } else {
        notifs.push({
          id:          `sales-batch-${yesterday}`,
          type:        'sale',
          title:       `${newSales.length} vendas nas últimas 24h`,
          description: `Total: ${fmt.format(total)}`,
          href:        '/receita',
          time:        newSales[0].transaction_date,
          read:        false,
        })
      }
    }

    // Reembolsos
    for (const r of refunds ?? []) {
      notifs.push({
        id:          `refund-${r.id}`,
        type:        'refund',
        title:       'Reembolso processado',
        description: r.product_name,
        value:       Number(r.amount),
        href:        '/receita?status=refunded',
        time:        r.transaction_date,
        read:        false,
      })
    }

    // Pagamentos próximos
    for (const p of upcoming ?? []) {
      const days = Math.ceil((new Date(p.expected_date).getTime() - now.getTime()) / 86400000)
      notifs.push({
        id:          `payment-${p.id}`,
        type:        'payment',
        title:       days === 0 ? 'Pagamento previsto hoje' : `Pagamento em ${days} dia${days > 1 ? 's' : ''}`,
        description: `${p.platform.charAt(0).toUpperCase() + p.platform.slice(1)} · ${fmt.format(Number(p.amount))}`,
        href:        '/calendario',
        time:        new Date(p.expected_date).toISOString(),
        read:        false,
      })
    }

    // Aviso de imposto (sempre útil)
    const { data: taxData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .gte('transaction_date', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())
      .limit(1000)

    if (taxData && taxData.length > 0) {
      const grossMonth = taxData.reduce((s, t) => s + Number(t.amount), 0)
      const taxEst = grossMonth * 0.06
      if (taxEst > 100) {
        notifs.push({
          id:          `tax-${now.getMonth()}`,
          type:        'tax',
          title:       'Imposto do mês',
          description: `Separar ${fmt.format(taxEst)} (6% de ${fmt.format(grossMonth)})`,
          href:        '/impostos',
          time:        new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          read:        false,
        })
      }
    }

    setNotif(notifs)
    setLoading(false)
  }, [])

  function handleOpen() {
    setOpen(v => !v)
    if (!open && notifications.length === 0) fetchNotifications()
    if (!open) {
      // Marcar todas como lidas
      setReadIds(new Set(notifications.map(n => n.id)))
    }
  }

  const unread = notifications.filter(n => !readIds.has(n.id)).length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-100"
        style={{ color: '#64748b' }}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span
            className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
            style={{ background: '#ff6b6b' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 z-50 rounded-2xl overflow-hidden"
          style={{
            width: 340,
            background: '#fff',
            border: '1px solid #e8eaef',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #f0f2f8' }}>
            <p className="text-sm font-bold" style={{ color: '#1a1d2e' }}>Notificações</p>
            <button onClick={() => setOpen(false)}>
              <X className="w-4 h-4" style={{ color: '#94a3b8' }} />
            </button>
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>
                Carregando...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: '#e8eaef' }} />
                <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Nenhuma notificação</p>
                <p className="text-xs mt-1" style={{ color: '#cbd5e1' }}>Você está em dia!</p>
              </div>
            ) : (
              notifications.map((n) => {
                const { icon: Icon, color, bg } = ICONS[n.type]
                const isRead = readIds.has(n.id)
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      setReadIds(s => new Set([...s, n.id]))
                      setOpen(false)
                      if (n.href) router.push(n.href)
                    }}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    style={{ borderBottom: '1px solid #f8f9fa', opacity: isRead ? 0.6 : 1 }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: bg }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold" style={{ color: '#1a1d2e' }}>{n.title}</p>
                        {!isRead && (
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: '#5d5fef' }} />
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: '#64748b' }}>{n.description}</p>
                      {n.value && (
                        <p className="text-xs font-bold tabular-nums mt-0.5" style={{ color }}>
                          {fmt.format(n.value)}
                        </p>
                      )}
                      <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>{timeAgo(n.time)}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {notifications.length > 0 && (
            <button
              onClick={() => { setReadIds(new Set(notifications.map(n => n.id))); fetchNotifications() }}
              className="w-full py-2.5 text-xs font-semibold transition-colors hover:bg-slate-50"
              style={{ color: '#5d5fef', borderTop: '1px solid #f0f2f8' }}
            >
              Marcar todas como lidas · Atualizar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
