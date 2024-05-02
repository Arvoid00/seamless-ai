"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "./ui/button";
import { Cross1Icon, Cross2Icon, CrossCircledIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { spinner } from "./stocks";
import { toast } from "sonner";
import TagSelector from "./tag-selector";
import { getBytes, retryOperation, sleep } from "@/lib/utils";
import { SupabaseTag } from "@/types/supabase";
import { extractTextFromPDF, splitText, insertDocument, insertDocumentSections } from "@/app/api/embed/route";
import { Progress } from "./ui/progress";

export type SelectedTagsProps = {
    [key: string]: SupabaseTag[]
}

export default function DragAndDrop() {
    const [dragActive, setDragActive] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const inputRef = useRef<any>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [progress, setProgress] = useState<Map<string, number>>(new Map());
    const [selectedTags, setSelectedTags] = useState<SelectedTagsProps>({});
    const router = useRouter();
    const {
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm()

    function handleChange(e: any) {
        e.preventDefault();
        let newFiles: FileList | null = null;

        if ("dataTransfer" in e) {
            newFiles = e.dataTransfer.files;
        } else {
            newFiles = e.target.files;
        }

        if (newFiles === null) return

        for (let i = 0; i < newFiles.length; i++) {
            // @ts-ignore
            if (newFiles[i] != null) setFiles((prevState) => [...prevState, newFiles[i]]);
            if (newFiles[i] != null) setSelectedTags({ ...selectedTags, [newFiles[i].name]: [] });
        }
    }

    const updateProgress = (fileName: string, value: number) => {
        const newProgress = new Map(progress);
        progress.set(fileName, value);
        setProgress(newProgress);
    };

    async function performFetch(url: string, options: object, errorMessage: string) {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`${errorMessage}: ${errorBody}`);
        }
        return response.json();
    }

    async function executeUploadProcedure(file: File) {
        const originalFileName = file.name;

        try {
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            if (!uploadRes.ok) throw new Error('Failed to upload file');
            const { uploadResult } = await uploadRes.json();
            updateProgress(originalFileName, 20);

            try {
                const extractRes = await fetch('/api/extract-text', {
                    method: 'POST',
                    body: JSON.stringify(uploadResult)
                });
                if (!extractRes.ok) throw new Error('Failed to extract text');
                const { data: { name, pages, hash, docs } } = await extractRes.json();
                updateProgress(originalFileName, 40);

                try {
                    const splitRes = await fetch('/api/split-embed', {
                        method: 'POST',
                        body: JSON.stringify({ docs })
                    });
                    if (!splitRes.ok) throw new Error('Failed to split text');
                    const { chunks } = await splitRes.json();
                    updateProgress(originalFileName, 60);

                    try {
                        const docRes = await fetch('/api/insert-document', {
                            method: 'POST',
                            body: JSON.stringify({
                                name,
                                pages,
                                hash,
                                tags: selectedTags[originalFileName],
                                publicUrl: uploadResult.publicUrl,
                                fileName: uploadResult.fileName
                            })
                        });
                        if (!docRes.ok) throw new Error('Failed to insert document');
                        const { id } = await docRes.json();
                        updateProgress(originalFileName, 80);

                        const sectionsRes = await fetch('/api/insert-sections', {
                            method: 'POST',
                            body: JSON.stringify({
                                document_id: id,
                                chunks,
                                publicUrl: uploadResult.publicUrl,
                                fileName: uploadResult.fileName
                            })
                        });
                        if (!sectionsRes.ok) throw new Error('Failed to insert document sections');
                        updateProgress(originalFileName, 100);

                        toast.success(`${originalFileName} uploaded successfully`);
                    } catch (error) {
                        console.error(error);
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        toast.error(`Error in document insertion: ${errorMessage}`);
                    }
                } catch (error) {
                    console.error(error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    toast.error(`Error in text splitting: ${errorMessage}`);
                }
            } catch (error) {
                console.error(error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                toast.error(`Error in text extraction: ${errorMessage}`);
            }
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast.error(`Error in file upload: ${errorMessage}`);
        }
    }

    async function handleSubmitFiles() {
        if (files.length === 0) {
            toast.error("No file has been submitted")
            return
        }

        try {
            setProgress(new Map(files.map(file => [file.name, 0])));

            files.forEach(file => {
                if (!(file instanceof File)) {
                    throw new Error('Invalid file type');
                }
            });

            const uploadPromises = files.map(file => executeUploadProcedure(file));

            await Promise.all(uploadPromises);

            await sleep(1500)
            setFiles([]);
            setSelectedTags({});
            setProgress(new Map());
            setDrawerOpen(false);
            router.refresh()
        } catch (error) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : String(error)
            toast.error(errorMessage)
        }
    }

    function handleDrop(e: any) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            for (let i = 0; i < files["length"]; i++) {
                setFiles((prevState: any) => [...prevState, files[i]]);
                setSelectedTags({ ...selectedTags, [files[i].name]: [] });
            }
        }
    }

    function handleDragLeave(e: any) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }

    function handleDragOver(e: any) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }

    function handleDragEnter(e: any) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }

    function removeFile(fileName: any, idx: any) {
        const newArr = [...files];
        newArr.splice(idx, 1);
        setFiles([]);
        setFiles(newArr);
        setSelectedTags({ ...selectedTags, [fileName]: [] });
    }

    function openFileExplorer() {
        inputRef.current.value = "";
        inputRef.current.click();
    }

    return (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger className="" asChild><Button>Upload a document</Button></DrawerTrigger>
            <DrawerContent className="min-h-[45%] max-h-max">
                <div className="flex items-center justify-center py-8 h-full" >
                    <form
                        className={`${dragActive && "bg-blue-500/40 border-blue-500"
                            }  p-4 w-[80%] rounded-lg h-full text-center flex flex-col items-center justify-center border-2 border-dashed border-white`}
                        onDragEnter={handleDragEnter}
                        onSubmit={handleSubmit(handleSubmitFiles)}
                        onDrop={handleDrop}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                    >
                        <DrawerHeader>
                            <DrawerTitle className="text-center">Upload one or more documents</DrawerTitle>
                            {/* <DrawerDescription>This action cannot be undone.</DrawerDescription> */}
                        </DrawerHeader>
                        {/* this input element allows us to select files for upload. We make it hidden so we can activate it when the user clicks select files */}
                        <input
                            placeholder="fileInput"
                            className="hidden"
                            ref={inputRef}
                            type="file"
                            multiple={true}
                            onChange={handleChange}
                            accept=".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf"
                        />

                        <p>
                            Drag & Drop files or{" "}
                            <span
                                className="font-bold text-blue-500 cursor-pointer"
                                onClick={openFileExplorer}
                            >
                                <u>select files</u>
                            </span>{" "}
                            to upload
                        </p>

                        <div className="flex flex-col p-3 w-[80%] space-y-2">
                            {files.map((file: any, idx: any) => (
                                <div key={idx}>
                                    <div className="flex flex-row space-x-5 justify-between border rounded-lg p-4 items-center">
                                        <div className="flex flex-col justify-start text-start space-y-2 w-full">
                                            <div className="flex">{file.name} <div className="text-sm ml-auto min-w-16 text-right">{getBytes(file.size)}</div></div>
                                            <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} forFile={file.name} />
                                        </div>

                                        <Button variant={"ghost"} onClick={() => removeFile(file.name, idx)}>
                                            <Cross1Icon className="size-6 text-red-500 cursor-pointer" />
                                        </Button>
                                    </div>
                                    {!!progress.get(file.name) && <Progress value={progress.get(file.name) ?? 0} />}
                                </div>
                            ))}
                        </div>

                        <DrawerFooter>
                            <div className="flex space-x-2">
                                {files.length > 0 && <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <div className="mr-2">{spinner}</div>}
                                    <div>{isSubmitting ? "Submitting" : "Submit"}</div>
                                </Button>}
                                {!isSubmitting && <DrawerClose asChild onClick={() => setFiles([])}>
                                    <Button variant={"outline"}>Cancel</Button>
                                </DrawerClose>}
                            </div>
                        </DrawerFooter>
                    </form>
                </div>
            </DrawerContent>
        </Drawer >
    );
}