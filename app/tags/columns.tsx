"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { labels, priorities, statuses } from "@/components/table/data"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { TagsRowActions } from "./TagsRowActions"
import { SupabaseTag } from "@/lib/supabase"

export const columns: ColumnDef<SupabaseTag>[] = [
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
        accessorKey: "color",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Color" />
        ),
        cell: ({ row }) => {
            const label = labels.find((label) => label.value === row.original.value)

            return (
                <div className="flex space-x-2">
                    {label && <Badge variant="outline">{label.label}</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
                        <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: row.getValue("color") }}
                        />
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
            const label = labels.find((label) => label.value === row.original.value)

            return (
                <div className="flex space-x-2">
                    {label && <Badge variant="outline">{label.label}</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("name")}

                    </span>
                    {/* <div>{JSON.stringify(row.original)}</div> */}
                </div>
            )
        },
    },
    {
        accessorKey: "group",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Group" />
        ),
        cell: ({ row }) => {
            const label = labels.find((label) => label.value === row.original.value)

            return (
                <div className="flex space-x-2">
                    {label && <Badge variant="outline">{label.label}</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("group")}

                    </span>
                    {/* <div>{JSON.stringify(row.original)}</div> */}
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
        cell: ({ row }) => <TagsRowActions row={row} />,
        enableSorting: false,
        enableHiding: false,
    },
]