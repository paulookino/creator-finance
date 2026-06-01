import { cn } from '@/lib/utils'

interface DarkCardProps {
  children: React.ReactNode
  className?: string
  glow?: 'none' | 'indigo' | 'emerald' | 'amber'
  style?: React.CSSProperties
}

export function DarkCard({ children, className, style }: DarkCardProps) {
  return (
    <div
      className={cn('rounded-2xl overflow-hidden', className)}
      style={{
        background: '#ffffff',
        border: '1px solid #e8eaef',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function DarkCardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-4', className)} style={{ borderBottom: '1px solid #f0f2f8' }}>
      {children}
    </div>
  )
}

export function DarkCardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-sm font-bold', className)} style={{ color: '#1a1d2e' }}>
      {children}
    </h3>
  )
}

export function DarkCardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-6', className)}>{children}</div>
}
