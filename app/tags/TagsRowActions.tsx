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

import { labels } from "@/components/table/data"
import { SupabaseTag } from "@/lib/supabase"
import { deleteTag } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import TagDialog from "@/components/tag-dialog"
import { useTags } from "@/lib/hooks/use-tags"

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export function TagsRowActions<TData extends SupabaseTag>({
    row,
}: DataTableRowActionsProps<TData>) {
    const tag = row.original
    const router = useRouter()
    const { setTags } = useTags()

    async function handleTagDelete(e: React.MouseEvent) {
        e.preventDefault()
        console.log("Deleting tag", tag.name)
        try {
            const { error } = await deleteTag(tag.id)
            if (error) throw error
            toast.success("Tag deleted!")
            setTags((tags) => tags.filter((t) => t.id !== tag.id))
            router.refresh()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            toast.error("Error deleting tag", { description: errorMessage })
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
                    <TagDialog tag={row.original} title={"Edit Tag"} action={"edit"} />
                    {/* <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut> */}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleTagDelete}>
                    Delete
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}