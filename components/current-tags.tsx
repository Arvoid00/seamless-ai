"use client"

import { Badge, badgeStyle } from './ui/badge'
import { SelectTagsPopover } from './select-tags-popover'
import { useState } from 'react'
import { Button } from './ui/button'
import { useTags } from '@/lib/hooks/use-tags'
import { BookmarkIcon } from '@radix-ui/react-icons'
import { SelectAgentPopover } from './select-agent-popover'

function CurrentTags() {
    const [openTags, setOpenTags] = useState(false)
    const [openAgent, setOpenAgent] = useState(false)
    const { selectedTags } = useTags()

    return (
        <div className="my-5 px-6 py-2 bg-background rounded-xl border w-full">
            <div className="flex items-center space-x-5 justify-between">
                <div className='flex text-sm my-2'>
                    <div className='flex items-center mr-2 min-w-content'><BookmarkIcon className='size-5' /></div>
                    <div>
                        {selectedTags.length ? selectedTags.map(({ name, value, color }) => (
                            <Badge
                                key={value}
                                variant="outline"
                                style={badgeStyle(color)}
                                className="mr-1 mb-1"
                            >
                                {name}
                            </Badge>
                        )) : <span className='text-zinc-500'>Select tags to use document search</span>}
                    </div>
                </div>
                <div className='space-x-2'>
                    <SelectTagsPopover open={openTags} setOpen={setOpenTags}>
                        <Button variant={"secondary"}>🏷️</Button>
                    </SelectTagsPopover>
                    <SelectAgentPopover open={openAgent} setOpen={setOpenAgent}>
                        <Button variant={"secondary"}>🤖</Button>
                    </SelectAgentPopover>
                </div>
            </div>
        </div>

    )
}

export default CurrentTags