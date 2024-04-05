import DragAndDrop from '@/components/drag-drop'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import React from 'react'
import { getDocumentsInFolder } from './actions'

const sufixes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const getBytes = (bytes: any) => {
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return !bytes && '0 Bytes' || (bytes / Math.pow(1024, i)).toFixed(2) + " " + sufixes[i];
};

function DocCard({ doc }: { doc: any }) {
    return (
        <Card className="w-full max-w-sm">
            <CardContent className="flex items-center gap-4">
                {/* <FileIcon className="h-8 w-8" /> */}
                <div className="grid gap-1">
                    <CardTitle className="text-base font-semibold pt-4">{doc.name}</CardTitle>
                    <CardDescription className="text-sm font-normal">uploaded at {doc.created_at}</CardDescription>
                </div>
                <div className="ml-auto text-sm font-medium shrink-0">{getBytes(doc.metadata.size)}</div>
            </CardContent>
        </Card>
    )
}

export default async function DocsPage() {

    const { documents, error } = await getDocumentsInFolder('documents')

    if (error) {
        console.error(error)
        return <div>Error loading documents. <pre>{JSON.stringify(error, null, 2)}</pre></div>
    }

    if (!documents) {
        return <div>Error loading documents</div>
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
                <div className='space-y-4'>
                    <h2 className='text-lg'>Category A</h2>
                    <div className="grid grid-cols-3 items-start gap-2 md:gap-4 lg:gap-6">
                        {documents.map((doc, idx) => (
                            <DocCard key={idx} doc={doc} />
                        ))}
                    </div>
                    <h2 className='text-lg'>Category B</h2>
                    <div className="grid grid-cols-3 items-start gap-2 md:gap-4 lg:gap-6">
                        {documents.map((doc, idx) => (
                            <DocCard key={idx} doc={doc} />
                        ))}
                    </div>
                    <h2 className='text-lg'>Category C</h2>
                    <div className="grid grid-cols-3 items-start gap-2 md:gap-4 lg:gap-6">
                        {documents.map((doc, idx) => (
                            <DocCard key={idx} doc={doc} />
                        ))}
                    </div>
                </div>

            </main>
        </div>
    )
}