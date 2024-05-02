// file: app/api/extract-text/route.ts
import { retryOperation } from '@/lib/utils'
import { NextRequest } from 'next/server'
import { extractTextFromPDF } from '../embed/route'

export async function POST(req: NextRequest) {
  const { url, fileName } = await req.json()

  try {
    const { name, pages, hash, docs } = await retryOperation(() =>
      extractTextFromPDF(url, fileName)
    )
    return new Response(
      JSON.stringify({ success: true, data: { name, pages, hash, docs } }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to extract text',
        error: errorMessage
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
