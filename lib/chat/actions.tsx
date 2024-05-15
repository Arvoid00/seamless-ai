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

import { z } from 'zod'
import { EventsSkeleton } from '@/components/stocks/events-skeleton'
import { Events } from '@/components/stocks/events'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Stocks } from '@/components/stocks/stocks'
import { StockSkeleton } from '@/components/stocks/stock-skeleton'
import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { LangGraphMessage } from '@/components/chat-message-types/langgraph-message'
import { MultiAgentMessage } from '@/components/chat-message-types/multi-agent-message'
import { VectorMessage } from '@/components/chat-message-types/vector-message'
import { Chat } from '@/types/types'
import { getUser } from '@/app/(auth)/actions'
import { confirmPurchase, vectorSearch } from './ui-functions'
import { PageSection, VectorResponse } from '@/app/vectorsearch/route'
import { SupabaseAgent, SupabaseTag } from '../../types/supabase'

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import { END, MessageGraph } from "@langchain/langgraph";
import { ToolMessage } from "@langchain/core/messages";
import { Calculator } from "@langchain/community/tools/calculator";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";
import { multiAgentFunction } from './multi-agent'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
})

export async function generateEmbedding(content: string): Promise<number[]> {
  const { data: [{ embedding }] } = await openai.embeddings.create({
    input: content,
    model: 'text-embedding-3-small'
  },
    { timeout: 10000, headers: { 'Connection': 'keep-alive' } })
  return embedding
}

async function getVectorResult(query: string, tags: SupabaseTag[]) {
  let url = `http://localhost:3000/vectorsearch`;

  const body = {
    query,
    tags
  }

  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };

  const response = await fetch(url, options)
  const vectorResponse: VectorResponse = await response.json()
  return vectorResponse
}

async function useLangGraphModel({ content, tags, agent }: { content: string, tags: SupabaseTag[], agent: SupabaseAgent }) {

  const model = new ChatOpenAI({
    temperature: 0,
  }).bind({
    tools: [convertToOpenAITool(new Calculator())],
    tool_choice: "auto",
  });

  const graph = new MessageGraph();

  graph.addNode("oracle", async (state: BaseMessage[]) => {
    return model.invoke(state);
  });

  graph.addNode("calculator", async (state: BaseMessage[]) => {
    const tool = new Calculator();
    const toolCalls = state[state.length - 1].additional_kwargs.tool_calls ?? [];
    const calculatorCall = toolCalls.find(
      (toolCall) => toolCall.function.name === "calculator"
    );
    if (calculatorCall === undefined) {
      throw new Error("No calculator input found.");
    }
    const result = await tool.invoke(
      JSON.parse(calculatorCall.function.arguments)
    );
    return new ToolMessage({
      tool_call_id: calculatorCall.id,
      content: result,
    });
  });

  graph.addEdge("calculator", END);
  graph.setEntryPoint("oracle");

  const router = (state: BaseMessage[]) => {
    const toolCalls = state[state.length - 1].additional_kwargs.tool_calls ?? [];
    if (toolCalls.length) {
      return "calculator";
    } else {
      return "end";
    }
  };

  graph.addConditionalEdges("oracle", router, {
    calculator: "calculator",
    end: END,
  });

  const runnable = graph.compile();

  const res = await runnable.invoke(new HumanMessage(content ?? "What is 1 + 1?"));
  return res;
}

const buildSystemPrompt = (agent: SupabaseAgent | undefined) => {

  let prompt = ""
  prompt += agent?.prompt || '';
  // @ts-expect-error Type 'Json | undefined' is not an array type.
  agent?.functions?.forEach(func => {
    if (func.includes("Document Search")) {
      prompt += "You are also a document search engine. You are allowed to search through documents based on user input. If the user requests a document search, vector search, vec search, or vc, call 'vec_search' to comply with the request.\n"
    }
    if (func.includes("Web Search")) {
      prompt += "You are also a web search engine. You are allowed to search through the web based on user input. If the user does something that looks like a web search or chart creation. call `multiagent` to answer the user question.\n"
    }
  })

  prompt += `If the user asks you to do a math calculation, call \`langgraph\` to answer the user question.
    
  Messages inside [] means that it's a UI element or a user event. For example:
  - "[Price of AAPL = 100]" means that an interface of the stock price of AAPL is shown to the user.
  - "[User has changed the amount of AAPL to 10]" means that the user has changed the amount of AAPL to 10 in the UI.

  If the query contains something in the form of a document search or vector search, call \`vecSearch\` to answer the user question.
  If the query contains something in the form of a multiagent or web search, call \`multiagent\` to answer the user question.
  
  If you are unsure about what to do, you can ask the user for more information or ask the user to clarify their request.
  
  Besides that, you can also chat with users.`

  return prompt
}

