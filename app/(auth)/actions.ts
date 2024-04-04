// 'use server'

// import { signIn } from '@/auth'
// import { User } from '@/lib/types'
// import { AuthError } from 'next-auth'
// import { z } from 'zod'
// import { kv } from '@vercel/kv'
// import { ResultCode } from '@/lib/utils'

// export async function getUser(email: string) {
//   const user = await kv.hgetall<User>(`user:${email}`)
//   return user
// }

// interface Result {
//   type: string
//   resultCode: ResultCode
// }

// export async function authenticate(
//   _prevState: Result | undefined,
//   formData: FormData
// ): Promise<Result | undefined> {
//   try {
//     const email = formData.get('email')
//     const password = formData.get('password')

//     const parsedCredentials = z
//       .object({
//         email: z.string().email(),
//         password: z.string().min(6)
//       })
//       .safeParse({
//         email,
//         password
//       })

//     if (parsedCredentials.success) {
//       await signIn('credentials', {
//         email,
//         password,
//         redirect: false
//       })

//       return {
//         type: 'success',
//         resultCode: ResultCode.UserLoggedIn
//       }
//     } else {
//       return {
//         type: 'error',
//         resultCode: ResultCode.InvalidCredentials
//       }
//     }
//   } catch (error) {
//     if (error instanceof AuthError) {
//       switch (error.type) {
//         case 'CredentialsSignin':
//           return {
//             type: 'error',
//             resultCode: ResultCode.InvalidCredentials
//           }
//         default:
//           return {
//             type: 'error',
//             resultCode: ResultCode.UnknownError
//           }
//       }
//     }
//   }
// }

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

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
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
