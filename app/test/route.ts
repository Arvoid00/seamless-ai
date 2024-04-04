import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { OpenAIEmbeddings } from '@langchain/openai'
import { createClient } from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

export async function POST(req: Request, res: NextApiResponse) {
  // Your code here
  const json = await req.json()
  const { query } = json

  const sanitizedQuery = query.replace(/[^a-zA-Z0-9\s]/g, '').trim()

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
  )

  const vectorstore = await SupabaseVectorStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    {
      client,
      tableName: 'documents'
    }
  )

  const retriever = vectorstore.asRetriever(4)
  const pages = await retriever.getRelevantDocuments(sanitizedQuery)

  const corpus = pages
    .map(
      (page: any) =>
        `${page.pageContent}\n\n${page.metadata.source ? page.metadata.source : ''}`
    )
    .join('\n\n')

  const systemMessage = {
    role: 'system',
    content: `
    You are a very document searcher who loves
    to help people! Given the following documents, answer the question using only that information,
    outputted in text format. If you are unsure and the answer 
    is not explicitly written in the documentation, say
    "Sorry, I don't know how to help with that."

  Context sections:
  ${corpus}

  Question: 
  ${sanitizedQuery}
  

  Answer in text formats, code snippets should be returned in markdown and tables in HTML.
`
  }

  const finalMessages = [systemMessage]

  const completionOptions: CreateCompletionRequest = {
    model: 'gpt-4-turbo-preview',
    max_tokens: 512,
    temperature: 0,
    stream: false,
    messages: finalMessages
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(completionOptions)
  })

  if (!response.ok) {
    const error = await response.json()
    // throw new ApplicationError('Failed to generate completion', error)
    console.log('Failed to generate completion', error)
  }

  const completionResponse = await response.json()

  return NextResponse.json({
    data: completionResponse.choices[0],
    usage: completionResponse.usage
  })
}
