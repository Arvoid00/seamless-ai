import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { OpenAIEmbeddings } from '@langchain/openai'
import { createClient } from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
// import {
//   ChatCompletionCreateParams,
//   ChatCompletionCreateParamsNonStreaming,
//   CompletionCreateParamsNonStreaming
// } from 'openai/resources'
import { oneLine, stripIndent } from 'common-tags'
import { ChatCompletionMessageParam } from 'openai/resources'
import { OpenAIStream, StreamingTextResponse } from 'ai'

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
      tableName: 'document_sections',
      queryName: 'match_documents'
    }
  )

  const retriever = vectorstore.asRetriever(5)
  const pages = await retriever.getRelevantDocuments(sanitizedQuery)

  const corpus = pages
    .map(
      (page: any) =>
        `${page.pageContent}\n\n${page.metadata.source ? page.metadata.source : ''}`
    )
    .join('\n\n')

  console.log(corpus)

  const systemMessage = {
    role: 'system',
    name: 'initial',
    content: stripIndent`${oneLine`
    You are an advanced vector search AI assistant with the capability to understand complex queries and provide accurate, relevant information or recommendations.
    Answer the user's question based on the context provided. The context is a collection of documents that you can use to generate the answer.
    You can use the information in the context to answer the question, but you cannot access external sources or the internet.
    If you are unsure and the answer is not explicitly written in the documentation, say "Sorry, I don't know how to help with that.", and provide a brief explanation.`} 

    Context:
    ${corpus}

    Question: """
    ${sanitizedQuery}
    """
  
    Answer in text formats, code snippets should be returned in markdown and tables in HTML.
    `
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
  const completion = await openai.chat.completions.create({
    // model: 'gpt-4-turbo-preview',
    model: 'gpt-3.5-turbo',
    max_tokens: 512,
    temperature: 0,
    stream: false,
    messages: [systemMessage]
  })

  // const stream = OpenAIStream(completion)
  const result = completion.choices[0]

  console.log(result)
  console.log(completion.usage)

  return NextResponse.json({ data: result, usage: completion.usage })
  // return new StreamingTextResponse(stream)
}
