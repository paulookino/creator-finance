'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { MonthlyRevenue, Platform } from '@/lib/types'
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/calculations/platform-fees'
import { formatCurrency } from '@/lib/calculations/metrics'

export function PlatformDonut({ data }: { data: MonthlyRevenue }) {
  const platforms: Platform[] = ['hotmart', 'kiwify', 'adsense', 'manual']
  const chartData = platforms
    .map(p => ({ name: PLATFORM_LABELS[p], value: data[p] as number, platform: p }))
    .filter(d => d.value > 0)
  const total = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={130} height={130}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
            dataKey="value" strokeWidth={2} stroke="#f0f2f8" paddingAngle={3}>
            {chartData.map(e => (
              <Cell key={e.platform} fill={PLATFORM_COLORS[e.platform as Platform]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: unknown) => formatCurrency(Number(v))}
            contentStyle={{ background: '#fff', border: '1px solid #e8eaef', borderRadius: 12, fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2 flex-1">
        {chartData.map(e => (
          <div key={e.platform} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PLATFORM_COLORS[e.platform as Platform] }} />
              <span className="text-xs font-medium" style={{ color: '#64748b' }}>{e.name}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold tabular-nums" style={{ color: '#1a1d2e' }}>{formatCurrency(e.value)}</span>
              <span className="text-[10px] ml-1" style={{ color: '#94a3b8' }}>{((e.value/total)*100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
