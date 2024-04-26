"use client"

import { SupabaseAgent } from '@/types/supabase'
import { Badge, badgeStyle } from './ui/badge'
import { SelectTagsPopover } from './select-tags-popover'
import { useState } from 'react'
import { Button } from './ui/button'
import { useTags } from '@/lib/hooks/use-tags'
import { SelectAgentPopover } from './select-agent-popover'


function CurrentAgent({ agent }: { agent: SupabaseAgent }) {
    const [open, setOpen] = useState(false)
    const { selectedTags } = useTags()

    return (

        <div className="my-5 px-6 py-2 bg-background rounded-xl border  w-full">
            <div className="flex items-center space-x-5 justify-between">
                <span className="">🤖 {agent.name}</span>
                <div>
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
                    <Button variant={"secondary"}>⚙️</Button>
                </SelectAgentPopover>
            </div>
            {selectedTags.length ? <div className='flex text-sm my-2'>
                <span className='mr-2'>Custom tags:</span>
                <div>{selectedTags.map(({ name, value, color }) => (
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
        </div>

    )
}

export default CurrentAgent