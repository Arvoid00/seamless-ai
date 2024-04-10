import { Sourcesbar } from '@/components/sourcesbar'
import { ChatHistory } from '@/components/chat-history'
import { getUser } from '@/app/(auth)/actions'

export async function SourcesbarDesktop() {
    const user = await getUser()
    if (!user?.id) return null

    return (
        <Sourcesbar className="peer absolute inset-x-full inset-y-0 z-30 hidden translate-x-0 border-l bg-muted duration-300 ease-in-out data-[state=open]:-translate-x-full lg:flex lg:w-[250px] xl:w-[300px]">
            {/* @ts-ignore */}
            {/* <ChatHistory userId={user?.id} /> */}
        </Sourcesbar>
    )
}
