'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatPercent, momGrowth } from '@/lib/calculations/metrics'

const THEMES = {
  default: { icon: '#5d5fef', iconBg: 'rgba(93,95,239,0.12)', label: '#94a3b8' },
  success: { icon: '#28c76f', iconBg: 'rgba(40,199,111,0.12)', label: '#94a3b8' },
  warning: { icon: '#ff9f43', iconBg: 'rgba(255,159,67,0.12)', label: '#94a3b8' },
  danger:  { icon: '#ff6b6b', iconBg: 'rgba(255,107,107,0.12)', label: '#94a3b8' },
}

interface MetricCardProps {
  title:          string
  value:          number
  previousValue?: number
  subtitle?:      string
  format?:        'currency' | 'number' | 'percent'
  color?:         'default' | 'success' | 'warning' | 'danger'
  icon?:          React.ReactNode
}

export function MetricCard({
  title, value, previousValue, subtitle,
  format = 'currency', color = 'default', icon,
}: MetricCardProps) {
  const growth = previousValue !== undefined ? momGrowth(value, previousValue) : null
  const theme  = THEMES[color]

  const formattedValue = format === 'currency'
    ? formatCurrency(value)
    : format === 'percent'
    ? `${value.toFixed(1)}%`
    : value.toLocaleString('pt-BR')

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 hover:shadow-md cursor-default"
      style={{
        background: '#ffffff',
        border: '1px solid #e8eaef',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      {/* Ícone + label */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: theme.iconBg }}
        >
          {icon ? (
            <span style={{ color: theme.icon }}>{icon}</span>
          ) : (
            <div className="w-4 h-4 rounded-full" style={{ background: theme.icon }} />
          )}
        </div>
        {growth !== null && (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg"
            style={{
              background: growth >= 0 ? 'rgba(40,199,111,0.1)' : 'rgba(255,107,107,0.1)',
              color:      growth >= 0 ? '#28c76f' : '#ff6b6b',
            }}
          >
            {growth >= 0
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            {Math.abs(growth).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Valor */}
      <p
        className="text-2xl font-bold tabular-nums mb-1"
        style={{ color: '#1a1d2e', fontVariantNumeric: 'tabular-nums' }}
      >
        {formattedValue}
      </p>

      {/* Título */}
      <p className="text-xs font-medium" style={{ color: '#94a3b8' }}>{title}</p>

      {subtitle && (
        <p className="text-[11px] mt-1" style={{ color: '#cbd5e1' }}>{subtitle}</p>
      )}
    </div>
  )
}
