"use client"

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
import { Badge } from "@/components/ui/badge"
import { SupabaseAgent, SupabaseTag } from '@/types/supabase'
import { badgeStyle } from '../ui/badge'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { cn } from "@/lib/utils"
import { useStreamableText } from "@/lib/hooks/use-streamable-text"

export function MultiAgentMessage({
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
    // const question = `Question: ${data[0].kwargs.content}`
    // const answer = `Answer: ${data[2].kwargs.content}`

    {
        data?.globalChartOptions && ChartJS.register(
            CategoryScale,
            LinearScale,
            BarElement,
            Title,
            ChartTooltip,
            Legend
        )
    }

    const multiAgentIconMap = {
        Researcher: "🔍",
        ChartGenerator: "📊",
        call_tool: "🛠️",
    };

    // const streamedData = useStreamableText(data)
    // const streamedObject = JSON.parse(streamedData)

    return (
        <div className={cn('group relative flex items-start md:-ml-12', className)}>
            <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
                🦜
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1" className='border-none'>
                        {/* <AccordionTrigger>Is it accessible?</AccordionTrigger> */}
                        <div className="">
                            <div className='flex justify-between'>
                                <div>MultiAgent Results:</div>
                                <Tooltip>
                                    <TooltipTrigger><AccordionTrigger className='hover:no-underline py-2'>💡</AccordionTrigger></TooltipTrigger>
                                    <TooltipContent>
                                        <p>Show sources</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        {/* <MarkdownWrapper text={text} /> */}

                        {data?.streamOutputs.filter(step => Object.keys(step)[0] != "call_tool" && Object.keys(step)[0] != "__end__").map((step, index) => {
                            const stepKey = Object.keys(step)[0];
                            const stepData = step[stepKey];

                            // return null if there are no message contents, eg for function calls
                            if (!stepData.messages || !stepData.messages.some(message => message.kwargs.content)) return null;

                            return (
                                <div key={index}>
                                    <h3>{multiAgentIconMap[stepKey as keyof typeof multiAgentIconMap]} {stepKey}</h3>
                                    {stepData.messages.map((message) => (
                                        <div>
                                            {/* <pre key={messageIndex}>{JSON.stringify(message.kwargs, null, 2)}</pre> */}
                                            {/* // <pre key={messageIndex}>{JSON.stringify(message, null, 2)}</pre> */}
                                            {message.kwargs && <div>{message.kwargs.content}</div>}
                                        </div>
                                    ))}
                                    <br />
                                </div>
                            );
                        })}

                        {data?.globalChartOptions && <Bar data={data.globalChartOptions.chartData} options={data.globalChartOptions.options} />}

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

                            <div>total</div>
                            <pre>{JSON.stringify(data, null, 2)}</pre>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}