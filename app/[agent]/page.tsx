import { Metadata } from "next"
import { getUser } from "../(auth)/actions"
import { redirect } from "next/navigation"
import { nanoid } from "nanoid"
import { getMissingKeys } from "../actions"
import { AI } from "@/lib/chat/actions"
import { Chat } from "@/components/chat"
import { getAgentByName } from "../agents/actions"
import { Badge, badgeStyle } from "@/components/ui/badge"
import CurrentAgent from "@/components/current-agent"


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

    if (!agent) {
        return <div>Failed to retrieve an agent</div>
    }

    return (
        <>
            <CurrentAgent agent={agent} />
            <AI initialAIState={{ chatId: id, messages: [] }}>
                <Chat id={id} user={user} missingKeys={missingKeys} />
            </AI>
        </>
    )
}