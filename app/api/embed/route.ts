import pdfParse from 'pdf-parse'
import { createHash } from 'crypto'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { OpenAIEmbeddings } from '@langchain/openai'
import { createClient } from '@/utils/supabase/server'
import { NextApiResponse } from 'next'

export async function POST(req: Request, res: NextApiResponse) {
  try {
    const formData = await req.formData()

    formData.forEach(async (value, key) => {
      const file = value as File
      console.log(`Uploading ${file.name}...`)
      const client = createClient()
      const { error } = await client.storage
        .from('documents')
        .upload(`/documents/${file.name}`, file)
      if (error) {
        console.error(error.message)
        return
      }

      const arrayBuffer = await file.arrayBuffer()
      const dataBuffer = Buffer.from(arrayBuffer)

      const data = await pdfParse(dataBuffer)
      const title: string = data.info.Title ?? 'No Title'
      const content = data.text.replace(/\n/g, ' ') // Extracted text from PDF
      const pages = data.numpages
      const hash = createHash('md5').update(dataBuffer).digest('hex')

      // Store the documents in the database
      await SupabaseVectorStore.fromTexts(
        [content],
        [{ title, pages, hash }],
        new OpenAIEmbeddings(),
        {
          client,
          tableName: 'documents'
        }
      )
    })

    console.log('formData:', formData)
    return Response.json({ ok: true, message: 'Files uploaded successfully' })
  } catch (error) {
    console.error('Error converting PDF to text and storing:', error)
    return Response.json({ ok: false, message: error })
  }
}
