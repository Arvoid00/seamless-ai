import DragAndDrop from '@/components/drag-drop'
import { getDocuments } from './actions'
import { columns } from './columns'
import { DataTable } from '@/components/table/data-table'

export default async function DocsPage() {

    const { data: documents, error } = await getDocuments()

    if (error) {
        console.error(error)
        return <div>Error loading documents. <pre>{JSON.stringify(error, null, 2)}</pre></div>
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex items-center h-14 gap-4 border-b lg:h-[60px] bg-gray-100/40 px-6 dark:bg-gray-800/40">
                <h1 className="text-lg font-semibold">Document Management</h1>
                <div className="ml-auto flex gap-4 md:gap-8 lg:gap-12">
                    {/* Add buttons here */}
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <DragAndDrop />
                {error ? <div>Error loading documents. <pre>{JSON.stringify(error, null, 2)}</pre></div> : <DataTable data={documents ?? []} columns={columns} />}
            </main>
        </div>
    )
}