"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { labels, priorities, statuses } from "@/components/table/data"
import { Document } from "@/components/table/schema"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table//data-table-row-actions"
import { formatDate } from "@/lib/utils"
// import { DocumentsRowActions } from "./TagsRowActions"

export type Tag = {
    id: string
    name: string
    created_at: string
    value: string
    group: string
}

export const columns: ColumnDef<Tag>[] = [
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
            const label = labels.find((label) => label.value === row.original.label)

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
            const label = labels.find((label) => label.value === row.original.label)

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
    // {
    //     id: "viewer",
    //     cell: ({ row }) => <DocumentViewer name={row.original.name!} source={row.original.source!} tags={row.original.metadata?.tags} />,
    // },
    // {
    //     id: "actions",
    //     cell: ({ row }) => <DocumentsRowActions row={row} />,
    // },
]