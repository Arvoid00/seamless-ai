import { DataTable } from '@/components/table/data-table'
import React from 'react'
import { getTags } from './actions'
import { columns } from './columns'
import TagDialog from '@/components/tag-dialog'

async function TagsPage() {
    const { data: tags, error } = await getTags()

    if (error) {
        console.error(error)
        return <div>Error loading tags. <pre>{JSON.stringify(error, null, 2)}</pre></div>
    }

    return (
        <div className="flex flex-col min-h-[calc(h-screen-56px)]">
            <header className="flex items-center justify-between h-14 gap-4 border-b lg:h-[60px] bg-gray-100/40 px-6 dark:bg-gray-800/40">
                <h1 className="text-lg font-semibold">Tag Management</h1>
                {/* <DragAndDrop /> */}
                <TagDialog title={"Create Tag"} action={"add"} />
            </header>
            <main className="flex-1 p-4 md:p-6">
                {error ? <div>Error loading tags. <pre>{JSON.stringify(error, null, 2)}</pre></div> : <DataTable data={tags ?? []} columns={columns} tablePluralName='tags' />}
            </main>
        </div>
    )
}

export default TagsPage