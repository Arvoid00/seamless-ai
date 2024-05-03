
import { createHash } from 'crypto'
import { createClient } from '@/utils/supabase/server'
import { generateEmbedding } from '@/lib/chat/actions'
import { WebPDFLoader } from 'langchain/document_loaders/web/pdf'
import { Document } from 'langchain/document'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { fetchWithRetry } from '@/lib/utils'
import { SupabaseTag } from '@/types/supabase'

type FileContents = {
    name: string
    content: string
    pages: number
    hash: string
    docs: Document[]
}

export async function extractTextFromPDF(
    url: string,
    fileName: string
): Promise<FileContents> {
    console.log('Extracting text from PDF:', url)
    const response = await fetchWithRetry(url)
    const data = await response.blob()
    const loader = new WebPDFLoader(data)
    const docs = await loader.load()

    const name = docs[0].metadata.title || fileName || 'Untitled'
    const pages = docs[0].metadata.pages
    const content = docs.map(doc => doc.pageContent).join(' ')
    const hash = createHash('md5').update(content).digest('hex')

    return { name, content, pages, hash, docs }
}

type ChunkObject = {
    doc: Document<Record<string, any>>
    chunk: string
    embedding: number[]
}

export async function splitText(docs: Document[]) {
    console.log('Splitting text into chunks:', docs.length)
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100
    })

    const newDocs = await splitter.splitDocuments(docs)

    const chunkObjects: ChunkObject[] = await Promise.all(
        newDocs.map(async doc => ({
            doc: doc,
            chunk: doc.pageContent,
            embedding: await generateEmbedding(doc.pageContent)
        }))
    )
    console.log('Generated embeddings')
    return chunkObjects
}

type FileDocument = {
    name: string
    pages: number
    hash: string
    tags: SupabaseTag[]
    publicUrl: string
    fileName: string
}

export async function insertDocument({
    name,
    pages,
    hash,
    tags,
    publicUrl,
    fileName
}: FileDocument) {
    const supabase = createClient()

    const { data } = await supabase
        .from('documents')
        .insert({
            name,
            metadata: { pages, hash, fileName, tags },
            source: publicUrl
        })
        .throwOnError()
        .select()
        .single()

    await supabase.from('document_owners').insert({ document_id: data.id }) // Implicitly uses the authenticated UserID as the owner

    console.log('Inserted document:', data.id)

    return data
}

type DocumentSection = {
    document_id: number
    chunks: ChunkObject[]
    source: string
    fileName: string
}

export async function insertDocumentSections({
    document_id,
    chunks,
    source,
    fileName
}: DocumentSection): Promise<void> {
    const supabase = createClient()

    const sections = chunks.map(({ doc, chunk, embedding }) => {
        const sourcePage = source + `#page=${doc.metadata.loc.pageNumber}`
        return {
            document_id,
            content: chunk,
            embedding,
            metadata: { fileName, sourcePage, ...doc.metadata }
        }
    })

    const { error } = await supabase.from('document_sections').insert(sections)

    if (error) {
        throw new Error(`Error inserting document section: ${error.message}`)
    }
    console.log('Inserted document sections')
}