"use client"

import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import { MarkdownWrapper } from '../markdown'
import { badgeStyle } from '../ui/badge'
import { useStreamableText } from "@/lib/hooks/use-streamable-text"
import { cn } from "@/lib/utils"
import { SupabaseAgent, SupabaseTag } from "@/types/supabase"

export function LangGraphMessage({
    data,
    agent,
    tags,
    className
}: {
    // content: string | StreamableValue<string>
    data: any
    agent?: SupabaseAgent
    tags?: SupabaseTag[]
    className?: string
}) {
    const question = `Question: ${data[0].kwargs.content}`
    const answer = `Answer: ${data[2].kwargs.content}`

    const text = useStreamableText(question + '\n\n' + answer)

    return (
        <div className={cn('group relative flex items-start md:-ml-12', className)}>
            <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
                ➗
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1" className='border-none'>
                        {/* <AccordionTrigger>Is it accessible?</AccordionTrigger> */}
                        <div className="">
                            <div className='flex justify-between'>
                                <div>Langgraph Results:</div>
                                <Tooltip>
                                    <TooltipTrigger><AccordionTrigger className='hover:no-underline py-2'>💡</AccordionTrigger></TooltipTrigger>
                                    <TooltipContent>
                                        <p>Show sources</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        <MarkdownWrapper text={text} />

                        <AccordionContent>
                            {/* @ts-expect-error Type 'Json | undefined' is not an array type. ts(2461) */}
                            {agent && agent?.tags?.length ? <div className='flex text-sm my-2'>
                                <span className='mr-5'>Used Agent: 🤖 {agent.name}</span>
                                {/* @ts-expect-error Type 'Json | undefined' is not an array type. ts(2461) */}
                                <div>{agent.tags.map(({ name, value, color }) => (
                                    <Badge
                                        key={value}
                                        variant="outline"
                                        style={badgeStyle(color)}
                                        className="mr-1 mb-1"
                                    >
                                        {name}
                                    </Badge>
                                ))}</div>
                            </div> : null}

                            {!agent && tags && tags.length ? <div className='flex text-sm my-2'>
                                <span className='mr-5'>Used Tags: </span>
                                <div>{tags.map(({ name, value, color }) => (
                                    <Badge
                                        key={value}
                                        variant="outline"
                                        style={badgeStyle(color)}
                                        className="mr-1 mb-1"
                                    >
                                        {name}
                                    </Badge>
                                ))}</div>
                            </div> : null}

                            <pre>{JSON.stringify(data, null, 2)}</pre>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}