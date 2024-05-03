// file: app/api/insert-document/route.ts
import { retryOperation } from '@/lib/utils'
import { NextRequest } from 'next/server'
import { insertDocument } from '@/lib/uploads/actions'

export async function POST(req: NextRequest) {
  const { name, pages, hash, tags, publicUrl, fileName } = await req.json()

  try {
    const { id } = await retryOperation(() =>
      insertDocument({ name, pages, hash, tags, publicUrl, fileName })
    )
    return new Response(JSON.stringify({ success: true, id: id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to insert document: ' + errorMessage
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
