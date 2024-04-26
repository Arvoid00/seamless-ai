import { Metadata } from "next"
import { getUser } from "../(auth)/actions"
import { redirect } from "next/navigation"
import { nanoid } from "nanoid"
import { getMissingKeys } from "../actions"
import { AI } from "@/lib/chat/actions"
import { Chat } from "@/components/chat"
import { getAgentByName } from "../agents/actions"

export interface AgentPageProps {
    params: {
        agent: string
    }
}

export async function generateMetadata({
    params
}: AgentPageProps): Promise<Metadata> {
    return {
        title: params.agent?.toString().slice(0, 50) ?? 'Default'
    }
}

export default async function AgentPage({ params }: AgentPageProps) {

    const user = await getUser()
    if (!user) redirect('/login')

    const id = nanoid()
    const missingKeys = await getMissingKeys()

    if (!params.agent) {
        return <div>Missing agent</div>
    }

    const { data: agent, error } = await getAgentByName(params.agent)
    if (!agent || error) redirect('/default')
    console.log(agent.name, params.agent)

    return (
        <AI initialAIState={{ chatId: id, messages: [], agent: agent }}>
            <Chat id={id} user={user} missingKeys={missingKeys} />
        </AI>
    )
}