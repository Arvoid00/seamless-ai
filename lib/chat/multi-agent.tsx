// CREATE AGENT
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { Tool } from "@langchain/core/tools";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";
import { Runnable } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
// import { ChatGroq } from "@langchain/groq";

// GENERATE CHART

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// AGENT DEFINITION

import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import type { RunnableConfig } from "@langchain/core/runnables";

// TOOL NODE
import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import { ToolMessage } from "@langchain/core/messages";
import { END, StateGraph } from "@langchain/langgraph";
import { SupabaseAgent, SupabaseTag } from "@/types/supabase";
import { createStreamableValue } from "ai/rsc";

// CREATE AGENT

const MAX_RECURSION = 100;

async function createAgent({
    llm,
    tools,
    systemMessage,
}: {
    llm: ChatOpenAI;
    tools: Tool[];
    systemMessage: string;
}): Promise<Runnable> {
    const toolNames = tools.map((tool) => tool.name).join(", ");
    const formattedTools = tools.map((t) => convertToOpenAITool(t));

    let prompt = await ChatPromptTemplate.fromMessages([
        [
            "system",
            "You are a helpful AI assistant, collaborating with other assistants." +
            " Use the provided tools to progress towards answering the question." +
            " If you are unable to fully answer, that's OK, another assistant with different tools " +
            " will help where you left off. Execute what you can to make progress." +
            " If you or any of the other assistants have the final answer or deliverable," +
            " prefix your response with FINAL ANSWER so the team knows to stop." +
            " You have access to the following tools: {tool_names}.\n{system_message}",
        ],
        new MessagesPlaceholder("messages"),
    ]);
    prompt = await prompt.partial({
        system_message: systemMessage,
        tool_names: toolNames,
    })

    return prompt.pipe(llm.bind({ tools: formattedTools }));
}

const isToolMessage = (message) => !!message?.additional_kwargs?.tool_calls;

type globalChartOptionsType = {
    chartData?: any,
    options?: any
}

let globalChartOptions: globalChartOptionsType = { chartData: {}, options: {} };

// GENERATE CHART

const chartTool = new DynamicStructuredTool({
    name: "generate_chart",
    description:
        "Generates a chart from an array of data points using chart.js and displays it for the user.",
    schema: z.object({
        data: z
            .object({
                label: z.string(),
                value: z.number(),
            })
            .array(),
    }),
    func: async ({ data }) => {
        const colorPalette = [
            "#e6194B",
            "#3cb44b",
            "#ffe119",
            "#4363d8",
            "#f58231",
            "#911eb4",
            "#42d4f4",
            "#f032e6",
            "#bfef45",
            "#fabebe",
        ];

        const chartData = {
            labels: data.map((d) => d.label),
            datasets: [
                {
                    label: 'Dataset',
                    data: data.map((d) => d.value),
                    backgroundColor: colorPalette,
                },
            ],
        };

        const options = {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        };
        console.log("chartData", chartData);
        globalChartOptions = { chartData, options }
        return "Chart has been generated and displayed to the user!";

    },
});

const tavilyTool = new TavilySearchResults();

