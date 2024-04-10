// @ts-ignore
import PdfParse from 'pdf-parse-fork'
import OpenAI from 'openai'
import { createHash } from 'crypto'
import { createClient } from '@/utils/supabase/server'
import { NextApiResponse } from 'next'
import { File } from 'buffer'
import { NextRequest } from 'next/server'
import { Embedding } from 'openai/resources/embeddings'
import { Content } from '@radix-ui/react-dropdown-menu'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { OpenAIEmbeddings } from '@langchain/openai'
import { generateEmbedding } from '@/lib/chat/actions'
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// TODO: Rollback sequence if any of the steps fail

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type FileContents = {
  title: string
  content: string
  pages: number
  hash: string
}

async function uploadFileToSupabase(
  file: FormDataEntryValue & File
): Promise<string> {
  const safeFileName = file.name.replace(/[^0-9a-zA-Z!-_.*'()]/g, '_')
  const client = createClient()
  const { data: obj, error } = await client.storage
    .from('documents')
    .upload(`/documents/${safeFileName + new Date().toISOString()}`, file)

  if (error) {
    throw new Error(`Error while uploading '${safeFileName}': ${error.message}`)
  }

  const {
    data: { publicUrl }
  } = client.storage.from('documents').getPublicUrl(obj.path)

  return publicUrl
}

async function extractTextFromPDF(file: File): Promise<FileContents> {
  const dataBuffer = Buffer.from(await file.arrayBuffer())
  const data = await PdfParse(dataBuffer)
  const title = file.name.replace(/[^0-9a-zA-Z!-_.*'()]/g, '_')
  const content = data.text.replace(/\n/g, ' ')
  const pages = data.numpages
  const hash = createHash('md5').update(dataBuffer).digest('hex')

  return { title, content, pages, hash }
}

type ChunkObject = {
  chunk: string
  embedding: number[]
}

async function generateEntireDocEmbedding(content: string) {
  const { data } = await openai.embeddings.create({
    input: content,
    model: 'text-embedding-3-small'
  })
  return data[0].embedding
}

async function generateSlidingWindowEmbeddings(
  content: string
): Promise<ChunkObject[]> {
  const chunkSize = 1024
  const overlapSize = 100
  let position = 0
  let chunkObjects = []

  while (position < content.length) {
    const chunk = content.substring(
      position,
      Math.min(position + chunkSize, content.length)
    )
    const embedding = await generateEmbedding(chunk)

    position += chunkSize - overlapSize
    const chunkObject = { chunk, embedding: embedding }
    chunkObjects.push(chunkObject)
  }

  return chunkObjects
}

type Document = {
  name: string
  // content: string
  // embedding: number[]
  pages: number
  hash: string
  publicUrl: string
}

async function insertDocument({
  name,
  // content,
  // embedding,
  pages,
  hash,
  publicUrl
}: Document) {
  const supabase = createClient()

  const { data } = await supabase
    .from('documents')
    .insert({
      name,
      // content,
      // embedding,
      metadata: { pages, hash },
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
  chunkObjects: ChunkObject[]
  source: string
}

async function insertDocumentSections({
  document_id,
  chunkObjects,
  source
}: DocumentSection): Promise<void> {
  const supabase = createClient()

  const sections = chunkObjects.map(({ chunk, embedding }) => ({
    document_id: document_id,
    content: chunk,
    embedding
    // source
  }))

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

      //   const safeFileName = file.name.replace(/[^0-9a-zA-Z!-_.*'()]/g, '_')

      //   // Upload the file to Supabase Storage bucket
      //   const client = createClient()
      //   const { data: obj, error } = await client.storage
      //     .from('documents')
      //     .upload(`/documents/${safeFileName}`, file)
      //   if (error) {
      //     console.error('err:', error.message)
      //     throw new Error(
      //       `Error while uploading '${safeFileName}': ${error.message}`
      //     )
      //   }

      //   // Get the public URL of the uploaded file
      //   const {
      //     data: { publicUrl }
      //   } = client.storage.from('documents').getPublicUrl(obj.path)

      //   console.log('Uploaded file:', publicUrl)

      //   // Extract text and metadata from the PDF
      //   const dataBuffer = Buffer.from(await file.arrayBuffer())
      //   const data = await PdfParse(dataBuffer)
      //   const title = safeFileName
      //   const content = data.text.replace(/\n/g, ' ') // Extracted text from PDF
      //   const pages = data.numpages
      //   const hash = createHash('md5').update(dataBuffer).digest('hex')

      //   // Generate embeddings for the text
      //   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

      //   // Generate a one-time embedding for the query itself
      //   const { data: embeddings, usage } = await openai.embeddings.create({
      //     input: content,
      //     model: 'text-embedding-ada-002'
      //   })

      //   const embedding = embeddings[0].embedding

      //   // Store the documents in the database

      //   await client
      //     .from('documents')
      //     .insert({
      //       title,
      //       content,
      //       embedding,
      //       metadata: { pages, hash },
      //       source: publicUrl
      //     })
      //     .throwOnError()

      const publicUrl = await uploadFileToSupabase(file)
      const {
        title: name,
        content,
        pages,
        hash
      } = await extractTextFromPDF(file)
      // const embedding = await generateEntireDocEmbedding(content)
      const chunkObjects = await generateSlidingWindowEmbeddings(content)

      const { id } = await insertDocument({
        name,
        // content,
        // embedding,
        pages,
        hash,
        publicUrl
      })

      await insertDocumentSections({
        document_id: id,
        chunkObjects,
        source: publicUrl
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
