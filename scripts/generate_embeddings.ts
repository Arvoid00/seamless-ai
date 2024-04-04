import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'
import { createClient } from '../utils/supabase/client'
import { createHash } from 'crypto'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { OpenAIEmbeddings } from '@langchain/openai'

require('dotenv').config()

async function convertPdfToTextAndStore(filePath: string) {
  try {
    const client = createClient()
    // Read PDF file
    const dataBuffer = fs.readFileSync(filePath)

    // Generate MD5 hash of the PDF content
    const hash = createHash('md5').update(dataBuffer).digest('hex')

    // Check if the hash already exists in the database
    let { data: existingDocs, error: findError } = await client
      .from('documents')
      .select()

    if (findError) console.error(findError)

    // If document exists, skip processing
    if (existingDocs) {
      const matchedDoc = existingDocs.find(doc => doc.metadata.hash === hash)
      if (matchedDoc) {
        console.log('Document already processed. Skipping...\n', {
          title: matchedDoc.metadata.title,
          hash
        })
        return
      }
    }

    const data = await pdfParse(dataBuffer)
    const title: string = data.info.Title ?? 'No Title'
    const content = data.text.replace(/\n/g, ' ') // Extracted text from PDF
    const pages = data.numpages

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

    console.log('Successfully stored PDF data!')
  } catch (error) {
    console.error('Error converting PDF to text and storing:', error)
  }
}

async function convertAllPdfsInFolder(folderPath: string) {
  try {
    const files = fs.readdirSync(folderPath)
    const pdfFiles = files.filter(
      file => path.extname(file).toLowerCase() === '.pdf'
    )

    for (const pdfFile of pdfFiles) {
      const filePath = path.join(folderPath, pdfFile)
      await convertPdfToTextAndStore(filePath)
    }
  } catch (error) {
    console.error('Error converting PDFs in folder:', error)
  }
}

// Call the function with the path to your data folder
convertAllPdfsInFolder(path.join(__dirname, '../data'))
