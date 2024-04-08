import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Document } from "./table/schema"

export function DocumentViewer({ children, doc }: { children?: React.ReactNode, doc: Document }) {

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant={"outline"}>View document</Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-full lg:max-w-1/2">
                <SheetHeader>
                    <SheetTitle className="w-full text-wrap">{doc.title}</SheetTitle>
                    <SheetDescription>
                        View the document here.
                    </SheetDescription>
                </SheetHeader>
                <object data={doc.source} width="100%" height="85%" className="my-5" />
                <SheetFooter>
                    <SheetClose asChild>
                        <Button>Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
