import type { Transaction, MonthlyRevenue, ProductMetrics, PaymentSchedule } from './types'
import { calculateNetAmount, calculateFee } from './calculations/platform-fees'

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', user_id: 'u1', platform: 'hotmart', product_name: 'Curso de Identidade Feminina', amount: 997, platform_fee: calculateFee('hotmart', 997), net_amount: calculateNetAmount('hotmart', 997), type: 'sale', status: 'approved', transaction_date: '2026-06-01T10:00:00Z', created_at: '2026-06-01T10:00:00Z' },
  { id: '2', user_id: 'u1', platform: 'hotmart', product_name: 'Curso de Identidade Feminina', amount: 997, platform_fee: calculateFee('hotmart', 997), net_amount: calculateNetAmount('hotmart', 997), type: 'sale', status: 'approved', transaction_date: '2026-06-02T14:00:00Z', created_at: '2026-06-02T14:00:00Z' },
  { id: '3', user_id: 'u1', platform: 'kiwify', product_name: 'Mentoria Rainha Elegante', amount: 1497, platform_fee: calculateFee('kiwify', 1497), net_amount: calculateNetAmount('kiwify', 1497), type: 'sale', status: 'approved', transaction_date: '2026-06-03T09:00:00Z', created_at: '2026-06-03T09:00:00Z' },
  { id: '4', user_id: 'u1', platform: 'kiwify', product_name: 'Éden\'s Club', amount: 997, platform_fee: calculateFee('kiwify', 997), net_amount: calculateNetAmount('kiwify', 997), type: 'sale', status: 'approved', transaction_date: '2026-06-04T11:00:00Z', created_at: '2026-06-04T11:00:00Z' },
  { id: '5', user_id: 'u1', platform: 'hotmart', product_name: 'Ebook Filhas de Eva', amount: 47, platform_fee: calculateFee('hotmart', 47), net_amount: calculateNetAmount('hotmart', 47), type: 'sale', status: 'approved', transaction_date: '2026-06-05T16:00:00Z', created_at: '2026-06-05T16:00:00Z' },
  { id: '6', user_id: 'u1', platform: 'hotmart', product_name: 'Ebook Filhas de Eva', amount: 47, platform_fee: calculateFee('hotmart', 47), net_amount: calculateNetAmount('hotmart', 47), type: 'sale', status: 'approved', transaction_date: '2026-06-06T08:00:00Z', created_at: '2026-06-06T08:00:00Z' },
  { id: '7', user_id: 'u1', platform: 'kiwify', product_name: 'Éden\'s Club', amount: 997, platform_fee: calculateFee('kiwify', 997), net_amount: calculateNetAmount('kiwify', 997), type: 'sale', status: 'approved', transaction_date: '2026-06-07T13:00:00Z', created_at: '2026-06-07T13:00:00Z' },
  { id: '8', user_id: 'u1', platform: 'adsense', product_name: 'AdSense — YouTube', amount: 1240, platform_fee: calculateFee('adsense', 1240), net_amount: calculateNetAmount('adsense', 1240), type: 'adsense', status: 'approved', transaction_date: '2026-06-01T00:00:00Z', created_at: '2026-06-01T00:00:00Z' },
  { id: '9', user_id: 'u1', platform: 'manual', product_name: 'Brand Deal — Marca X', amount: 5000, platform_fee: 0, net_amount: 5000, type: 'brand_deal', status: 'approved', transaction_date: '2026-06-10T00:00:00Z', created_at: '2026-06-10T00:00:00Z' },
  { id: '10', user_id: 'u1', platform: 'hotmart', product_name: 'Curso de Identidade Feminina', amount: 997, platform_fee: calculateFee('hotmart', 997), net_amount: calculateNetAmount('hotmart', 997), type: 'refund', status: 'refunded', transaction_date: '2026-06-08T15:00:00Z', created_at: '2026-06-08T15:00:00Z' },
  { id: '11', user_id: 'u1', platform: 'hotmart', product_name: 'Curso de Identidade Feminina', amount: 997, platform_fee: calculateFee('hotmart', 997), net_amount: calculateNetAmount('hotmart', 997), type: 'sale', status: 'approved', transaction_date: '2026-06-11T10:00:00Z', created_at: '2026-06-11T10:00:00Z' },
  { id: '12', user_id: 'u1', platform: 'kiwify', product_name: 'Mentoria Rainha Elegante', amount: 1497, platform_fee: calculateFee('kiwify', 1497), net_amount: calculateNetAmount('kiwify', 1497), type: 'sale', status: 'approved', transaction_date: '2026-06-12T14:00:00Z', created_at: '2026-06-12T14:00:00Z' },
  { id: '13', user_id: 'u1', platform: 'kiwify', product_name: 'Éden\'s Club', amount: 997, platform_fee: calculateFee('kiwify', 997), net_amount: calculateNetAmount('kiwify', 997), type: 'sale', status: 'approved', transaction_date: '2026-06-13T09:00:00Z', created_at: '2026-06-13T09:00:00Z' },
  { id: '14', user_id: 'u1', platform: 'hotmart', product_name: 'Ebook Filhas de Eva', amount: 47, platform_fee: calculateFee('hotmart', 47), net_amount: calculateNetAmount('hotmart', 47), type: 'sale', status: 'approved', transaction_date: '2026-06-14T11:00:00Z', created_at: '2026-06-14T11:00:00Z' },
  { id: '15', user_id: 'u1', platform: 'hotmart', product_name: 'Curso de Identidade Feminina', amount: 997, platform_fee: calculateFee('hotmart', 997), net_amount: calculateNetAmount('hotmart', 997), type: 'sale', status: 'approved', transaction_date: '2026-06-15T16:00:00Z', created_at: '2026-06-15T16:00:00Z' },
]

