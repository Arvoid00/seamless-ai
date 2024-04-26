"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"
import { Check } from "lucide-react"
import { useTags } from "@/lib/hooks/use-tags"
import { badgeStyle } from "./ui/badge"
import { SupabaseAgent, SupabaseTag } from "@/types/supabase"
import { useAgent } from "@/lib/hooks/use-current-agent"
import { getAgents } from "@/app/agents/actions"

type SelectTagsPopoverProps = {
    children?: React.ReactNode
    className?: string
    open: boolean
    setOpen: (value: boolean) => void
    returnFocusRef?: React.RefObject<HTMLElement>
}

export function SelectAgentPopover({ children, className, open, setOpen, returnFocusRef }: SelectTagsPopoverProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [agents, setAgents] = React.useState<SupabaseAgent[]>([])
    const { agent: usedAgent, setAgent } = useAgent()

    React.useEffect(() => {
        const fetchAgents = async () => {
            const { data, error } = await getAgents()
            if (error) throw error
            const agents = data as SupabaseAgent[]
            setAgents(agents)
        }
        fetchAgents()
    }, [])

    const switchAgent = (agent: SupabaseAgent) => {
        setAgent(agent)
        // setSelectedTags((currentTags) =>
        //     !currentTags.includes(tag)
        //         ? [...currentTags, tag]
        //         : currentTags.filter((t) => t.value !== tag.value)
        // );
        inputRef?.current?.focus();
    };

    return (
        <Popover open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen)
            if (!newOpen) {
                returnFocusRef?.current?.focus()
            }
        }}>
            <PopoverTrigger asChild>
                {children ? children : <Button>⚙️</Button>}
            </PopoverTrigger>
            <PopoverContent className="p-0" side="right" align="start">
                <Command>
                    <div className="p-2 pb-0">
                        🤖 {usedAgent?.name}

                    </div>
                    <CommandInput placeholder="Change categories..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {agents.map((agent) => {
                                const isActive = agent.id === usedAgent?.id
                                return (
                                    <CommandItem
                                        key={agent.id}
                                        value={agent.name}
                                        onSelect={() => switchAgent(agent)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isActive ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex-1">{agent.name}</div>
                                        {/* <div
                                            className="h-4 w-4 rounded-full"
                                            style={{ backgroundColor: tag.color }}
                                        /> */}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover >
    )
}
