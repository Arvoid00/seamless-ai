'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState, useActions } from 'ai/rsc'
import { usePathname, useRouter } from 'next/navigation'
import { Message } from '@/lib/chat/actions'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'
import { useAgent } from '@/lib/hooks/use-current-agent'
import { nanoid } from 'nanoid'
import { SystemMessage } from './stocks/message'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  title?: string
  id?: string
  user?: User
  missingKeys: string[]
}

export function Chat({ id, title, className, user, missingKeys }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useUIState()
  const [aiState] = useAIState()
  const { agent } = useAgent()

  const [_, setNewChatId] = useLocalStorage('newChatId', id)
  const { submitUserMessage } = useActions()

  useEffect(() => {
    if (user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `${agent?.name ? agent.name + "/" : ''}chat/${id}`)
      }
    }
  }, [id, path, user, messages])

  useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
  }, [aiState.messages, router])

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  useEffect(() => {
    const generateOnboardingMessage = async () => {

      const onboardingComplete = localStorage.getItem("onboardingComplete");
      const userOnboardingData = localStorage.getItem("userOnboardingData");

      if (!onboardingComplete || !userOnboardingData) return

      const onboardingPrompt = userOnboardingData

      const body = { content: onboardingPrompt, tags: [], agent: null }
      const responseMessage = await submitUserMessage(body)

      console.log("responseMessage", responseMessage);

      // const onboardingMessage = {
      //   id: nanoid(),
      //   display: <SystemMessage>{responseMessage.message}</SystemMessage>
      // }


      // Trigger the first chat prompt with extra data
      setMessages(currentMessages => [...currentMessages, responseMessage]);

      // Clean up localStorage so this doesn't trigger again
      localStorage.removeItem("onboardingComplete");
      localStorage.removeItem("userOnboardingData");

    }
    generateOnboardingMessage()
  }, []);

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } = useScrollAnchor()

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div
        className={cn('pb-[200px] pt-4 md:pt-10', className)}
        ref={messagesRef}
      >
        {messages.length ? (
          <ChatList messages={messages} isShared={false} user={user} />
        ) : (
          <EmptyScreen />
        )}
        <div className="h-px w-full" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        title={title}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
    </div>
  )
}