export const MOCK_MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: 'jan/26', hotmart: 18400, kiwify: 9200, adsense: 980, manual: 2000, total: 30580 },
  { month: 'fev/26', hotmart: 21000, kiwify: 11000, adsense: 1050, manual: 0, total: 33050 },
  { month: 'mar/26', hotmart: 19500, kiwify: 13400, adsense: 1100, manual: 5000, total: 39000 },
  { month: 'abr/26', hotmart: 24000, kiwify: 15000, adsense: 1200, manual: 0, total: 40200 },
  { month: 'mai/26', hotmart: 22000, kiwify: 14500, adsense: 1180, manual: 3000, total: 40680 },
  { month: 'jun/26', hotmart: 27000, kiwify: 17000, adsense: 1240, manual: 5000, total: 50240 },
]

export const MOCK_PRODUCTS: ProductMetrics[] = [
  { name: 'Mentoria Rainha Elegante', platform: 'kiwify', total_revenue: 14970, total_sales: 10, avg_ticket: 1497, pct_of_total: 29.8, trend: 'up' },
  { name: 'Éden\'s Club', platform: 'kiwify', total_revenue: 11964, total_sales: 12, avg_ticket: 997, pct_of_total: 23.8, trend: 'up' },
  { name: 'Curso de Identidade Feminina', platform: 'hotmart', total_revenue: 10967, total_sales: 11, avg_ticket: 997, pct_of_total: 21.8, trend: 'stable' },
  { name: 'Brand Deal — Marca X', platform: 'manual', total_revenue: 5000, total_sales: 1, avg_ticket: 5000, pct_of_total: 9.9, trend: 'stable' },
  { name: 'AdSense — YouTube', platform: 'adsense', total_revenue: 1240, total_sales: 1, avg_ticket: 1240, pct_of_total: 2.5, trend: 'up' },
  { name: 'Ebook Filhas de Eva', platform: 'hotmart', total_revenue: 188, total_sales: 4, avg_ticket: 47, pct_of_total: 0.4, trend: 'down' },
]

export const MOCK_PAYMENT_SCHEDULE: PaymentSchedule[] = [
  { id: 's1', platform: 'kiwify', expected_date: '2026-06-20', amount: 8420, period_start: '2026-06-01', period_end: '2026-06-06', status: 'pending' },
  { id: 's2', platform: 'hotmart', expected_date: '2026-07-01', amount: 12600, period_start: '2026-05-25', period_end: '2026-06-07', status: 'pending' },
  { id: 's3', platform: 'kiwify', expected_date: '2026-06-27', amount: 6300, period_start: '2026-06-07', period_end: '2026-06-13', status: 'pending' },
  { id: 's4', platform: 'adsense', expected_date: '2026-07-21', amount: 1240, period_start: '2026-06-01', period_end: '2026-06-30', status: 'pending' },
  { id: 's5', platform: 'hotmart', expected_date: '2026-07-15', amount: 9800, period_start: '2026-06-08', period_end: '2026-06-22', status: 'pending' },
]

export const MOCK_METRICS = {
  gross_revenue: 50240,
  net_revenue: 42180,
  tax_estimate: 3014,
  prev_gross_revenue: 40680,
  prev_net_revenue: 34120,
  total_sales: 15,
  total_refunds: 1,
  avg_ticket: 1247,
}
