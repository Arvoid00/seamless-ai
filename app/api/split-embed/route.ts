// file: app/api/split-embed/route.ts
import { NextRequest } from 'next/server'
import { splitText } from '@/lib/uploads/actions'
import { retryOperation } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const { docs } = await req.json()

  try {
    const chunks = await retryOperation(() => splitText(docs))
    return new Response(JSON.stringify({ success: true, chunks }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to split and embed text : ' + errorMessage
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
