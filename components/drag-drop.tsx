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
import { getBytes } from "@/lib/utils";
import { SupabaseTag } from "@/lib/supabase";

export type SelectedTagsProps = {
    [key: string]: SupabaseTag[]
}

export default function DragAndDrop() {
    const [dragActive, setDragActive] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const inputRef = useRef<any>(null);
    const [files, setFiles] = useState<Blob[]>([]);
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

    async function handleSubmitFiles() {
        if (files.length === 0) {
            toast.error("No file has been submitted")
            return
        }

        const formData = new FormData();
        files.forEach((file, idx) => formData.append(`file`, file));
        formData.append("tags", JSON.stringify(selectedTags));

        const result = await fetch('/api/embed', {
            method: 'POST',
            body: formData
        });

        const data = await result.json();

        data.success ? toast.success(data.message) : toast.error(data.message)
        setFiles([]);
        setSelectedTags({});
        setDrawerOpen(false);
        router.refresh()
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
            <DrawerContent>
                <div className="flex items-center justify-center h-max p-8 ">
                    <form
                        className={`${dragActive && "bg-blue-500/40 border-blue-500"
                            }  p-4 w-3/4 rounded-lg  min-h-[10rem] text-center flex flex-col items-center justify-center border-2 border-dashed border-white`}
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
                                <div key={idx} className="flex flex-row space-x-5 justify-between border rounded-lg p-4 items-center">
                                    <div className="flex flex-col justify-start text-start space-y-2 w-full">
                                        <div className="flex">{file.name} <div className="text-sm ml-auto min-w-16 text-right">{getBytes(file.size)}</div></div>
                                        <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} forFile={file.name} />
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