import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'

import { getUser } from '@/app/(auth)/actions'
import { nanoid } from 'nanoid'
import { getAgentByName } from '@/app/agents/actions'

export interface ChatPageProps {
  params: {
    agent: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  return {
    title: 'Chat'
  }
}

export default async function AgentPage({ params }: ChatPageProps) {
  const user = await getUser()
  const missingKeys = await getMissingKeys()
  const agentName = params.agent

  if (!user) {
    redirect(`/login?next=/${agentName}`)
  }

  const { data: agent, error } = await getAgentByName(agentName)
  if (!agent || error) redirect('/')

  const id = nanoid()

  return (
    <AI initialAIState={{ chatId: id, messages: [], agent: agent }}>
      <Chat
        id={id}
        user={user}
        missingKeys={missingKeys}
      />
    </AI>
  )
}
