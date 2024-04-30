import { PageSection } from '@/app/vectorsearch/route'
import { Message } from 'ai'
import { SupabaseTag } from './supabase'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: CustomMessage[]
  sharePath?: string
}

export interface CustomMessage extends Message {
  sections?: PageSection[] | undefined
  tags?: SupabaseTag[]
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  email: string
  password: string
  salt: string
}
