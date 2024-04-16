"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import { labels, priorities, statuses } from "@/components/table/data"
import { Document } from "@/components/table/schema"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { DataTableRowActions } from "@/components/table//data-table-row-actions"
import { formatDate } from "@/lib/utils"
import { DocumentsRowActions } from "./DocumentsRowActions"
import { DocumentViewer } from "@/components/document-view-sheet"

export const columns: ColumnDef<Document>[] = [
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
    // {
    //     accessorKey: "id",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Document" />
    //     ),
    //     cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    //     enableSorting: false,
    //     enableHiding: false,
    // },
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
    // {
    //     accessorKey: "metadata.size",
    //     accessorFn: (row) => row.metadata?.size,
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Size" />
    //     ),
    //     cell: ({ row }) => {
    //         const label = labels.find((label) => label.value === row.original.label)

    //         return (
    //             <div className="flex space-x-2">
    //                 {label && <Badge variant="outline">{label.label}</Badge>}
    //                 <span className="max-w-[500px] truncate font-medium">
    //                     {row.getValue(row.original.metadata?.size?.toString() ?? "0")}
    //                 </span>
    //             </div>
    //         )
    //     },
    // },
    // {
    //     accessorKey: "mimetype",
    //     accessorFn: (row) => row.metadata?.mimetype,
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Filetype" />
    //     ),
    //     cell: ({ row }) => {
    //         const label = labels.find((label) => label.value === row.original.label)

    //         return (
    //             <div className="flex space-x-2">
    //                 {label && <Badge variant="outline">{label.label}</Badge>}
    //                 <span className="max-w-[500px] truncate font-medium">
    //                     {row.getValue(row.metadata?.mimetype)}
    //                 </span>
    //             </div>
    //         )
    //     },
    // },
    // {
    //     accessorKey: "status",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Status" />
    //     ),
    //     cell: ({ row }) => {
    //         const status = statuses.find(
    //             (status) => status.value === row.getValue("status")
    //         )

    //         if (!status) {
    //             return null
    //         }

    //         return (
    //             <div className="flex w-[100px] items-center">
    //                 {status.icon && (
    //                     <status.icon className="mr-2 size-4 text-muted-foreground" />
    //                 )}
    //                 <span>{status.label}</span>
    //             </div>
    //         )
    //     },
    //     filterFn: (row, id, value) => {
    //         return value.includes(row.getValue(id))
    //     },
    // },
    // {
    //     accessorKey: "priority",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Priority" />
    //     ),
    //     cell: ({ row }) => {
    //         const priority = priorities.find(
    //             (priority) => priority.value === row.getValue("priority")
    //         )

    //         if (!priority) {
    //             return null
    //         }

    //         return (
    //             <div className="flex items-center">
    //                 {priority.icon && (
    //                     <priority.icon className="mr-2 size-4 text-muted-foreground" />
    //                 )}
    //                 <span>{priority.label}</span>
    //             </div>
    //         )
    //     },
    //     filterFn: (row, id, value) => {
    //         return value.includes(row.getValue(id))
    //     },
    // },

    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Uploaded at" />
        ),
        cell: ({ row }) => {
            const label = labels.find((label) => label.value === row.original.label)

            return (
                <div className="flex space-x-2">
                    {label && <Badge variant="outline">{label.label}</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
                        {formatDate(row.getValue("created_at"))}
                    </span>
                </div>
            )
        },
    },
    {
        id: "viewer",
        cell: ({ row }) => <DocumentViewer name={row.original.name!} source={row.original.source!} />,

    },
    {
        id: "actions",
        cell: ({ row }) => <DocumentsRowActions row={row} />,
    },
]