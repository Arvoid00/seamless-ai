'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { type Chat } from '@/lib/types'
import { createClient } from '@/utils/supabase/server'

export async function getChats(userId?: string | null) {
  if (!userId) return []

  try {
    const supabase = createClient()
    const { data: chats } = await supabase
      .from('chats')
      .select('payload')
      .order('payload->createdAt', { ascending: false })
      .eq('user_id', userId)
      .throwOnError()

    return (chats?.map(entry => entry.payload) as Chat[]) ?? []
  } catch (error) {
    return []
  }
}

export async function getChat(id: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('chats')
    .select('payload')
    .eq('id', id)
    .maybeSingle()

  return (data?.payload as Chat) ?? null
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  try {
    const supabase = createClient()
    await supabase.from('chats').delete().eq('id', id).throwOnError()

    revalidatePath('/')
    return revalidatePath(path)
  } catch (error) {
    return {
      error: 'Unauthorized'
    }
  }
}

export async function clearChats() {
  try {
    const supabase = createClient()
    await supabase.from('chats').delete().throwOnError()
    revalidatePath('/')
    return redirect('/')
  } catch (error) {
    console.log('clear chats error', error)
    return {
      error: 'Unauthorized'
    }
  }
}

export async function getSharedChat(id: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('chats')
    .select('payload')
    .eq('id', id)
    .not('payload->sharePath', 'is', null)
    .maybeSingle()

  return (data?.payload as Chat) ?? null
}

export async function shareChat(chat: Chat) {
  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }
  const supabase = createClient()
  await supabase
    .from('chats')
    .update({ payload: payload as any })
    .eq('id', chat.id)
    .throwOnError()

  return payload
}

export async function saveChat(chat: Chat) {
  const supabase = createClient()
  try {
    await supabase
      .from('chats')
      .upsert([{ id: chat.id, user_id: chat.userId, payload: chat }])
      .throwOnError()
  } catch (error) {
    console.log('save chats error', error)
    return {
      error: 'Failed to save chat'
    }
  }
}

// export async function saveChat(chat: Chat) {
//   const user = await getUser()
//   if (!user) return { error: 'Unauthorized' }

//   if (user) {
//     const pipeline = kv.pipeline()
//     pipeline.hmset(`chat:${chat.id}`, chat)
//     pipeline.zadd(`user:chat:${chat.userId}`, {
//       score: Date.now(),
//       member: `chat:${chat.id}`
//     })
//     await pipeline.exec()
//   } else {
//     return
//   }
// }

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
