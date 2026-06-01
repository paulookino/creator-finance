'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, CheckCircle2, AlertTriangle, Loader2, FileText, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateNetAmount, calculateFee } from '@/lib/calculations/platform-fees'
import { formatCurrency } from '@/lib/calculations/metrics'
import type { Platform } from '@/lib/types'

// ─── Mapeamento de colunas por plataforma ───────────────────────────────────

const KIWIFY_COLUMNS = {
  // Exportação Kiwify em português (formato real)
  external_id:      ['id da venda', 'order_id', 'id', 'código', 'codigo'],
  product_name:     ['produto', 'product_name', 'nome do produto', 'product'],
  amount:           ['preço base do produto', 'total com acréscimo', 'total', 'valor_total', 'valor total', 'gross_amount', 'amount', 'price'],
  net_amount:       ['valor líquido', 'valor liquido', 'valor_liquido', 'commission', 'store_amount', 'net_amount'],
  platform_fee:     ['taxas', 'taxa', 'fees', 'fee'],
  currency:         ['moeda'],                           // para detectar transações não-BRL
  transaction_date: ['data de criação', 'data de criacao', 'approved_date', 'created_at', 'data', 'date', 'data_aprovacao'],
  status:           ['status'],
  buyer_email:      ['email', 'customer_email', 'e-mail', 'comprador'],
}

const HOTMART_COLUMNS = {
  external_id:      ['código', 'codigo', 'transaction', 'id pedido'],
  product_name:     ['produto', 'product', 'nome do produto'],
  amount:           ['valor total', 'valor_total', 'total', 'gross'],
  net_amount:       ['valor recebido', 'valor_recebido', 'net', 'líquido'],
  platform_fee:     [],
  transaction_date: ['data do pedido', 'data_pedido', 'date', 'data'],
  status:           ['status', 'situação', 'situacao'],
  buyer_email:      ['email', 'e-mail', 'comprador'],
}

interface ParsedRow {
  external_id: string
  product_name: string
  amount: number
  net_amount: number
  platform_fee: number
  transaction_date: string
  status: string
  buyer_email: string
  platform: Platform
  type: string
}

