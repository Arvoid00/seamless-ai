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
import { SupabaseTag } from "@/types/supabase"

type SelectTagsPopoverProps = {
    children?: React.ReactNode
    className?: string
    open: boolean
    setOpen: (value: boolean) => void
    returnFocusRef?: React.RefObject<HTMLElement>
}

export function SelectTagsPopover({ children, className, open, setOpen, returnFocusRef }: SelectTagsPopoverProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { tags, setTags, selectedTags, setSelectedTags } = useTags()

    const toggleTag = (tag: SupabaseTag) => {
        setSelectedTags((currentTags) =>
            !currentTags.includes(tag)
                ? [...currentTags, tag]
                : currentTags.filter((t) => t.value !== tag.value)
        );
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
                        {selectedTags && <div>{selectedTags.map(({ name, value, color }) => (
                            <Badge
                                key={value}
                                variant="outline"
                                style={badgeStyle(color)}
                                className="mr-1 mb-1"
                            >
                                {name}
                            </Badge>
                        ))}</div>}
                    </div>
                    <CommandInput placeholder="Change tags..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {tags.map((tag) => {
                                const isActive = selectedTags.includes(tag);
                                return (
                                    <CommandItem
                                        key={tag.value}
                                        value={tag.value}
                                        onSelect={() => toggleTag(tag)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 size-4",
                                                isActive ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <Badge
                                            variant="outline"
                                            style={badgeStyle(tag.color)}
                                            className="mr-1 mb-1"
                                        >
                                            <div className="flex-1">{tag.name}</div>
                                        </Badge>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
