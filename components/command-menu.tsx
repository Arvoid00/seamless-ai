import {
    CalendarIcon,
    EnvelopeClosedIcon,
    FaceIcon,
    GearIcon,
    PersonIcon,
    RocketIcon,
    TargetIcon
} from '@radix-ui/react-icons'

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut
} from '@/components/ui/command'
import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { SelectTagsPopover } from './select-tags-popover'
import { ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

const TRIGGER_KEY = 'k'

function PopoverCommandItemContent({ title, icon }: { title: string, icon: React.ReactNode }) {
    return (
        <div className='flex'>
            <div className='flex'>
                {icon}
                <div>{title}</div>
            </div>
            <ChevronRight className="size-5 ml-auto" />
        </div>
    )
}

export function CommandMenu() {
    const [open, setOpen] = useState(false)
    const [openCategoriesPopover, setOpenCategoriesPopover] = useState(false)
    const commandInputRef = useRef(null);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === TRIGGER_KEY && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen(open => !open)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                aria-haspopup="dialog"
                aria-label="Open command menu"
                aria-controls="command-menu"
                role="combobox"
                aria-expanded={open}
                className="absolute left-0 top-[14px] h-8 w-12 bg-background p-0 sm:left-4"
                onClick={() => setOpen(open => !open)}
            >
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span><span className='capitalize'>{TRIGGER_KEY}</span>
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." ref={commandInputRef} />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <SelectTagsPopover open={openCategoriesPopover} setOpen={setOpenCategoriesPopover} returnFocusRef={commandInputRef}>
                            <CommandItem onSelect={() => setOpenCategoriesPopover(true)}>
                                <PopoverCommandItemContent title='Select categories' icon={<TargetIcon className="size-5 mr-2" />} />
                            </CommandItem>
                        </SelectTagsPopover>
                        <CommandItem onSelect={() => toast.message("Redirecting to Agents")}>
                            <RocketIcon className="size-5 mr-2" />
                            <span>Go to Agent</span>
                        </CommandItem>
                        <CommandItem onSelect={() => toast.message("Redirecting to Profile")}>
                            <PersonIcon className="size-5 mr-2" />
                            <span>Profile</span>
                        </CommandItem>
                        <CommandItem onSelect={() => toast.message("Redirecting to Settings")}>
                            <GearIcon className="size-5 mr-2" />
                            <span>Settings</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog >
        </>
    )
}
