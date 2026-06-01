import type { TaxRegime } from '../types'

export function estimateTax(
  revenue: number,
  regime: TaxRegime,
  rate: number,
  meiFlatValue = 75.90
): number {
  if (regime === 'mei') return meiFlatValue
  return revenue * rate
}

export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
  mei: 'MEI',
  simples: 'Simples Nacional',
  presumido: 'Lucro Presumido',
  real: 'Lucro Real',
}

export const DEFAULT_RATES: Record<TaxRegime, number> = {
  mei: 0,
  simples: 0.06,
  presumido: 0.1188,
  real: 0.15,
}
