import 'server-only'

import {
    createAI,
    createStreamableUI,
    getMutableAIState,
    getAIState,
    render,
    createStreamableValue
} from 'ai/rsc'
import OpenAI from 'openai'

import {
    spinner,
    BotCard,
    BotMessage,
    SystemMessage,
    Stock,
    Purchase
} from '@/components/stocks'

import {
    formatNumber,
    runAsyncFnWithoutBlocking,
    sleep,
    nanoid
} from '@/lib/utils'

import { OpenAIEmbeddings } from '@langchain/openai'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'

import { createClient } from '@supabase/supabase-js'
import { AI } from './actions'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
})

export async function vectorSearch(query: string) {
    'use server'

    const aiState = getMutableAIState<typeof AI>()

    const results = createStreamableUI(
        <div className="inline-flex items-start gap-1 md:items-center">
            {spinner}
            <p className="mb-2">Searching for documents...</p>
        </div>
    )

    const systemMessage = createStreamableUI(null)

    runAsyncFnWithoutBlocking(async () => {

        const sanitizedQuery = query.replace(/[^a-zA-Z0-9\s]/g, '').trim()

        const client = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!,
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

        if (pages.length === 0) {
            results.done(<div>Found no related documents</div>)
            systemMessage.done(<SystemMessage>Found no related documents</SystemMessage>)
            aiState.done({
                ...aiState.get(),
                messages: [
                    ...aiState.get().messages.slice(0, -1),
                    {
                        id: nanoid(),
                        role: 'function',
                        name: 'vecSearch',
                        content: JSON.stringify({
                            query,
                            status: 'completed'
                        })
                    },
                    {
                        id: nanoid(),
                        role: 'system',
                        content: `[User has searched for vectors, system did not find any related documents]`
                    }
                ]
            })
            return
        }

        const corpus = pages
            .map(
                (page: any) =>
                    `${page.pageContent} ${page.metadata.source ? page.metadata.source : ''}`
            )
            .join(' ')

        results.update(
            <div className="inline-flex items-start gap-1 md:items-center">
                {spinner}
                <p className="mb-2">Searching for documents...</p>
                <p className="mb-2">Corpus: {corpus}</p>
            </div>
        )

        const systemPrompt = {
            role: 'system',
            content: `
        You are a very enthusiastic Supabase representative who loves
        to help people! Given the following documents, answer the question using only that information,
        outputted in markdown format. If you are unsure and the answer 
        is not explicitly written in the documentation, say Sorry, I don't know how to help with that.
    
        Context sections:
        ${corpus}
    
        Question: 
        ${sanitizedQuery}
        
        Answer as markdown (including related code snippets if available):
    `
        }

        // Perform text completion request

        const completionOptions: CreateCompletionRequest = {
            model: 'gpt-4-turbo-preview',
            max_tokens: 512,
            temperature: 0,
            stream: false,
            messages: [{ role: 'user', content: systemPrompt }]
        }

        // const completionResponse = await openai.completions.create(completionOptions)

        // const {
        //   id,
        //   choices: [{ text }],
        // } = completionResponse

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(completionOptions),
        })

        if (!response.ok) {
            const error = await response.json()
            // throw new ApplicationError('Failed to generate completion', error)
            console.log('Failed to generate completion', error)
            results.error(
                <div className="inline-flex items-start gap-1 md:items-center">
                    <p className="mb-2">[Error] Failed to generate completion: {JSON.stringify(error)}</p>
                </div>
            )
        }

        const reply = await response.json()

        results.update(
            <div className="inline-flex items-start gap-1 md:items-center">
                {spinner}
                <p className="mb-2">Searching for documents...</p>
                <p className="mb-2">Corpus: {corpus}</p>
                <p className="mb-2">Reply: {reply}</p>
            </div>
        )

        results.done(
            <div className="inline-flex items-start gap-1 md:items-center">
                {spinner}
                <p className="mb-2">Searching for documents...</p>
                <p className="mb-2">Corpus: {corpus}</p>
                <p className="mb-2">Reply: {reply}</p>
            </div>
        )

        systemMessage.done(
            <SystemMessage>
                Search results for {query} Corpus: {corpus} Reply: {reply}
            </SystemMessage>
        )

        aiState.done({
            ...aiState.get(),
            messages: [
                ...aiState.get().messages.slice(0, -1),
                {
                    id: nanoid(),
                    role: 'function',
                    name: 'vecSearch',
                    content: JSON.stringify({
                        query,
                        corpus,
                        reply,
                        status: 'completed'
                    })
                },
                {
                    id: nanoid(),
                    role: 'system',
                    content: `[The answer on the question ${query} is ${reply}]`
                }
            ]
        })
    })

    return {
        resultsUI: results.value,
        newMessage: {
            id: nanoid(),
            display: systemMessage.value
        }
    }
}

export async function confirmPurchase(symbol: string, price: number, amount: number) {
    'use server'

    const aiState = getMutableAIState<typeof AI>()

    const purchasing = createStreamableUI(
        <div className="inline-flex items-start gap-1 md:items-center">
            {spinner}
            <p className="mb-2">
                Purchasing {amount} ${symbol}...
            </p>
        </div>
    )

    const systemMessage = createStreamableUI(null)

    runAsyncFnWithoutBlocking(async () => {
        await sleep(1000)

        purchasing.update(
            <div className="inline-flex items-start gap-1 md:items-center">
                {spinner}
                <p className="mb-2">
                    Purchasing {amount} ${symbol}... working on it...
                </p>
            </div>
        )

        await sleep(1000)

        purchasing.done(
            <div>
                <p className="mb-2">
                    You have successfully purchased {amount} ${symbol}. Total cost:{' '}
                    {formatNumber(amount * price)}
                </p>
            </div>
        )

        systemMessage.done(
            <SystemMessage>
                You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
                {formatNumber(amount * price)}.
            </SystemMessage>
        )

        aiState.done({
            ...aiState.get(),
            messages: [
                ...aiState.get().messages.slice(0, -1),
                {
                    id: nanoid(),
                    role: 'function',
                    name: 'showStockPurchase',
                    content: JSON.stringify({
                        symbol,
                        price,
                        defaultAmount: amount,
                        status: 'completed'
                    })
                },
                {
                    id: nanoid(),
                    role: 'system',
                    content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${amount * price
                        }]`
                }
            ]
        })
    })

    return {
        purchasingUI: purchasing.value,
        newMessage: {
            id: nanoid(),
            display: systemMessage.value
        }
    }
}