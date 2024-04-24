import { clsx, type ClassValue } from 'clsx'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const json = await res.json()
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number
      }
      error.status = res.status
      throw error
    } else {
      throw new Error('An unexpected error occurred')
    }
  }

  return res.json()
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)

export const runAsyncFnWithoutBlocking = (
  fn: (...args: any) => Promise<any>
) => {
  fn()
}

export const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1)

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const getStringFromBuffer = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

export enum ResultCode {
  InvalidCredentials = 'INVALID_CREDENTIALS',
  InvalidSubmission = 'INVALID_SUBMISSION',
  UserAlreadyExists = 'USER_ALREADY_EXISTS',
  UnknownError = 'UNKNOWN_ERROR',
  UserCreated = 'USER_CREATED',
  UserLoggedIn = 'USER_LOGGED_IN'
}

export const getMessageFromCode = (resultCode: string) => {
  switch (resultCode) {
    case ResultCode.InvalidCredentials:
      return 'Invalid credentials!'
    case ResultCode.InvalidSubmission:
      return 'Invalid submission, please try again!'
    case ResultCode.UserAlreadyExists:
      return 'User already exists, please log in!'
    case ResultCode.UserCreated:
      return 'User created, welcome!'
    case ResultCode.UnknownError:
      return 'Something went wrong, please try again!'
    case ResultCode.UserLoggedIn:
      return 'Logged in!'
  }
}

export const sufixes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
export const getBytes = (bytes: any) => {
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (
    (!bytes && '0 Bytes') ||
    (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sufixes[i]
  )
}

export async function fetchWithRetry(
  url: string,
  options = {},
  retries = 3,
  backoff = 300
) {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      // Checks if the status code is outside of 2xx
      if (retries > 0 && [429, 500, 502, 503, 504].includes(response.status)) {
        console.log(`Retrying... ${retries} attempts left`)
        await new Promise(resolve => setTimeout(resolve, backoff))
        return fetchWithRetry(url, options, retries - 1, backoff * 2) // Exponential backoff
      }
      throw new Error(`HTTP Error: ${response.status}`)
    }
    return response
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left, error: ${error}`)
      await new Promise(resolve => setTimeout(resolve, backoff))
      return fetchWithRetry(url, options, retries - 1, backoff * 2)
    }
    throw new Error(`Network error: ${error}`)
  }
}

export async function retryOperation(
  operation: any,
  retries = 3,
  backoff = 300
) {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      console.log(
        `Retry in ${backoff}ms, ${retries} retries left. Error: ${error}`
      )
      await new Promise(resolve => setTimeout(resolve, backoff))
      return retryOperation(operation, retries - 1, backoff * 2)
    }
    throw error // Re-throw the error after final retry fails
  }
}

export async function retrySupabaseOperation(
  operation: any,
  retries = 3,
  backoff = 300
) {
  try {
    const { data, error, status } = await operation()
    if (error && status !== 404) {
      // Usually, 404 is not retryable
      if (retries > 0 && [429, 500, 502, 503, 504].includes(status)) {
        console.log(`Retrying Supabase operation... ${retries} attempts left`)
        await new Promise(resolve => setTimeout(resolve, backoff))
        return retrySupabaseOperation(operation, retries - 1, backoff * 2)
      }
      throw new Error(`Supabase Error: ${error.message}`)
    }
    return { data, error }
  } catch (error) {
    if (retries > 0) {
      console.log(
        `Retrying Supabase operation... ${retries} attempts left, error: ${error}`
      )
      await new Promise(resolve => setTimeout(resolve, backoff))
      return retrySupabaseOperation(operation, retries - 1, backoff * 2)
    }
    throw new Error(`Supabase operation failed: ${error}`)
  }
}