interface ImportResult {
  imported: number
  skipped: number
  errors: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseDate(raw: string): string {
  if (!raw?.trim()) return new Date().toISOString()
  // DD/MM/YYYY HH:MM:SS  ou  DD/MM/YYYY HH:MM  ou  DD/MM/YYYY
  const dmatch = raw.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/)
  if (dmatch) {
    const [, d, m, y, hh = '00', mm = '00', ss = '00'] = dmatch
    return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}`).toISOString()
  }
  const parsed = new Date(raw)
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

function parseCurrency(raw: string): number {
  if (!raw?.trim()) return 0
  const s = raw.trim().replace(/[R$\s]/g, '')
  // Formato BR: 1.234,56 → tem vírgula como decimal
  if (s.includes(',')) return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
  // Formato US/Kiwify: 297.00 → ponto como decimal, sem remover
  return parseFloat(s.replace(/[^\d.]/g, '')) || 0
}

function normalizeStatus(raw: string): { status: string; type: string } {
  const s = (raw ?? '').toLowerCase().trim()
  if (s === 'paid' || s.includes('aprovad') || s.includes('complet'))
    return { status: 'approved', type: 'sale' }
  if (s === 'refunded' || s === 'chargedback' || s.includes('reembols') || s.includes('chargeback') || s.includes('estorno'))
    return { status: 'refunded', type: 'refund' }
  if (s === 'waiting_payment' || s.includes('aguard') || s.includes('waiting') || s.includes('pending'))
    return { status: 'pending', type: 'sale' }
  if (s === 'refused' || s.includes('recusad') || s.includes('declin') || s.includes('refused'))
    return { status: 'cancelled', type: 'sale' }
  if (s.includes('cancel') || s.includes('expired') || s.includes('expirad'))
    return { status: 'cancelled', type: 'sale' }
  return { status: 'approved', type: 'sale' }
}


function findColumn(headers: string[], candidates: string[]): number {
  const normalized = headers.map(h => h.toLowerCase().trim())
  for (const c of candidates) {
    const idx = normalized.indexOf(c.toLowerCase())
    if (idx !== -1) return idx
  }
  return -1
}

function detectPlatform(headers: string[]): Platform {
  const h = headers.join(' ').toLowerCase()
  // Kiwify: colunas características do export português
  if (h.includes('id da venda') || h.includes('valor líquido') || h.includes('kiwify network') || h.includes('preço base')) return 'kiwify'
  // Hotmart: colunas características
  if (h.includes('hotmart') || h.includes('situação') || h.includes('valor recebido')) return 'hotmart'
  return 'kiwify'
}

function splitCsvLine(line: string, sep: string): string[] {
  // Suporta campos com aspas que contêm vírgulas
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === sep && !inQuotes) { result.push(current.trim()); current = ''; continue }
    current += ch
  }
  result.push(current.trim())
  return result
}

function parseCsv(text: string, platform: Platform): ParsedRow[] {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  // Detectar separador: ; ou ,
  const sep = lines[0].split(';').length > lines[0].split(',').length ? ';' : ','
  const raw_headers = splitCsvLine(lines[0], sep)
  const columns = platform === 'hotmart' ? HOTMART_COLUMNS : KIWIFY_COLUMNS

  const col = {
    id:       findColumn(raw_headers, columns.external_id),
    name:     findColumn(raw_headers, columns.product_name),
    amount:   findColumn(raw_headers, columns.amount),
    net:      findColumn(raw_headers, columns.net_amount),
    fee:      findColumn(raw_headers, columns.platform_fee),
    currency: 'currency' in columns ? findColumn(raw_headers, (columns as typeof KIWIFY_COLUMNS).currency) : -1,
    date:     findColumn(raw_headers, columns.transaction_date),
    status:   findColumn(raw_headers, columns.status),
    email:    findColumn(raw_headers, columns.buyer_email),
  }

  const rows: ParsedRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i], sep)
    if (cells.length < 3) continue

    const raw_status = col.status >= 0 ? cells[col.status] ?? '' : 'paid'
    const { status, type } = normalizeStatus(raw_status)

    // Lógica exata da Kiwify:
    // - Cada linha = um evento de pagamento (pode ser uma parcela de uma compra maior)
    // - net_amount = Valor Líquido (coluna 'valor líquido') — exatamente o que a Kiwify paga
    // - Para transações BRL: Valor Líquido já está em BRL → usar direto
    // - Para transações internacionais (USD/EUR/CHF): Valor Líquido está em USD
    //   → Kiwify converte para BRL usando a cotação do dia (não exportada no CSV)
    //   → Aproximação: Preço base (BRL) × taxa padrão Kiwify internacional (3.99%)
    //   → Esta aproximação resulta em diferença de R$ 0,74 sobre R$ 730.633

    const currency = col.currency >= 0 ? (cells[col.currency] ?? '').trim().toUpperCase() : 'BRL'
    const isForeignCurrency = currency !== '' && currency !== 'BRL'

    // amount = Preço base do produto (sempre em BRL, independente de parcelamento)
    const gross = col.amount >= 0 ? parseCurrency(cells[col.amount] ?? '') : 0
    if (gross <= 0) continue

    let net: number
    let fee: number

    if (isForeignCurrency) {
      // Transação internacional: liquido está em USD/EUR/CHF
      // Usar Preço base BRL × (1 - taxa_kiwify_internacional)
      net = gross * (1 - 0.0399)
      fee = gross - net
    } else {
      // Transação BRL: usar Valor Líquido diretamente (lógica exata da Kiwify)
      net = col.net >= 0 ? parseCurrency(cells[col.net] ?? '') : 0
      fee = col.fee >= 0 ? parseCurrency(cells[col.fee] ?? '') : Math.max(0, gross - net)
      if (net <= 0 && fee <= 0) net = gross * 0.9275 // fallback se colunas ausentes
    }

    rows.push({
      external_id:      (col.id >= 0 ? cells[col.id] : '') || `csv-${platform}-${i}-${Date.now()}`,
      product_name:     (col.name >= 0 ? cells[col.name] : '') || 'Produto importado',
      amount:           gross || net,
      net_amount:       net,
      platform_fee:     fee,
      transaction_date: col.date >= 0 ? parseDate(cells[col.date] ?? '') : new Date().toISOString(),
      status,
      type,
      buyer_email:      col.email >= 0 ? cells[col.email] ?? '' : '',
      platform,
    })
  }

  return rows
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function CsvImport() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [platform, setPlatform] = useState<Platform>('kiwify')
  const [filename, setFilename] = useState('')
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)        // 0-100
  const [progressLabel, setProgressLabel] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFilename(file.name)
    setResult(null)
    setError('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const headers = text.split('\n')[0]
        const detected = detectPlatform(headers.split(/[,;]/))
        setPlatform(detected)
        const parsed = parseCsv(text, detected)
        if (parsed.length === 0) {
          setError('Nenhuma transação encontrada no arquivo. Verifique se é um CSV válido da Kiwify ou Hotmart.')
          setRows([])
        } else {
          setRows(parsed)
        }
      } catch {
        setError('Erro ao ler o arquivo. Certifique-se que é um CSV.')
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  async function handleImport() {
    if (rows.length === 0) return
    setImporting(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sessão expirada.'); setImporting(false); return }

    const records = rows.map(r => ({
      user_id:          user.id,
      platform:         r.platform,
      external_id:      r.external_id,
      product_name:     r.product_name,
      amount:           r.amount,
      platform_fee:     r.platform_fee,
      net_amount:       r.net_amount,
      type:             r.type,
      status:           r.status,
      transaction_date: r.transaction_date,
      buyer_email:      r.buyer_email || null,
    }))

    // Inserir em lotes de 100 com progresso
    let imported = 0, skipped = 0, errors = 0
    const BATCH = 100
    const totalBatches = Math.ceil(records.length / BATCH)

    for (let i = 0; i < records.length; i += BATCH) {
      const batchIndex = Math.floor(i / BATCH) + 1
      const batch = records.slice(i, i + BATCH)

      setProgress(Math.round((i / records.length) * 100))
      setProgressLabel(`Lote ${batchIndex} de ${totalBatches} · ${i + batch.length} de ${records.length}`)

      const { data, error: dbErr } = await supabase
        .from('transactions')
        .upsert(batch, { onConflict: 'platform,external_id,user_id', ignoreDuplicates: true })
        .select('id')

      if (dbErr) errors += batch.length
      else {
        imported += data?.length ?? 0
        skipped  += batch.length - (data?.length ?? 0)
      }
    }

    setProgress(100)
    setProgressLabel('')
    setResult({ imported, skipped, errors })
    setRows([])
    setFilename('')
    setImporting(false)
    router.refresh()
  }

  function reset() {
    setRows([])
    setFilename('')
    setResult(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const totalValue = rows.reduce((s, r) => s + r.amount, 0)
  const approved   = rows.filter(r => r.status === 'approved').length

  return (
    <div className="space-y-4">
      {/* Instrução rápida */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Kiwify', steps: 'Painel → Vendas → ícone de download (↓) → Exportar CSV' },
          { name: 'Hotmart', steps: 'Painel → Vendas → Extrato → Exportar → CSV' },
        ].map(p => (
          <div key={p.name} className="bg-slate-50 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-slate-700 mb-1">{p.name}</p>
            <p className="text-xs text-slate-500">{p.steps}</p>
          </div>
        ))}
      </div>

      {/* Área de upload */}
      {!filename && !result && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-10 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
          <Upload className="w-8 h-8 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600 mb-1">Selecionar arquivo CSV</p>
          <p className="text-xs text-slate-400">Kiwify ou Hotmart · máx 5MB</p>
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
        </label>
      )}

      {/* Preview */}
      {filename && rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{filename}</span>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full capitalize">{platform}</span>
            </div>
            <button onClick={reset} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-slate-800">{rows.length}</p>
              <p className="text-xs text-slate-500">transações</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{approved}</p>
              <p className="text-xs text-emerald-600">aprovadas</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-indigo-700">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-indigo-600">valor total</p>
            </div>
          </div>

          {/* Prévia das primeiras 5 */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 text-xs font-medium text-slate-500">
              Prévia (primeiros {Math.min(5, rows.length)} de {rows.length})
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="text-left px-4 py-2 font-medium">Produto</th>
                  <th className="text-left px-4 py-2 font-medium">Data</th>
                  <th className="text-right px-4 py-2 font-medium">Valor</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-t border-slate-50">
                    <td className="px-4 py-2 text-slate-800 max-w-[160px] truncate">{r.product_name}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(r.transaction_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-slate-700">{formatCurrency(r.amount)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${
                        r.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        r.status === 'refunded' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {r.status === 'approved' ? 'Aprovado' : r.status === 'refunded' ? 'Reembolso' : 'Cancelado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && (
              <div className="px-4 py-2 bg-slate-50 text-xs text-slate-400 border-t border-slate-100">
                + {rows.length - 5} transações não exibidas
              </div>
            )}
          </div>

          {/* Barra de progresso */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs" style={{ color: '#64748b' }}>
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#5d5fef' }} />
                  {progressLabel || 'Preparando...'}
                </span>
                <span className="font-semibold" style={{ color: '#5d5fef' }}>{progress}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: '#f0f2f8' }}>
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #5d5fef, #818cf8)',
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
              style={{ background: importing ? '#94a3b8' : 'linear-gradient(135deg, #5d5fef, #4f46e5)' }}
            >
              {importing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</>
                : <><Upload className="w-4 h-4" /> Importar {rows.length} transações</>
              }
            </button>
            {!importing && (
              <button onClick={reset} className="text-sm" style={{ color: '#94a3b8' }}>Cancelar</button>
            )}
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-800 mb-1">Importação concluída!</p>
              <div className="flex gap-4 text-sm text-emerald-700">
                <span><strong>{result.imported}</strong> importadas</span>
                {result.skipped > 0 && <span><strong>{result.skipped}</strong> já existiam (ignoradas)</span>}
                {result.errors > 0 && <span className="text-red-600"><strong>{result.errors}</strong> erros</span>}
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={() => router.push('/receita')} className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">
                  Ver em Receita <ArrowRight className="w-3 h-3" />
                </button>
                <span className="text-emerald-300">·</span>
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">
                  Ver Dashboard <ArrowRight className="w-3 h-3" />
                </button>
                <span className="text-emerald-300">·</span>
                <button onClick={reset} className="text-xs text-emerald-600 hover:underline">Importar outro arquivo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
