'use server'

import { TFile } from "@/components/drag-drop";
import { createClient } from "@/utils/supabase/server"

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

export async function uploadDocument(file: TFile) {
    const supabase = createClient()
    const { data, error } = await supabase.storage
        .from('documents')
        .upload(`/documents/${file.name}`, file)

    return { data, error }
}