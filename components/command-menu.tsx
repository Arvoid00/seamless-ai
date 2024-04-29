"use client"

import {
    CalendarIcon,
    EnvelopeClosedIcon,
    FaceIcon,
    BookmarkIcon,
    FileIcon,
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
import { ChevronRight, MoonIcon, SunIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useCommandState } from 'cmdk'
import { useTheme } from 'next-themes'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { SelectAgentPopover } from './select-agent-popover'
import { redirect } from 'next/navigation'

const TRIGGER_KEY = 'k'

function PopoverCommandItemContent({ title, icon }: { title: string, icon: React.ReactNode }) {
    return (
        <div className='flex'>
            <div className='flex'>
                {icon} {title}
            </div>
            {/* <ChevronRight className="size-5 ml-auto" /> */}
        </div>
    )
}

export function CommandMenu() {
    const [open, setOpen] = useState(false)
    const [openCategoriesPopover, setOpenCategoriesPopover] = useState(false)
    const [openAgentPopover, setOpenAgentPopover] = useState(false)
    const commandInputRef = useRef(null);
    const [pages, setPages] = useState<string[]>([])
    const page = pages[pages.length - 1]
    const { setTheme, theme } = useTheme()

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

    const SubItem = (props: any) => {
        const search = useCommandState((state) => state.search)
        if (!search) return null
        return <CommandItem {...props} />
    }

    return (
        <><Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-haspopup="dialog"
                    aria-label="Open command menu"
                    aria-controls="command-menu"
                    role="combobox"
                    aria-expanded={open}
                    className="h-8 w-12 bg-background p-0 sm:left-4"
                    onClick={() => setOpen(open => !open)}
                >
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span><span className='capitalize'>{TRIGGER_KEY}</span>
                    </kbd>
                </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
        </Tooltip>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." ref={commandInputRef} />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <SelectTagsPopover open={openCategoriesPopover} setOpen={setOpenCategoriesPopover} returnFocusRef={commandInputRef}>
                            <CommandItem onSelect={() => setOpenCategoriesPopover(true)}>
                                <PopoverCommandItemContent title='Select tags' icon={<TargetIcon className="size-5 mr-2" />} />
                            </CommandItem>
                        </SelectTagsPopover>
                        <SelectAgentPopover open={openAgentPopover} setOpen={setOpenAgentPopover} returnFocusRef={commandInputRef}>
                            <CommandItem onSelect={() => setOpenAgentPopover(true)}>
                                <RocketIcon className="size-5 mr-2" />
                                Select Agent
                            </CommandItem>
                        </SelectAgentPopover>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Manage">
                        <CommandItem onSelect={() => redirect('docs')}>
                            <FileIcon className="size-5 mr-2" />
                            Documents
                        </CommandItem>
                        <CommandItem onSelect={() => redirect('tags')}>
                            <BookmarkIcon className="size-5 mr-2" />
                            Tags
                        </CommandItem>
                        <CommandItem onSelect={() => redirect('agents')}>
                            <RocketIcon className="size-5 mr-2" />
                            Agents
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="User">
                        <CommandItem onSelect={() => toast.message("Redirecting to Settings")}>
                            <GearIcon className="size-5 mr-2" />
                            Settings
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Theme & Styling">
                        <CommandItem onSelect={() => setTheme("dark")}><MoonIcon className="size-5 mr-2" />Change theme to dark</CommandItem>
                        <CommandItem onSelect={() => setTheme("light")}><SunIcon className="size-5 mr-2" />Change theme to light</CommandItem>
                        {/* <SubItem onSelect={() => { toast.message("Change theme to dark") }}>Change theme to dark</SubItem>
                        <SubItem onSelect={() => { toast.message("Change theme to light") }}>Change theme to light</SubItem> */}
                    </CommandGroup>
                    {/* <CommandSeparator />
                    <CommandGroup heading="Projects & Teams">
                        {!page && (
                            <>
                                <CommandItem onSelect={() => setPages([...pages, 'projects'])}>Search projects…</CommandItem>
                                <CommandItem onSelect={() => setPages([...pages, 'teams'])}>Join a team…</CommandItem>
                            </>
                        )}

                        {page === 'projects' && (
                            <>
                                <CommandItem onSelect={() => { toast.message("Project A"); setPages([...pages.filter(page => page != 'projects')]) }}>Project A</CommandItem>
                                <CommandItem onSelect={() => { toast.message("Project B"); setPages([...pages.filter(page => page != 'projects')]) }}>Project B</CommandItem>
                            </>
                        )}

                        {page === 'teams' && (
                            <>
                                <CommandItem onSelect={() => { toast.message("Team 1"); setPages([...pages.filter(page => page != 'teams')]) }}>Team 1</CommandItem>
                                <CommandItem onSelect={() => { toast.message("Team 2"); setPages([...pages.filter(page => page != 'teams')]) }}>Team 2</CommandItem>
                            </>
                        )}
                    </CommandGroup> */}
                </CommandList>
            </CommandDialog >
        </>
    )
}
