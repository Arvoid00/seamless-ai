'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }
  console.log(data)
  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error(error)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error(error)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user?.id)
    .maybeSingle()
    .throwOnError()
  return data
}

export async function getUserProfileWithOrg() {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user?.id)
    .maybeSingle()
    .throwOnError()
  return data
}
