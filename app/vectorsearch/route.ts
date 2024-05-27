// import {
//   SupabaseFilterRPCCall,
//   SupabaseVectorStore
// } from '@langchain/community/vectorstores/supabase'
// import { OpenAIEmbeddings } from '@langchain/openai'
import { PostgrestError, createClient } from '@supabase/supabase-js'
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
import { generateEmbedding } from '@/lib/chat/actions'
// import { OpenAIStream, StreamingTextResponse } from 'ai'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

export type PageSection = {
  id: number
  content: string
  similarity: number
  metadata?: {
    loc?: { lines?: { from?: number; to?: number }; pageNumber?: number }
    pdf?: {
      totalPages?: number
      info?: { Creator?: string; CreationDate?: string }
    }
    sourcePage?: string
    fileName?: string
  }
}

export type VectorResponse = {
  data: OpenAI.Chat.Completions.ChatCompletion.Choice
  usage?: OpenAI.Completions.CompletionUsage | undefined
  sections: PageSection[]
}

export type RPCResponse = {
  error: PostgrestError | null
  data: PageSection[] | null
}

export async function POST(req: Request, res: NextApiResponse) {
  const { query, tags } = await req.json()
  const sanitizedQuery = query.replace(/[^a-zA-Z0-9\s]/g, '').trim()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
  )

  // const vectorstore = await SupabaseVectorStore.fromExistingIndex(
  //   new OpenAIEmbeddings(),
  //   {
  //     client: supabase,
  //     tableName: 'document_sections',
  //     queryName: 'match_documents'
  //   }
  // )

  // const retriever = vectorstore.asRetriever(5)
  // const pages = await retriever.getRelevantDocuments(sanitizedQuery)

  // const resultOne = await vectorstore.similaritySearch('Hello world', 1)
  // console.log('res1', resultOne)

  // const funcFilterA: SupabaseFilterRPCCall = rpc =>
  //   rpc
  //     .filter('metadata->b::int', 'lt', 3)
  //     .filter('metadata->c::int', 'gt', 7)
  //     .textSearch('content', sanitizedQuery, { config: 'english' })

  // const resultA = await vectorstore.similaritySearch(
  //   sanitizedQuery,
  //   5
  //   // funcFilterA
  // )
  // console.log(resultA)

  // console.log('Query:', sanitizedQuery)
  // console.log('Tags:', tags)

  const embedding = await generateEmbedding(sanitizedQuery)

  const { error: matchError, data: pageSections }: RPCResponse =
    await supabase.rpc('match_documents_new', {
      query_embedding: embedding,
      match_threshold: 0.0, //0.78,
      match_count: 8,
      filter: {},
      tags: tags.map((tag: any) => tag.value)
      // min_content_length: 50
    })

  if (matchError || !pageSections)
    throw new Error(
      'Error fetching page sections, or no sections returned. Error? : ' +
        matchError?.message
    )

  console.log('Number of Page Sections:', pageSections.length)
  console.log('pageSections', pageSections)

  const corpus = pageSections
    .map(
      (section: any, index: number) =>
        `Page ${index + 1}: (Source: ${section.metadata?.sourcePage ?? 'unknown'})\n\n ${section.content}`
    )
    .join('\n\n')

  const systemMessage = {
    role: 'system',
    content: stripIndent`${oneLine`
    You are an advanced vector search AI assistant with the capability to understand complex queries and provide accurate, relevant information or recommendations.
    Answer the user's question based on the context provided. The context is a collection of documents that you can use to generate the answer.
    You can use the information in the context to answer the question, but you cannot access external sources or the internet.
    If you are unsure and the answer is not explicitly written in the documentation, you are allowed to ask follow-up questions.
    If the additional information also does not help, say "Sorry, I don't know how to help with that.", and provide a brief explanation why you could not answer the question.`} 

    Context:
    ${corpus}

    Question: """
    ${sanitizedQuery}
    """
  
    Answer in text formats. Code snippets and tables must be returned in Markdown.
    `
  } as ChatCompletionMessageParam

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    // max_tokens: 1000,
    temperature: 0,
    stream: false,
    messages: [systemMessage]
  })

  // const stream = OpenAIStream(completion)
  const result = completion.choices[0]

  console.log(result)
  console.log(completion.usage)

  return NextResponse.json({
    data: result,
    usage: completion.usage,
    sections: pageSections
  })
  // return new StreamingTextResponse(stream)
}
