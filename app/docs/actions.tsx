'use server'

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

export async function getDocuments() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('documents')
        .select()
        .order('name', { ascending: true })
    return { data, error }
}

export async function getDocumentByName(fileName: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('documents')
        .select()
        .eq('name', fileName)
        .limit(1)
        .single()
    return { data, error }
}

export async function deleteDocument(id: number) {
    const supabase = createClient()
    const { data } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .throwOnError()
    return { data }
}

export async function uploadFileToSupabase(file: File) {
    console.log('Uploading file', file.name)
    const safeFileName = file.name.replace(/[^0-9a-zA-Z!-_.*'()]/g, '_')
    const supabase = createClient()
    const { data: obj, error } = await supabase.storage
        .from('documents')
        .upload(`/documents/${safeFileName + Date()}`, file, {
            upsert: false
        })

    if (error) {
        throw new Error(`Error while uploading '${safeFileName}': ${error.message}`)
    }
    console.log('Uploaded file', obj.path)
    const {
        data: { publicUrl }
    } = supabase.storage.from('documents').getPublicUrl(obj.path)

    return { fileName: safeFileName, publicUrl }
}

export async function deleteFileObject(fileName: string) {
    const path = `documents/${fileName}`
    console.log('Deleting file', path)
    const supabase = createClient()
    const { error } = await supabase.storage
        .from('documents')
        .remove([path])
    return { error }
}