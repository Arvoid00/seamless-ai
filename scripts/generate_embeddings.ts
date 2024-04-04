import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'
import { pipeline } from '@xenova/transformers'
import { createClient } from '../utils/supabase/client'
import { createHash } from 'crypto'

require('dotenv').config()

async function convertPdfToTextAndStore(filePath: string) {
  try {
    const supabase = createClient()
    const generateEmbedding = await pipeline(
      'feature-extraction',
      'Supabase/gte-small'
    )

    // Read PDF file
    const dataBuffer = fs.readFileSync(filePath)

    // Generate MD5 hash of the PDF content
    const hash = createHash('md5').update(dataBuffer).digest('hex')

    // Check if the hash already exists in the database
    let { data: existingDoc, error: findError } = await supabase
      .from('documents')
      .select('hash')
      .eq('hash', hash)
      .select('title')
      .maybeSingle()

    if (findError) throw findError

    // If document exists, skip processing
    if (existingDoc) {
      console.log('Document already processed. Skipping...\n', {
        title: existingDoc.title,
        hash
      })
      return
    }

    const data = await pdfParse(dataBuffer)
    const title = data.info.Title ?? 'No Title'
    const body = data.text // Extracted text from PDF
    const pages = data.numpages

    // Use the text to generate an embedding
    const output = await generateEmbedding(body, {
      pooling: 'mean',
      normalize: true
    })

    // Extract the embedding output
    const embedding = Array.from(output.data)

    // Store the title, body (text), embedding, and hash in Postgres
    await supabase
      .from('documents')
      .insert({
        title: title,
        pages: pages,
        body: body,
        embedding: embedding,
        hash: hash // Ensure you have a 'hash' column in your 'documents' table
      })
      .throwOnError()

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
