export type Platform = 'hotmart' | 'kiwify' | 'adsense' | 'manual'
export type TaxRegime = 'mei' | 'simples' | 'presumido' | 'real'
export type TransactionType = 'sale' | 'refund' | 'subscription' | 'affiliate' | 'adsense' | 'brand_deal'
export type TransactionStatus = 'approved' | 'pending' | 'refunded' | 'cancelled'

export interface Transaction {
  id: string
  user_id: string
  platform: Platform
  external_id?: string
  product_name: string
  product_external_id?: string
  amount: number
  platform_fee: number
  net_amount: number
  type: TransactionType
  status: TransactionStatus
  transaction_date: string
  paid_at?: string
  buyer_email?: string
  notes?: string
  created_at: string
}

export interface Product {
  id: string
  user_id: string
  platform: Platform
  external_id?: string
  name: string
  price: number
  is_active: boolean
  total_revenue: number
  total_sales: number
  avg_ticket: number
}

export interface PaymentSchedule {
  id: string
  platform: Platform
  expected_date: string
  amount: number
  period_start?: string
  period_end?: string
  status: 'pending' | 'received' | 'delayed'
}

export interface Metrics {
  gross_revenue: number
  net_revenue: number
  tax_estimate: number
  prev_gross_revenue: number
  prev_net_revenue: number
  total_sales: number
  total_refunds: number
  avg_ticket: number
}

export interface MonthlyRevenue {
  month: string
  hotmart: number
  kiwify: number
  adsense: number
  manual: number
  total: number
}

export interface ProductMetrics {
  name: string
  platform: Platform
  total_revenue: number
  total_sales: number
  avg_ticket: number
  pct_of_total: number
  trend: 'up' | 'down' | 'stable'
}
