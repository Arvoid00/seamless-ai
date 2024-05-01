import { Sidebar } from '@/components/sidebar'
import { ChatHistory } from '@/components/chat-history'
import { getUser } from '@/app/(auth)/actions'

export async function SidebarDesktop({ agentParam }: { agentParam: string }) {
  const user = await getUser()
  if (!user?.id) return null

  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      <ChatHistory userId={user.id} agentName={agentParam} />
    </Sidebar>
  )
}
