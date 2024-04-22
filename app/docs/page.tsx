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
        <div className="flex flex-col min-h-[calc(h-screen-56px)]">
            <header className="flex items-center justify-between h-14 gap-4 border-b lg:h-[60px] bg-gray-100/40 px-6 dark:bg-gray-800/40">
                <h1 className="text-lg font-semibold">Document Management</h1>
                <DragAndDrop />
            </header>
            <main className="flex-1 p-4 md:p-6">
                {error ? <div>Error loading documents. <pre>{JSON.stringify(error, null, 2)}</pre></div> : <DataTable data={documents ?? []} columns={columns} tablePluralName='documents' />}
            </main>
        </div>
    )
}