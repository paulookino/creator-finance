import type { Platform } from '../types'

const PLATFORM_FEE_RATES: Record<Platform, number> = {
  hotmart: 0.0999,
  kiwify: 0.0399,
  adsense: 0.32,
  manual: 0,
}

export function calculateNetAmount(platform: Platform, grossAmount: number): number {
  const rate = PLATFORM_FEE_RATES[platform] ?? 0
  return grossAmount * (1 - rate)
}

export function calculateFee(platform: Platform, grossAmount: number): number {
  const rate = PLATFORM_FEE_RATES[platform] ?? 0
  return grossAmount * rate
}

export function getFeeRate(platform: Platform): number {
  return PLATFORM_FEE_RATES[platform] ?? 0
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  hotmart: 'Hotmart',
  kiwify: 'Kiwify',
  adsense: 'AdSense',
  manual: 'Manual',
}

export const PLATFORM_COLORS: Record<Platform, string> = {
  hotmart: '#e63946',
  kiwify: '#7c3aed',
  adsense: '#4285f4',
  manual: '#64748b',
}
