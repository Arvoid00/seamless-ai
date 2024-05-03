'use server'

import { createClient } from "@/utils/supabase/server"
// import { Upload } from 'tus-js-client'

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

export async function uploadFileToSupabase(file: File, bucketName: string) {
    console.log('Uploading file', file.name)
    const safeFileName = file.name.replace(/[^0-9a-zA-Z!-_.*'()]/g, '_')
    const supabase = createClient()
    const { data: obj, error } = await supabase.storage
        .from('documents')
        .upload(`/${bucketName}/${safeFileName}`, file, {
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

// NOTE: This function is not implemented correctly yet

// export async function uploadResumableFileToSupabase(file: File, bucketName: string) {
//     const supabase = createClient()
//     const { data: { session } } = await supabase.auth.getSession()
//     const projectId = process.env.SUPABASE_PROJECT_ID

//     if (!session) {
//         throw new Error('No active session')
//     }

//     console.log('Uploading file', file.name)
//     const safeFileName = file.name.replace(/[^0-9a-zA-Z!-_.*'()]/g, '_')
//     const arraybuffer = await file.arrayBuffer()
//     const buffer = Buffer.from(arraybuffer)

//     return new Promise(async (resolve, reject) => {
//         var upload = new Upload(buffer, {
//             endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
//             retryDelays: [0, 3000, 5000, 10000, 20000],
//             headers: {
//                 authorization: `Bearer ${session.access_token}`,
//                 'x-upsert': 'false', // optionally set upsert to true to overwrite existing files
//             },
//             uploadDataDuringCreation: true,
//             removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
//             metadata: {
//                 bucketName: bucketName,
//                 objectName: safeFileName,
//                 cacheControl: "3600",
//             },
//             chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
//             onError: function (error) {
//                 console.log('Failed because: ' + error)
//                 reject(error)
//             },
//             onProgress: function (bytesUploaded, bytesTotal) {
//                 var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
//                 console.log(bytesUploaded, bytesTotal, percentage + '%')
//             },
//             onSuccess: function () {
//                 const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(upload.url!)
//                 console.log('Download %s from %s', upload.file.name, upload.url)
//                 resolve({ fileName: safeFileName, publicUrl: publicUrl })
//             },
//         })

//         // Check if there are any previous uploads to continue.
//         const previousUploads = await upload.findPreviousUploads()
//         // Found previous uploads so we select the first one.
//         if (previousUploads.length) {
//             upload.resumeFromPreviousUpload(previousUploads[0])
//         }
//         // Start the upload
//         upload.start()
//     })
// }

export async function deleteFileObject(fileName: string) {
    const path = `documents/${fileName}`
    console.log('Deleting file', path)
    const supabase = createClient()
    const { error } = await supabase.storage
        .from('documents')
        .remove([path])
    return { error }
}