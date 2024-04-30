"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { labels, priorities, statuses } from "@/components/table/data"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { AgentsRowActions } from "./AgentsRowActions"
import { SupabaseAgent, SupabaseTag } from "@/types/supabase"
import { badgeStyle } from "@/components/ui/badge"

export const columns: ColumnDef<SupabaseAgent>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
            const label = labels.find((label) => label.value === row.original.name)

            return (
                <div className="flex space-x-2">
                    {label && <Badge variant="outline">{label.label}</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("name")}

                    </span>
                </div>
            )
        },
    },
    // {
    //     accessorKey: "prompt",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Prompt" />
    //     ),
    //     cell: ({ row }) => {
    //         const label = labels.find((label) => label.value === row.original.name)

    //         return (
    //             <div className="flex space-x-2">
    //                 {label && <Badge variant="outline">{label.label}</Badge>}
    //                 <span className="max-w-[500px] truncate font-medium">
    //                     {row.getValue("prompt")}
    //                 </span>
    //             </div>
    //         )
    //     },
    // },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => {
            const label = labels.find((label) => label.value === row.original.name)

            return (
                <div className="flex space-x-2">
                    {label && <Badge variant="outline">{label.label}</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("description")}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "tags",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tags" />
        ),
        cell: ({ row }) => {
            const label = labels.find((label) => label.value === row.original.name)

            return (
                <div className="flex space-x-2">
                    {label && <Badge variant="outline">{label.label}</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
                        {(row.getValue("tags") as SupabaseTag[])?.map((tag: any) => (
                            <Badge
                                key={tag.id}
                                variant="outline"
                                style={badgeStyle(tag.color)}
                                className="mr-1 mb-1"
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "model",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Model" />
        ),
        cell: ({ row }) => {
            const label = labels.find((label) => label.value === row.original.name)

            return (
                <div className="flex space-x-2">
                    {label && <Badge variant="outline">{label.label}</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("model")}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "functions",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Functions" />
        ),
        cell: ({ row }) => {
            const label = labels.find((label) => label.value === row.original.name)
            const functions = (row.getValue("functions") ?? []) as string[]

            return (
                <div className="flex space-x-2">
                    {label && <Badge variant="outline">{label.label}</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
                        {functions.map((func: any) => func).join(", ")}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "temperature",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Strictness" />
        ),
        cell: ({ row }) => {
            const label = labels.find((label) => label.value === row.original.name)

            return (
                <div className="flex space-x-2">
                    {label && <Badge variant="outline">{label.label}</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("temperature")}
                    </span>
                </div>
            )
        },
    },
    // {
    //     accessorKey: "created_at",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Uploaded at" />
    //     ),
    //     cell: ({ row }) => {
    //         const label = labels.find((label) => label.value === row.original.label)

    //         return (
    //             <div className="flex space-x-2">
    //                 {label && <Badge variant="outline">{label.label}</Badge>}
    //                 <span className="max-w-[500px] truncate font-medium">
    //                     {formatDate(row.getValue("created_at"))}
    //                 </span>
    //             </div>
    //         )
    //     },
    // },
    {
        id: "actions",
        cell: ({ row }) => <AgentsRowActions row={row} />,
        enableSorting: false,
        enableHiding: false,
    },
]