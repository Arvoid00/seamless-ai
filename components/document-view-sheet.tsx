"use client"

import { PageSection } from "@/app/vectorsearch/route"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { set } from "date-fns"
import { get } from "http"
import Image from "next/image"
import { useEffect, useState } from "react"

export function DocumentViewer({ children, source, name, section }: { children?: React.ReactNode, source: string, name: string, section?: PageSection }) {
    const [error, setError] = useState(false)

    useEffect(() => {
        const getDocument = async () => {
            const res = await fetch(source)
            const { error } = await res.json()
            if (error) setError(true)
        }
        getDocument()
    }, [])

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children ? children : <Button variant={"outline"}>View document</Button>}
            </SheetTrigger>
            <SheetContent className="sm:max-w-full lg:max-w-1/2 space-y-4">
                <SheetHeader>
                    <SheetTitle className="w-full text-wrap">{name}</SheetTitle>
                    {/* <SheetDescription>
                        View the document here.
                    </SheetDescription> */}
                </SheetHeader>
                {error ? (
                    <div className="flex flex-col justify-center items-center w-full h-[80%]">
                        <Image src={"/file_not_found.svg"} alt={name} width="100" height="100" className="my-5" />
                        <p className="">Yikes, document not found on server</p>
                    </div>
                ) : (
                    <object data={source} width="100%" height="80%" className="" />
                )}

                {section && <div className="text-xs space-y-2 mb-3">
                    <p className="text-lg">Retrieved document text: </p>
                    <p>{section.content}</p>
                    <p className='text-xs text-gray-500'>Similarity score: {section.similarity}</p>
                </div>}
                {/* <SheetFooter>
                    <SheetClose asChild>
                        <Button>Close</Button>
                    </SheetClose>
                </SheetFooter> */}
            </SheetContent>
        </Sheet>
    )
}
