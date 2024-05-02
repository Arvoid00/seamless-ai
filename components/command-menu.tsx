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
    TargetIcon,
    PlusCircledIcon
} from '@radix-ui/react-icons'

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandLoading,
    CommandSeparator,
    CommandShortcut
} from '@/components/ui/command'
import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { SelectTagsPopover } from './select-tags-popover'
import { Check, ChevronRight, MoonIcon, SunIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useCommandState } from 'cmdk'
import { useTheme } from 'next-themes'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { SelectAgentPopover } from './select-agent-popover'
import { useRouter } from 'next/navigation'
import { Badge, badgeStyle } from './ui/badge'
import { useTags } from '@/lib/hooks/use-tags'
import { SupabaseAgent, SupabaseTag } from '@/types/supabase'
import { useAgent } from '@/lib/hooks/use-current-agent'
import { getAgents } from '@/app/agents/actions'

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
    const [pages, setPages] = useState<string[]>(['Home'])
    const page = pages[pages.length - 1]
    const { setTheme } = useTheme()
    const router = useRouter()
    const { tags, selectedTags, setSelectedTags } = useTags()
    const { agent: usedAgent, setAgent } = useAgent()
    const [agents, setAgents] = useState<SupabaseAgent[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function getAgentsData() {
            setLoading(true)
            const { data: retrievedAgents, error } = await getAgents()
            if (error || !retrievedAgents) {
                toast.error("Error fetching agents.")
                return
            }
            setAgents(retrievedAgents as SupabaseAgent[])
            setLoading(false)
        }

        getAgentsData()
    }, [])

    const toggleTag = (tag: SupabaseTag) => {
        setSelectedTags((currentTags) =>
            !currentTags.includes(tag)
                ? [...currentTags, tag]
                : currentTags.filter((t) => t.value !== tag.value)
        );
        toast.message(<>
            <div className='flex items-centerneru'></div>
            <div>Tag</div>
            <Badge
                key={tag.value}
                variant="outline"
                style={badgeStyle(tag.color)}
                className="mx-1 mb-1"
            >
                {tag.name}
            </Badge>
            <div>{selectedTags.includes(tag) ? 'removed' : 'added'}!</div>
        </>
        )
    };

    const toggleAgent = (agent: SupabaseAgent) => {

        const isActive = agent.id === usedAgent?.id
        isActive ? setAgent(null) : setAgent(agent)
        setSelectedTags([])
        router.push('/' + isActive ? "" : agent.name)

        toast.message(<>
            <div className='flex items-center'></div>
            <div className=" text-md">
                🤖 {agent.name}
            </div>
            <div>{isActive ? 'unselected' : 'selected'}!</div>
        </>
        )
    }

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === TRIGGER_KEY && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen(open => !open)
            }

            // check if dialog is open and if the search is empty
            if (open && (e.key === 'Escape' || (e.key === 'Backspace' && !search))) {
                e.preventDefault()
                if (pages.length > 1) setPages((pages) => pages.slice(0, -1))
                else setOpen(false)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [search, pages])

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
            <CommandDialog open={open} onOpenChange={setOpen} loop>
                <div className='flex p-2 pb-0'>
                    {pages.map((page, i) => (<div key={i}>{i != 0 ? <span className='mx-1'>/</span> : null}<Badge key={i} variant={"outline"} className='capitalize'>{page}</Badge></div>))}
                </div>
                <CommandInput placeholder="Type a command or search..." ref={commandInputRef} value={search} onValueChange={setSearch} />
                <CommandList>
                    {loading && <CommandLoading>Fetching data...</CommandLoading>}
                    <CommandEmpty>
                        {usedAgent && tags.some(tag => tag.name.toLowerCase().includes(search.toLowerCase()))
                            ? "Unselect your agent to add custom tags"
                            : "No results found."}
                    </CommandEmpty>
                    {pages.length == 1 && (<><CommandGroup heading="Suggestions">
                        <SelectTagsPopover open={openCategoriesPopover} setOpen={setOpenCategoriesPopover} returnFocusRef={commandInputRef}>
                            <CommandItem onSelect={() => setOpenCategoriesPopover(true)} disabled={!!usedAgent}>
                                <PopoverCommandItemContent title={!usedAgent ? 'Select tags' : 'You cannot select tags when an agent is active'} icon={<TargetIcon className="size-5 mr-2" />} />
                            </CommandItem>
                        </SelectTagsPopover>
                        <SelectAgentPopover open={openAgentPopover} setOpen={setOpenAgentPopover} commandOpen={open} setCommandOpen={setOpen} returnFocusRef={commandInputRef}>
                            <CommandItem onSelect={() => setOpenAgentPopover(true)}>
                                <RocketIcon className="size-5 mr-2" />
                                Select Agent
                            </CommandItem>
                        </SelectAgentPopover>
                        <CommandItem onSelect={() => { router.push('/'); setOpen(false) }}>
                            <PlusCircledIcon className="size-5 mr-2" />
                            New Chat
                        </CommandItem>
                    </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Manage">
                            <CommandItem onSelect={() => { router.push('docs'); setOpen(false) }}>
                                <FileIcon className="size-5 mr-2" />
                                Manage Documents
                            </CommandItem>
                            <CommandItem onSelect={() => { router.push('tags'); setOpen(false) }}>
                                <BookmarkIcon className="size-5 mr-2" />
                                Manage Tags
                            </CommandItem>
                            <CommandItem onSelect={() => { router.push('agents'); setOpen(false) }}>
                                <RocketIcon className="size-5 mr-2" />
                                Manage Agents
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="User">
                            <CommandItem onSelect={() => toast.message("Redirecting to Settings")}>
                                <GearIcon className="size-5 mr-2" />
                                Go to Settings
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Theme & Styling">
                            <CommandItem onSelect={() => setTheme("dark")}><MoonIcon className="size-5 mr-2" />Change theme to dark</CommandItem>
                            <CommandItem onSelect={() => setTheme("light")}><SunIcon className="size-5 mr-2" />Change theme to light</CommandItem>
                        </CommandGroup>
                        <CommandSeparator /></>
                    )}

                    <CommandGroup heading="With subItems">
                        {pages.length == 1 && (
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
                    </CommandGroup>

                    <CommandGroup>
                        {agents.map((agent) => {
                            const isActive = agent.id === usedAgent?.id
                            return (
                                <SubItem
                                    key={agent.id}
                                    value={agent.name.toLowerCase()}
                                    onSelect={() => toggleAgent(agent)}
                                    className="flex items-center space-x-2"
                                >
                                    <div className='mr-2 items-center'>{isActive ? "Unselect" : "Select"} agent</div>
                                    <div className=" text-md">
                                        🤖 {agent.name}
                                    </div>
                                </SubItem>
                            );
                        })}
                    </CommandGroup>

                    <CommandGroup>
                        {!usedAgent ? tags.map((tag) => {
                            const isActive = selectedTags.includes(tag);
                            return (
                                <SubItem
                                    key={tag.value}
                                    value={tag.value}
                                    onSelect={() => toggleTag(tag)}
                                    className="flex items-center space-x-2"
                                >
                                    <div className='mr-2 items-center'>{isActive ? "Remove" : "Add"} tag</div>
                                    <Badge
                                        key={tag.value}
                                        variant="outline"
                                        style={badgeStyle(tag.color)}
                                        className="mr-1 mb-1"
                                    >
                                        {tag.name}
                                    </Badge>
                                </SubItem>
                            );
                        }) : null}
                    </CommandGroup>

                </CommandList>
            </CommandDialog >
        </>
    )
}
