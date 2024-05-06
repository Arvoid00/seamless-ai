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
import { Progress } from "./ui/progress";

export type SelectedTagsProps = {
    [key: string]: SupabaseTag[]
}

export type CustomError = {
    success: boolean,
    message: string
}

export default function DragAndDrop() {
    const [dragActive, setDragActive] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const inputRef = useRef<any>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [progress, setProgress] = useState<Map<string, number>>(new Map());
    const [uploadErrors, setUploadErrors] = useState<Map<string, string>>(new Map());
    const [selectedTags, setSelectedTags] = useState<SelectedTagsProps>({});
    const router = useRouter();
    const {
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm()

    const updateProgress = (fileName: string, value: number) => {
        setProgress(prev => new Map(prev.set(fileName, value)));
    };

    const updateUploadErrors = (fileName: string, error: string) => {
        setUploadErrors(prev => new Map(prev.set(fileName, error)));
    }

    async function performFetch(url: string, options: object, errorMessage: string) {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            // throw new Error(`${errorMessage}: ${errorBody}`);
            throw new Error(`${errorBody}`);
        }
        return response.json();
    }

    async function executeUploadProcedure(file: File) {
        const originalFileName = file.name;

        try {
            const formData = new FormData();
            formData.append("file", file);
            updateProgress(originalFileName, 10);

            const { uploadResult } = await performFetch('/api/upload', {
                method: 'POST',
                body: formData
            }, 'Failed to upload file');
            updateProgress(originalFileName, 20);

            const { data: { name, pages, hash, docs } } = await performFetch('/api/extract-text', {
                method: 'POST',
                body: JSON.stringify(uploadResult)
            }, 'Failed to extract text');
            updateProgress(originalFileName, 40);

            const { chunks } = await performFetch('/api/split-embed', {
                method: 'POST',
                body: JSON.stringify({ docs })
            }, 'Failed to split text');
            updateProgress(originalFileName, 60);

            const { id } = await performFetch('/api/insert-document', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    pages,
                    hash,
                    tags: selectedTags[originalFileName],
                    publicUrl: uploadResult.url,
                    fileName: uploadResult.fileName
                })
            }, 'Failed to insert document');
            updateProgress(originalFileName, 80);

            await performFetch('/api/insert-sections', {
                method: 'POST',
                body: JSON.stringify({
                    document_id: id,
                    chunks,
                    publicUrl: uploadResult.url,
                    fileName: uploadResult.fileName
                })
            }, 'Failed to insert document sections');
            updateProgress(originalFileName, 100);

            toast.success(`${originalFileName} uploaded successfully`);

        } catch (error) {
            let customError = error as CustomError;
            let customErrorMessage = JSON.parse(customError.message).message;
            updateUploadErrors(originalFileName, customErrorMessage);
        }
    }

    async function handleSubmitFiles() {
        if (files.length === 0) {
            toast.error("No file has been submitted")
            return
        }

        try {
            setProgress(new Map(files.map(file => [file.name, 0])));

            let uploadableFiles = [...files];
            files.forEach(file => {
                if (!(file instanceof File && file.type === "application/pdf")) {
                    updateUploadErrors(file.name, "Invalid file type. Must be a PDF file.");
                    // remove the file from the list of files to upload
                    uploadableFiles.splice(uploadableFiles.indexOf(file), 1);
                }
            });

            const uploadPromises = uploadableFiles.map(file => executeUploadProcedure(file));
            await Promise.all(uploadPromises);

            if (uploadErrors.size > 0) {
                toast.error("Some files failed to upload, please check the errors and try again.")
                // set files to only the files that failed to upload
                setFiles(files.filter(file => uploadErrors.has(file.name)));
                router.refresh()
            } else {
                toast.success("All files uploaded successfully")
                await sleep(2000)
                setFiles([]);
                setSelectedTags({});
                setProgress(new Map());
                setUploadErrors(new Map());
                setDrawerOpen(false);
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            const errorMessage = error instanceof Error ? JSON.parse(error.message).message : String(error)
            toast.error(errorMessage)
        }
    }

    function handleChange(e: any) {
        e.preventDefault();

        const newFiles = "dataTransfer" in e ? e.dataTransfer.files : e.target.files;
        if (newFiles === null) return

        for (const file of newFiles) {
            if (file === null) return
            setFiles((prevState) => [...prevState, file]);
            setSelectedTags({ ...selectedTags, [file.name]: [] });
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
                            // accept=".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf"
                            accept=".pdf"
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
                                <div key={idx} className="flex flex-row space-x-5 justify-between border rounded-lg p-4 items-center">
                                    <div className="flex flex-col justify-start text-start space-y-2 w-full">
                                        <div className="flex">{file.name} <div className="text-sm ml-auto min-w-16 text-right">{getBytes(file.size)}</div></div>
                                        <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} forFile={file.name} />
                                        {!!progress.get(file.name) && <Progress className="mt-2" value={progress.get(file.name) ?? 0} />}
                                        {!!uploadErrors.get(file.name) && <div className="mt-2 text-red-500 font-semibold"> {uploadErrors.get(file.name)}</div>}
                                    </div>

                                    <Button variant={"ghost"} onClick={() => removeFile(file.name, idx)}>
                                        <Cross1Icon className="size-6 text-red-500 cursor-pointer" />
                                    </Button>
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