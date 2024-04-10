'use client'

import { IconOpenAI, IconUser, IconVercel } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { spinner } from './spinner'
import { CodeBlock } from '../ui/codeblock'
import { MemoizedReactMarkdown } from '../markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { StreamableValue } from 'ai/rsc'
import { useStreamableText } from '@/lib/hooks/use-streamable-text'
import { PageSection } from '@/app/vectorsearch/route'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from '../ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


// Different types of message bubbles.

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
        <IconUser />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden pl-2">
        {children}
      </div>
    </div>
  )
}

export function VectorMessage({
  data,
  usage,
  sections,
  className
}: {
  // content: string | StreamableValue<string>
  data: any
  usage?: { prompt_tokens: number, completion_tokens: number, total_tokens: number }
  sections: PageSection[]
  className?: string
}) {
  const content = data.message.content
  const text = useStreamableText(content)

  return (
    <Sheet>
      <div className={cn('group relative flex items-start md:-ml-12', className)}>
        <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
          <IconVercel />
        </div>
        <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
          <div className="">
            <p className='flex justify-between'>
              <span>Results for query with VectorSearch:</span>
              {sections && (<Tooltip>
                <TooltipTrigger><SheetTrigger>🧠</SheetTrigger></TooltipTrigger>
                <TooltipContent>
                  <p>Show sources</p>
                </TooltipContent>
              </Tooltip>)}
            </p>
          </div>
          <MemoizedReactMarkdown
            className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
            remarkPlugins={[remarkGfm, remarkMath]}
            components={{
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>
              },
              code({ node, inline, className, children, ...props }) {
                if (children.length) {
                  if (children[0] == '▍') {
                    return (
                      <span className="mt-1 animate-pulse cursor-default">▍</span>
                    )
                  }

                  children[0] = (children[0] as string).replace('`▍`', '▍')
                }

                const match = /language-(\w+)/.exec(className || '')

                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }

                return (
                  <CodeBlock
                    key={Math.random()}
                    language={(match && match[1]) || ''}
                    value={String(children).replace(/\n$/, '')}
                    {...props}
                  />
                )
              }
            }}
          >
            {text}
          </MemoizedReactMarkdown>
          {usage && (
            <div className="text-xs text-gray-500">
              <p>
                Prompt tokens: {usage.prompt_tokens}, Completion tokens:{' '}
                {usage.completion_tokens}, Total tokens: {usage.total_tokens}
              </p>
            </div>
          )}
          <SheetContent className='w-[500px]'>
            <ScrollArea className="h-full w-full">
              <SheetHeader className='mb-5'>
                <SheetTitle>Sources</SheetTitle>
                <SheetDescription>
                  The sources used to generate this answer.
                </SheetDescription>
              </SheetHeader>
              {sections && (
                sections.map((section, index) => (
                  <div key={index} className="text-xs space-y-2 mb-3">
                    <p>
                      Section {index + 1}: (Source: {section.metadata?.source ?? 'unknown'})
                    </p>
                    <p>{section.content}</p>
                    <p className='text-xs text-gray-500'>Similarity score: {section.similarity}</p>
                  </div>
                ))
              )}
            </ScrollArea>
          </SheetContent>
        </div>
      </div>
    </Sheet>
  )
}

export function BotMessage({
  content,
  className
}: {
  content: string | StreamableValue<string>
  className?: string
}) {
  const text = useStreamableText(content)

  return (
    <div className={cn('group relative flex items-start md:-ml-12', className)}>
      <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
        <IconOpenAI />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 animate-pulse cursor-default">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {text}
        </MemoizedReactMarkdown>
      </div>
    </div>
  )
}

export function BotCard({
  children,
  showAvatar = true
}: {
  children: React.ReactNode
  showAvatar?: boolean
}) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div
        className={cn(
          'flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm',
          !showAvatar && 'invisible'
        )}
      >
        <IconOpenAI />
      </div>
      <div className="ml-4 flex-1 pl-2">{children}</div>
    </div>
  )
}

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        'mt-2 flex items-center justify-center gap-2 text-xs text-gray-500'
      }
    >
      <div className={'max-w-[600px] flex-initial p-2'}>{children}</div>
    </div>
  )
}

export function SpinnerMessage({ children, message }: { children?: React.ReactNode, message?: string }) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
        <IconOpenAI />
      </div>
      <div className="ml-4 h-[24px] flex flex-row items-center flex-1 space-y-2 overflow-hidden px-1">
        {spinner}
      </div>
      {/* <div className="ml-4 flex flex-row items-center flex-1 space-y-2 overflow-hidden px-1">
        <span className='mr-2'>{spinner}</span> <span>{message}</span>
        {children}
      </div> */}

    </div>
  )
}
