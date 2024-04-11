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
import { Document, documentSchema } from "@/components/table/schema"
import { deleteDocument, deleteFileObject } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { PageSection } from "../vectorsearch/route"

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export function DocumentsRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const doc = row.original as Document
    const router = useRouter()

    async function handleFileDelete(e: React.MouseEvent) {
        e.preventDefault()
        console.log("Deleting file", doc.metadata?.fileName)
        try {
            if (!doc.metadata?.fileName) throw new Error("No file name found")
            const { error } = await deleteFileObject(doc.metadata?.fileName)
            if (error) throw error
            const { data } = await deleteDocument(doc.id!)
            console.log(data)
            toast.success("File deleted!")
            router.refresh()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            toast.error("Error deleting file", { description: errorMessage })
        }
    }


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <DotsHorizontalIcon className="h-4 w-4" />
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
                </DropdownMenuSub> 
                <DropdownMenuSeparator /> */}
                <DropdownMenuItem onClick={(e) => handleFileDelete(e)} className="cursor-pointer hover:bg-destructive-foreground">
                    Delete
                    {/* <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut> */}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}