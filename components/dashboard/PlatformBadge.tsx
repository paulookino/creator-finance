import type { Platform } from '@/lib/types'
import { PLATFORM_LABELS, PLATFORM_COLORS } from '@/lib/calculations/platform-fees'

interface PlatformBadgeProps {
  platform: Platform
  size?: 'sm' | 'md'
}

export function PlatformBadge({ platform, size = 'md' }: PlatformBadgeProps) {
  const color = PLATFORM_COLORS[platform]
  const label = PLATFORM_LABELS[platform]
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  )
}
