import { DemoBanner }  from '@/components/demo/DemoBanner'
import { DemoSidebar } from '@/components/demo/DemoSidebar'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f0f2f8' }}>
      <DemoBanner />
      <div className="flex flex-1">
        <DemoSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
