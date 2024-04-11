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

export function DocumentViewer({ children, source, name, section }: { children?: React.ReactNode, source: string, name: string, section?: PageSection }) {

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children ? children : <Button variant={"outline"}>View document</Button>}
            </SheetTrigger>
            <SheetContent className="sm:max-w-full lg:max-w-1/2">
                <SheetHeader>
                    <SheetTitle className="w-full text-wrap">{name}</SheetTitle>
                    {/* <SheetDescription>
                        View the document here.
                    </SheetDescription> */}
                </SheetHeader>
                <object data={source} width="100%" height="80%" className="my-5" />
                {section && <div className="text-xs space-y-2 mb-3">
                    <p>This text was retrieved from the document: </p>
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
