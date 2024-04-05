"use client";

import { createClient } from "@/utils/supabase/client";
import { useRef, useState } from "react";

export type TFile = string | ArrayBuffer | ArrayBufferView | Blob | Buffer | File | FormData | NodeJS.ReadableStream | ReadableStream<Uint8Array> | URLSearchParams

export default function DragAndDrop() {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<any>(null);
    const [files, setFiles] = useState<Blob[]>([]);

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

    async function handleSubmitFile(e: any) {
        e.preventDefault();
        if (files.length === 0) {
            alert("No file has been submitted");
            return
        }

        const formData = new FormData();
        for (let i = 0; i < inputRef.current.files.length; i++) {
            formData.append("files", inputRef.current.files[i]);
        }

        const response = await fetch('/api/embed', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            setFiles([]);
            alert("Files uploaded successfully");
        } else {
            alert("Error uploading files");
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
        <div className="flex items-center justify-center h-max p-8">
            <form
                className={`${dragActive ? "bg-blue-400" : "bg-gray-700"
                    }  p-4 w-3/4 rounded-lg  min-h-[10rem] text-center flex flex-col items-center justify-center`}
                onDragEnter={handleDragEnter}
                onSubmit={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
            >
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
                        className="font-bold text-black cursor-pointer"
                        onClick={openFileExplorer}
                    >
                        <u>Select files</u>
                    </span>{" "}
                    to upload
                </p>

                <div className="flex flex-col items-center p-3">
                    {files.map((file: any, idx: any) => (
                        <div key={idx} className="flex flex-row space-x-5">
                            <span>{file.name}</span>
                            <span
                                className="text-red-500 cursor-pointer"
                                onClick={() => removeFile(file.name, idx)}
                            >
                                remove
                            </span>
                        </div>
                    ))}
                </div>

                {files.length > 0 && <button
                    className="bg-black rounded-lg p-2 mt-3 w-auto"
                    onClick={handleSubmitFile}
                >
                    <span className="p-2 text-white">Submit</span>
                </button>}
            </form>
        </div>
    );
}