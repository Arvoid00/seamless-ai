import { SidebarDesktop } from '@/components/sidebar-desktop'

interface ChatLayoutProps {
    children: React.ReactNode
    params: { agent: string }
}

export default async function AgentLayout({ children, params }: ChatLayoutProps) {

    // console.log(params);

    return (
        <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
            <SidebarDesktop />
            {children}
        </div>
    )
}