export const multiAgentFunction = async function* ({ content, tags, agent }: { content: string, tags: SupabaseTag[], agent: SupabaseAgent }) {
    console.log("multi-agent function");

    // AGENT DEFINITION

    // Helper function to run a node for a given agent
    async function runAgentNode({ state, agent, name }) {
        let result = await agent.invoke(state);
        // We convert the agent output into a format that is suitable to append to the global state
        if (!isToolMessage(result)) {
            // If the agent is NOT calling a tool, we want it to look like a human message.
            result = new HumanMessage({ ...result, name: name });
        }
        return {
            messages: [result],
            // Since we have a strict workflow, we can track the sender so we know who to pass to next.
            sender: name,
        };
    }

    const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });

    // Research agent and node
    const researchAgent = await createAgent({
        llm,
        tools: [tavilyTool],
        systemMessage:
            "You should provide accurate data for the chart generator to use.",
    });

    async function researchNode(state, config) {
        return runAgentNode({
            state: state,
            agent: researchAgent,
            name: "Researcher",
        });
    }

    // Chart Generator
    const chartAgent = await createAgent({
        llm,
        tools: [chartTool],
        systemMessage: "Any charts you display will be visible by the user.",
    });

    async function chartNode(state) {
        return runAgentNode({
            state: state,
            agent: chartAgent,
            name: "ChartGenerator",
        });
    }

    // Tool node

    const tools = [tavilyTool, chartTool];
    const toolExecutor = new ToolExecutor({ tools });

    // This runs tools in the graph
    async function toolNode(state) {
        // It takes in an agent action and calls that tool and returns the result.
        const messages = state.messages;
        // Based on the continue condition
        // we know the last message involves a function call
        const lastMessage = messages[messages.length - 1];
        const toolCalls = lastMessage.additional_kwargs.tool_calls;
        const toolInputs = toolCalls.map((toolArgs) => {
            let args = JSON.parse(toolArgs.function.arguments);
            // We can pass single-arg inputs by value
            if ("__arg1" in args && args.length === 1) {
                args = args["__arg1"];
            }
            return {
                tool: toolArgs.function.name,
                toolInput: args,
            };
        });

        const toolResponses = await toolExecutor.batch(toolInputs);
        const toolMessages = toolResponses.map((response, idx) => {
            const action = toolInputs[idx];
            const toolName = action.tool;
            return new ToolMessage({
                content: `${toolName} response: ${response}`,
                name: action.tool,
                tool_call_id: toolCalls[idx].id,
            });
        });

        // We return an object, because this will get added to the existing list
        return { messages: toolMessages };
    }

    // Define edge logic

    // Either agent can decide to end
    function router(state) {
        const messages = state.messages;
        const lastMessage = messages[messages.length - 1];
        if (isToolMessage(lastMessage)) {
            // The previous agent is invoking a tool
            return "call_tool";
        }
        if (typeof lastMessage.content === 'string' && lastMessage.content.includes("FINAL ANSWER")) {
            // Any agent decided the work is done
            return "end";
        }
        return "continue";
    }

    // Define state
    interface AgentStateChannels {
        messages: {
            value: (x: BaseMessage[], y: BaseMessage[]) => BaseMessage[];
            default: () => BaseMessage[];
        };
        // The agent node that last performed work
        sender: string;
    }

    // This defines the object that is passed between each node
    // in the graph. We will create different nodes for each agent and tool
    const agentStateChannels: AgentStateChannels = {
        messages: {
            value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
            default: () => [],
        },
        sender: "user",
    };

    // Define graph

    // 1. Create the graph
    const workflow = new StateGraph({
        channels: agentStateChannels,
    });

    // 2. Add the nodes; these will do the work
    workflow.addNode("Researcher", researchNode);
    workflow.addNode("ChartGenerator", chartNode);
    workflow.addNode("call_tool", toolNode);

    // 3. Define the edges. We will define both regular and conditional ones
    // After a worker completes, report to supervisor
    workflow.addConditionalEdges(
        "Researcher",
        router,
        {
            // We will transition to the other agent
            continue: "ChartGenerator",
            call_tool: "call_tool",
            end: END,
        },
    );

    workflow.addConditionalEdges(
        "ChartGenerator",
        router,
        {
            // We will transition to the other agent
            continue: "Researcher",
            call_tool: "call_tool",
            end: END,
        },
    );

    workflow.addConditionalEdges(
        "call_tool",
        // Each agent node updates the 'sender' field
        // the tool calling node does not, meaning
        // this edge will route back to the original agent
        // who invoked the tool
        (x) => x.sender,
        {
            Researcher: "Researcher",
            ChartGenerator: "ChartGenerator",
        },
    );

    workflow.setEntryPoint("Researcher");
    const graph = workflow.compile();

    // Invoke the graph
    let streamOutputs = []
    const streamResults = await graph.stream(
        {
            messages: [
                new HumanMessage({
                    // content:
                    //     "Generate a bar chart of the US gdp over the past 3 years.",
                    content: content,
                }),
            ],
        },
        { recursionLimit: MAX_RECURSION }
    );


    for await (const output of await streamResults) {
        if (!output?.__end__) {
            console.log(output);
            console.log("----");
        }
        const plainOutput = JSON.parse(JSON.stringify(output));
        streamOutputs.push(plainOutput)
        yield plainOutput;
    }


    console.log("streamOutputs", streamOutputs)
    console.log("globalChartOptions", globalChartOptions)

    return { streamOutputs: streamOutputs, globalChartOptions: globalChartOptions };

}

