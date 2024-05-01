import * as React from 'react'

import { shareChat } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconShare } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import type { AI } from '@/lib/chat/actions'
import { nanoid } from 'nanoid'
import { UserMessage } from './stocks/message'
import { badgeStyle } from './ui/badge'
import { Badge } from './ui/badge'
import { useAgent } from '@/lib/hooks/use-current-agent'
import { useTags } from '@/lib/hooks/use-tags'
import CurrentAgent from './current-agent'
import CurrentTags from './current-tags'
import { SupabaseAgent } from '@/types/supabase'
import { getAgents } from '@/app/agents/actions'
import { useRouter } from 'next/navigation'

export interface ChatPanelProps {
  id?: string
  title?: string
  input: string
  setInput: (value: string) => void
  isAtBottom: boolean
  scrollToBottom: () => void
}

export function ChatPanel({
  id,
  title,
  input,
  setInput,
  isAtBottom,
  scrollToBottom
}: ChatPanelProps) {
  const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const { agent, setAgent } = useAgent()
  const { selectedTags } = useTags()
  const [agents, setAgents] = React.useState<SupabaseAgent[]>([])
  const router = useRouter()

  React.useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await getAgents()
      if (error) console.error(error)
      if (data) setAgents(data)
    }
    fetchAgents()
  }, [])

  const exampleMessages = [
    {
      heading: 'What are the',
      subheading: 'trending memecoins today?',
      message: `What are the trending memecoins today?`
    },
    {
      heading: 'What is the price of',
      subheading: '$DOGE right now?',
      message: 'What is the price of $DOGE right now?'
    },
    // {
    //   heading: 'I would like to buy',
    //   subheading: '42 $DOGE',
    //   message: `I would like to buy 42 $DOGE`
    // },
    // {
    //   heading: 'What are some',
    //   subheading: `recent events about $DOGE?`,
    //   message: `What are some recent events about $DOGE?`
    // }
  ]

  const exampleInputs = [
    "Summarize Shining a light in the Black Box of Neural Networks",
    "What are shapley values as described in the document?",
    "Tell me about the personality types using the provided documents",
    "What are the key points of the Northwind Benefit plus plan"
  ]

  return (
    <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <p className='font-semibold p-1'>Render components</p>
        <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
          {messages.length === 0 &&
            exampleMessages.map((example, index) => (
              <div
                key={example.heading}
                className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${index > 1 && 'hidden md:block'
                  }`}
                onClick={async () => {
                  setMessages(currentMessages => [
                    ...currentMessages,
                    {
                      id: nanoid(),
                      display: <UserMessage>{example.message}</UserMessage>
                    }
                  ])
                  const body = { content: example.message, tags: selectedTags, agent: agent }
                  const responseMessage = await submitUserMessage(body)

                  setMessages(currentMessages => [
                    ...currentMessages,
                    responseMessage
                  ])
                }}
              >
                <div className="text-sm font-semibold">{example.heading}</div>
                <div className="text-sm text-zinc-600">
                  {example.subheading}
                </div>
              </div>
            ))}
        </div>
        {!agent && <p className='font-semibold p-1'>Use an agent</p>}
        <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
          {messages.length === 0 && !agent &&
            agents.map((agent, index) => (
              <div
                key={agent.id}
                className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${index > 1 && 'hidden md:block'
                  }`}
                onClick={async () => {
                  setAgent(agent)
                  router.push(`${agent.name}`)
                }}
              >
                <div className="text-sm font-semibold mb-1">🤖 {agent.name}</div>
                <div className="text-sm text-zinc-600">
                  {/* @ts-ignore Property 'map' does not exist on type 'string | number | boolean | { [key: string]: Json | undefined; } | Json[]'. */}
                  {agent.tags?.map(tag => (
                    <Badge key={tag.id} style={badgeStyle(tag.color)} className='mr-1 mb-1'>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
        </div>
        <p className='font-semibold p-1'>Example questions</p>
        <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
          {messages.length === 0 &&
            exampleInputs.map((example, index) => (
              <div
                key={example}
                className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${index > 1 && 'hidden md:block'
                  }`}
                onClick={async () => setInput(example)}
              >
                {/* <div className="text-sm font-semibold">{example}</div> */}
                <div className="text-sm text-zinc-600">
                  {example}
                </div>
              </div>
            ))}
        </div>

        {messages?.length >= 2 && id && title ? (
          <div className="flex h-12 items-center justify-center">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShareDialogOpen(true)}
              >
                <IconShare className="mr-2" />
                Share
              </Button>
              <ChatShareDialog
                open={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
                onCopy={() => setShareDialogOpen(false)}
                shareChat={shareChat}
                chat={{
                  id,
                  title,
                  messages: aiState.messages,
                  createdAt: aiState.createdAt,
                  userId: aiState.userId,
                  path: `${agent?.name ? agent.name + "/" : ''}chat/${id}`
                }}
              />
            </div>
          </div>
        ) : null}

        {agent ? <CurrentAgent /> : <CurrentTags />}

        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm input={input} setInput={setInput} />
          {/* <FooterText className="hidden sm:block" /> */}
        </div>
      </div>
    </div>
  )
}
