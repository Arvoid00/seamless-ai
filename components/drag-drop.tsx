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

export default function DragAndDrop() {
    const [dragActive, setDragActive] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const inputRef = useRef<any>(null);
    const [files, setFiles] = useState<Blob[]>([]);
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

        if (newFiles != null) {
            for (let i = 0; i < newFiles.length; i++) {
                setFiles((prevState) => [...prevState, newFiles[i]]);
            }
        }
    }

    async function handleSubmitFiles() {
        if (files.length === 0) {
            toast.error("No file has been submitted")
            return
        }

        const formData = new FormData();
        files.forEach((file, idx) => formData.append(`file-${idx}`, file));

        const result = await fetch('/api/embed', {
            method: 'POST',
            body: formData
        });

        const data = await result.json();

        data.success ? toast.success(data.message) : toast.error(data.message)
        setFiles([]);
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

                        <div className="flex flex-col items-center p-3">
                            {files.map((file: any, idx: any) => (
                                <div key={idx} className="flex flex-row space-x-5 items-center justify-between w-full">
                                    <div>{file.name}</div>
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