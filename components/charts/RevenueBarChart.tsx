'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { MonthlyRevenue } from '@/lib/types'
import { PLATFORM_COLORS } from '@/lib/calculations/platform-fees'

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; fill: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + p.value, 0)
  return (
    <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#fff', border: '1px solid #e8eaef', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
      <p className="font-semibold mb-2" style={{ color: '#1a1d2e' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-6">
          <span style={{ color: p.fill }}>{p.name}</span>
          <span className="font-mono font-semibold" style={{ color: '#1a1d2e' }}>{fmt.format(p.value)}</span>
        </div>
      ))}
      <div className="flex justify-between pt-2 mt-2" style={{ borderTop: '1px solid #f0f2f8' }}>
        <span className="font-semibold" style={{ color: '#64748b' }}>Total</span>
        <span className="font-mono font-bold" style={{ color: '#5d5fef' }}>{fmt.format(total)}</span>
      </div>
    </div>
  )
}

export function RevenueBarChart({ data }: { data: MonthlyRevenue[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={18}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(93,95,239,0.04)', radius: 8 }} />
        <Bar dataKey="hotmart" name="Hotmart" fill={PLATFORM_COLORS.hotmart} radius={[4,4,0,0]} stackId="a" />
        <Bar dataKey="kiwify"  name="Kiwify"  fill={PLATFORM_COLORS.kiwify}  radius={[0,0,0,0]} stackId="a" />
        <Bar dataKey="adsense" name="AdSense" fill={PLATFORM_COLORS.adsense} radius={[0,0,0,0]} stackId="a" />
        <Bar dataKey="manual"  name="Manual"  fill={PLATFORM_COLORS.manual}  radius={[4,4,0,0]} stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  )
}
