// file: app/api/insert-sections/route.ts
import { NextRequest } from 'next/server'
import { insertDocumentSections } from '@/lib/uploads/actions'
import { retryOperation } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const { document_id, chunks, publicUrl, fileName } = await req.json()

  try {
    await retryOperation(() =>
      insertDocumentSections({
        document_id,
        chunks,
        source: publicUrl,
        fileName: fileName
      })
    )
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to insert document sections: ' + errorMessage
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
