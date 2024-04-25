"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { SupabaseAgent } from "@/types/supabase"
import { deleteAgent } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import AgentDialog from "@/components/agent-dialog"

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export function AgentsRowActions<TData extends SupabaseAgent>({
    row,
}: DataTableRowActionsProps<TData>) {
    const agent = row.original
    const router = useRouter()

    async function handleAgentDelete(e: React.MouseEvent) {
        e.preventDefault()
        console.log("Deleting agent", agent.name)
        try {
            const { error } = await deleteAgent(agent.id)
            if (error) throw error
            toast.success("Agent deleted!")
            router.refresh()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            toast.error("Error deleting agent", { description: errorMessage })
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex size-8 p-0 data-[state=open]:bg-muted"
                >
                    <DotsHorizontalIcon className="size-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                {/* <DropdownMenuItem>Favorite</DropdownMenuItem> */}
                {/* <DropdownMenuSeparator /> */}
                {/* <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={doc.label}>
                            {labels.map((label) => (
                                <DropdownMenuRadioItem key={label.value} value={label.value}>
                                    {label.label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub> */}

                <DropdownMenuItem asChild>
                    <AgentDialog agent={row.original} title={"Edit Agent"} action={"edit"} />
                    {/* <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut> */}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAgentDelete}>
                    Delete
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}