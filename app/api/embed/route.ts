import OpenAI from 'openai'
import { createHash } from 'crypto'
import { createClient } from '@/utils/supabase/server'
import { File } from 'buffer'
import { NextRequest } from 'next/server'
import { generateEmbedding } from '@/lib/chat/actions'
import { WebPDFLoader } from 'langchain/document_loaders/web/pdf'
import { Document } from 'langchain/document'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { uploadFileToSupabase } from '@/app/docs/actions'

// TODO: Rollback sequence if any of the steps fail

type FileContents = {
  name: string
  content: string
  pages: number
  hash: string
  docs: Document[]
}

async function extractTextFromPDF(
  url: string,
  fileName: string
): Promise<FileContents> {
  const response = await fetch(url)
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

async function splitText(docs: Document[]) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100
  })

  // const chunkObjects: ChunkObject[] = await Promise.all(
  //   docs.map(async doc => ({
  //     doc: doc,
  //     chunk: doc.pageContent,
  //     embedding: await generateEmbedding(doc.pageContent)
  //   }))
  // )

  const newDocs = await splitter.splitDocuments(docs)

  const chunkObjects: ChunkObject[] = await Promise.all(
    newDocs.map(async doc => ({
      doc: doc,
      chunk: doc.pageContent,
      embedding: await generateEmbedding(doc.pageContent)
    }))
  )

  return chunkObjects
}

type FileDocument = {
  name: string
  pages: number
  hash: string
  publicUrl: string
  fileName: string
}

async function insertDocument({
  name,
  pages,
  hash,
  publicUrl,
  fileName
}: FileDocument) {
  const supabase = createClient()

  const { data } = await supabase
    .from('documents')
    .insert({
      name,
      metadata: { pages, hash, fileName },
      source: publicUrl
    })
    .throwOnError()
    .select()
    .single()

  await supabase.from('document_owners').insert({ document_id: data.id }) // Implicitly uses the authenticated UserID as the owner

  return data
}

type DocumentSection = {
  document_id: number
  chunks: ChunkObject[]
  source: string
  fileName: string
}

async function insertDocumentSections({
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
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = Array.from(formData.values())

    for (const file of files) {
      if (!(file instanceof File)) {
        throw new Error('Invalid file type')
      }

      // @ts-expect-error
      const { fileName, publicUrl } = await uploadFileToSupabase(file)
      const { name, pages, hash, docs } = await extractTextFromPDF(
        publicUrl,
        fileName
      )

      const chunks = await splitText(docs)

      const { id } = await insertDocument({
        name,
        pages,
        hash,
        publicUrl,
        fileName
      })

      await insertDocumentSections({
        document_id: id,
        chunks,
        source: publicUrl,
        fileName: fileName
      })
    }

    return Response.json({
      success: true,
      message: 'Files uploaded successfully'
    })
  } catch (error) {
    console.error('Error converting PDF to text and storing:', error)
    const errorMessage = error instanceof Error ? error.message : error
    return Response.json({ success: false, message: errorMessage })
  }
}
