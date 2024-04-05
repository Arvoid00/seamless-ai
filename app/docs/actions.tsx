'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getDocumentsInFolder(folderName: string) {
    const supabase = createClient()
    const { data: documents, error } = await supabase
        .storage
        .from('documents')
        .list(folderName, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        })
    return { documents, error }
}

export async function uploadDocument(file: string | ArrayBuffer | ArrayBufferView | Blob | Buffer | File | FormData | NodeJS.ReadableStream | ReadableStream<Uint8Array> | URLSearchParams) {
    console.log(file);

    const supabase = createClient()
    const { data, error } = await supabase.storage
        .from('documents')
        .upload(`/documents/${file.name}`, file)

    revalidatePath('/docs')
    return { data, error }
}