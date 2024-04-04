import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { getMissingKeys } from '../actions'
import { redirect } from 'next/navigation'
import { getUser } from '../(auth)/actions'

export const metadata = {
  title: 'Seamless AI Chatbot'
}

export default async function IndexPage() {
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
