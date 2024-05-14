"use client"

import { Badge, badgeStyle } from './ui/badge'
import { useState } from 'react'
import { Button } from './ui/button'
import { SelectAgentPopover } from './select-agent-popover'
import { useAgent } from '@/lib/hooks/use-current-agent'

function CurrentAgent() {
    const [open, setOpen] = useState(false)
    const { agent } = useAgent()

    if (!agent) return null

    return (
        <div className="my-5 px-6 py-2 bg-background rounded-xl border  w-full">
            <div className="flex items-center space-x-5 justify-between">
                <span className="">🤖 {agent.name}</span>
                <div>
                    {/* @ts-expect-error Type 'Json' is not an array type.ts(2461) */}
                    {[...agent?.tags].map(tag => (
                        < Badge
                            key={tag.value}
                            variant="outline"
                            style={badgeStyle(tag.color)}
                            className="mr-1 capitalize"
                        >
                            {tag.name}
                        </Badge>
                    ))}
                </div>
                <SelectAgentPopover open={open} setOpen={setOpen}>
                    <Button variant={"secondary"}>🤖</Button>
                </SelectAgentPopover>
            </div>
        </div>
    )
}

export default CurrentAgent