async function submitUserMessage({ content, tags, agent }: { content: string, tags: SupabaseTag[], agent: SupabaseAgent }) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  // console.log('User message:', content)
  // console.log('Tags:', tags)
  // console.log('Agent:', agent)

  aiState.update({
    ...aiState.get(),
    agent: agent,
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const ui = render({
    model: 'gpt-3.5-turbo',
    provider: openai,
    initial: <SpinnerMessage />,
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt(agent)
      },
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    functions: {
      langGraph: {
        description:
          'Use langgraph to answer the user question. Use this function to answer user questions based on the user query.',
        parameters: z.object({
          query: z.string().describe('The query to use in langgraph.'),
        }),
        render: async function* ({ query }) {
          yield (
            <BotCard>
              <SpinnerMessage message={`Initializing Langgraph for query: '${query}' `} />
            </BotCard>
          )

          const data = await useLangGraphModel({ content: query, tags, agent })

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'langgraph',
                content: JSON.stringify({ data }),
                tags: tags
              }
            ]
          })

          return (
            <BotCard>
              <LangGraphMessage data={data} tags={tags} agent={agent} />
            </BotCard>
          )
        }
      },
      multiagent: {
        description:
          'Use multiagent to answer the user question. Use this function to answer user questions based on the user query.',
        parameters: z.object({
          query: z.string().describe('The query to use in multiagent.'),
        }),
        render: async function* ({ query }) {
          yield (
            <BotCard>
              <SpinnerMessage message={`Initializing Multiagent for query: '${query}' `} />
            </BotCard>
          )

          const streamResults = multiAgentFunction({ content: query, tags, agent })
          for await (const chunk of streamResults) {
            yield (
              <BotCard>
                <BotMessage content={chunk} />
              </BotCard>
            )
          }

          // const data = await multiAgentFunction({ content: query, tags, agent })

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'multiagent',
                content: JSON.stringify({ streamResults }),
                tags: tags
              }
            ]
          })

          return (
            <BotCard>
              <MultiAgentMessage data={streamResults} tags={tags} agent={agent} />
            </BotCard>
          )
        }
      },
      vecSearch: {
        description:
          'Do a vector search. Search for a vector or document based on user input. Use this function to search for information based on the user query.',
        parameters: z.object({
          query: z.string().describe('The query to search for.'),
        }),
        render: async function* ({ query }) {
          yield (
            <BotCard>
              <SpinnerMessage message={`Doing a VectorSearch for query: '${query}' `} />
            </BotCard>
          )

          const { data, usage, sections } = await getVectorResult(query, tags)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'vecSearch',
                content: JSON.stringify({ data, usage }),
                sections: sections,
                tags: tags
              }
            ]
          })

          return (
            <BotCard>
              <VectorMessage data={data} usage={usage} sections={sections} tags={tags} agent={agent} />
            </BotCard>
          )
        }
      },
      listStocks: {
        description: 'List three imaginary stocks that are trending.',
        parameters: z.object({
          stocks: z.array(
            z.object({
              symbol: z.string().describe('The symbol of the stock'),
              price: z.number().describe('The price of the stock'),
              delta: z.number().describe('The change in price of the stock')
            })
          )
        }),
        render: async function* ({ stocks }) {
          yield (
            <BotCard>
              <StocksSkeleton />
            </BotCard>
          )

          await sleep(1000)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'listStocks',
                content: JSON.stringify(stocks)
              }
            ]
          })

          return (
            <BotCard>
              <Stocks props={stocks} />
            </BotCard>
          )
        }
      },
      showStockPrice: {
        description:
          'Get the current stock price of a given stock or currency. Use this to show the price to the user.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          delta: z.number().describe('The change in price of the stock')
        }),
        render: async function* ({ symbol, price, delta }) {
          yield (
            <BotCard>
              <StockSkeleton />
            </BotCard>
          )

          await sleep(1000)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'showStockPrice',
                content: JSON.stringify({ symbol, price, delta })
              }
            ]
          })

          return (
            <BotCard>
              <Stock props={{ symbol, price, delta }} />
            </BotCard>
          )
        }
      },
      showStockPurchase: {
        description:
          'Show price and the UI to purchase a stock or currency. Use this if the user wants to purchase a stock or currency.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          numberOfShares: z
            .number()
            .describe(
              'The **number of shares** for a stock or currency to purchase. Can be optional if the user did not specify it.'
            )
        }),
        render: async function* ({ symbol, price, numberOfShares = 100 }) {
          if (numberOfShares <= 0 || numberOfShares > 1000) {
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'system',
                  content: `[User has selected an invalid amount]`
                }
              ]
            })

            return <BotMessage content={'Invalid amount'} />
          }

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'showStockPurchase',
                content: JSON.stringify({
                  symbol,
                  price,
                  numberOfShares
                })
              }
            ]
          })

          return (
            <BotCard>
              <Purchase
                props={{
                  numberOfShares,
                  symbol,
                  price: +price,
                  status: 'requires_action'
                }}
              />
            </BotCard>
          )
        }
      },
      getEvents: {
        description:
          'List funny imaginary events between user highlighted dates that describe stock activity.',
        parameters: z.object({
          events: z.array(
            z.object({
              date: z
                .string()
                .describe('The date of the event, in ISO-8601 format'),
              headline: z.string().describe('The headline of the event'),
              description: z.string().describe('The description of the event')
            })
          )
        }),
        render: async function* ({ events }) {
          yield (
            <BotCard>
              <EventsSkeleton />
            </BotCard>
          )

          await sleep(1000)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'getEvents',
                content: JSON.stringify(events)
              }
            ]
          })

          return (
            <BotCard>
              <Events props={events} />
            </BotCard>
          )
        }
      }
    }
  })

  return {
    id: nanoid(),
    display: ui
  }
}

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  id: string
  name?: string
  tags?: SupabaseTag[]
  sections?: PageSection[] | undefined
}

