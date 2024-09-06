import { Metadata } from "next"
import { getUser } from "@/app/(auth)/actions"
import { redirect } from "next/navigation"
import { nanoid } from "nanoid"
import { getChat, getMissingKeys } from "@/app/actions"
import { AI } from "@/lib/chat/actions"
import { Chat } from "@/components/chat"
import { getAgentByName } from "@/app/agents/actions"


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Chat'
    }
}

export default async function DefaultChatPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const id = nanoid()
    const missingKeys = await getMissingKeys()

    return (
        <AI initialAIState={{ chatId: id, messages: [] }}>
            <Chat id={id} user={user} missingKeys={missingKeys} />
        </AI>
    )
}