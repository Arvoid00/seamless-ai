import { SidebarDesktop } from '@/components/sidebar-desktop'

interface ChatLayoutProps {
    children: React.ReactNode
    params: { agent: string }
}

export default async function AgentLayout({ children, params }: ChatLayoutProps) {
    return (
        <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
            <SidebarDesktop agentParam={params.agent} />
            {children}
        </div>
    )
}
