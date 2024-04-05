import DragAndDrop from '@/components/drag-drop'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import React from 'react'

function DocCard({ doc }: { doc: any }) {
    return (
        <Card className="w-full max-w-sm">
            <CardContent className="flex items-center gap-4">
                {/* <FileIcon className="h-8 w-8" /> */}
                <div className="grid gap-1">
                    <CardTitle className="text-base font-semibold pt-4">{doc.title}</CardTitle>
                    <CardDescription className="text-sm font-normal">{doc.description}</CardDescription>
                </div>
                <div className="ml-auto text-sm font-medium shrink-0">{doc.size}</div>
            </CardContent>
        </Card>
    )
}

const docs = [
    {
        title: "Project Brief",
        description: ".docx",
        size: "1.2MB"
    },
    {
        title: "Wireframes",
        description: ".zip",
        size: "5.4MB"
    },
    {
        title: "Budget Sheet",
        description: ".xlsx",
        size: "2.1MB"
    },
    {
        title: "Presentation Slides",
        description: ".pptx",
        size: "3.8MB"
    },
    {
        title: "Documentation",
        description: ".pdf",
        size: "7.2MB"
    }

]

export default function DocsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex items-center h-14 gap-4 border-b lg:h-[60px] bg-gray-100/40 px-6 dark:bg-gray-800/40">
                <Button className="lg:hidden">
                    {/* <MenuIcon className="h-6 w-6" /> */}
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
                <h1 className="text-lg font-semibold">Document Management</h1>
                {/* <Button size="sm">Upload</Button>
                <Button size="sm" variant="outline">
                    Share
                    <span className="sr-only">Share</span>
                </Button> */}
                <div className="ml-auto flex gap-4 md:gap-8 lg:gap-12">
                    {/* <Button className="rounded-full" size="icon">
                        <SearchIcon className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                    </Button>
                    <Button className="rounded-full" size="icon">
                        <ChevronDownIcon className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                    </Button> */}
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <DragAndDrop />
                <div className='space-y-4'>
                    <h2 className='text-lg'>Categorie A</h2>
                    <div className="grid grid-cols-3 items-start gap-2 md:gap-4 lg:gap-6">
                        {docs.map((doc, idx) => (
                            <DocCard key={idx} doc={doc} />
                        ))}
                    </div>
                    <h2 className='text-lg'>Categorie B</h2>
                    <div className="grid grid-cols-3 items-start gap-2 md:gap-4 lg:gap-6">
                        {docs.map((doc, idx) => (
                            <DocCard key={idx} doc={doc} />
                        ))}
                    </div>
                    <h2 className='text-lg'>Categorie C</h2>
                    <div className="grid grid-cols-3 items-start gap-2 md:gap-4 lg:gap-6">
                        {docs.map((doc, idx) => (
                            <DocCard key={idx} doc={doc} />
                        ))}
                    </div>
                </div>

            </main>
        </div>
    )
}