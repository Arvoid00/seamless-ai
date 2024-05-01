import { clearChats, getChats, getChatsByAgent } from '@/app/actions'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { SupabaseAgent } from '@/types/supabase'
import { cache } from 'react'

interface SidebarListProps {
  userId: string
  agent?: SupabaseAgent
  children?: React.ReactNode
}

const loadChats = async (userId: string, agentId: number | undefined) => {
  console.log(userId, agentId);
  return await getChatsByAgent(userId, agentId)
  // return await getChats(userId)
}

export async function SidebarList({ userId, agent }: SidebarListProps) {
  const chats = await loadChats(userId, agent?.id)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-2 px-2">
            <SidebarItems chats={chats} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No chat history</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
        <ClearHistory clearChats={clearChats} isEnabled={chats?.length > 0} />
      </div>
    </div>
  )
}