export type AIState = {
  chatId: string
  messages: Message[]
  agent?: SupabaseAgent
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmPurchase,
    // vectorSearch,
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  unstable_onGetUIState: async () => {
    'use server'

    const user = await getUser()
    if (!user) return

    const aiState = getAIState()

    if (aiState) {
      const uiState = getUIStateFromAIState(aiState)
      return uiState
    }
  },
  unstable_onSetAIState: async ({ state, done }) => {
    'use server'

    const user = await getUser()
    if (!user) return

    const { chatId, messages, agent } = state

    const createdAt = new Date()
    const userId = user.id
    const path = `${agent?.name ? agent.name + "/" : ''}chat/${chatId}`
    const title = messages[0].content?.substring(0, 100) || 'Untitled'

    const chat: Chat = {
      id: chatId,
      title,
      userId,
      createdAt,
      messages,
      path,
      agent,
    }

    await saveChat(chat)
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'function' ? (
          message.name === 'listStocks' ? (
            <BotCard>
              <Stocks props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showStockPrice' ? (
            <BotCard>
              <Stock props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showStockPurchase' ? (
            <BotCard>
              <Purchase props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'getEvents' ? (
            <BotCard>
              <Events props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'vecSearch' ? (
            <BotCard>
              <VectorMessage data={JSON.parse(message.content).data} usage={JSON.parse(message.content).usage} sections={message.sections} tags={message.tags} agent={aiState.agent} />
            </BotCard>
          ) : message.name === 'langgraph' ? (
            <BotCard>
              <LangGraphMessage data={JSON.parse(message.content).data} tags={message.tags} agent={aiState.agent} />
            </BotCard>
          ) : message.name === 'multiagent' ? (
            <BotCard>
              <MultiAgentMessage data={JSON.parse(message.content).data} tags={message.tags} agent={aiState.agent} />
            </BotCard>
          ) : `No specific Component found for function '${message.name}'`
        ) : message.role === 'user' ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
