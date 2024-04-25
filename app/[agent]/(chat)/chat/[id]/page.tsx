import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'

import { getUser } from '@/app/(auth)/actions'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const chat = await getChat(params.id)
  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const user = await getUser()
  const missingKeys = await getMissingKeys()

  if (!user) {
    redirect(`/login?next=/chat/${params.id}`)
  }

  const chat = await getChat(params.id)

  if (!chat) {
    redirect('/')
  }

  if (chat?.userId !== user?.id) {
    notFound()
  }

  return (
    <AI initialAIState={{ chatId: chat.id, messages: chat.messages }}>
      <Chat
        id={chat.id}
        title={chat.title}
        user={user}
        initialMessages={chat.messages}
        missingKeys={missingKeys}
      />
    </AI>
  )
}
