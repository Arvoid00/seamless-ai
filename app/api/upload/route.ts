// file: app/api/upload/route.ts
import { uploadFileToSupabase } from '@/app/docs/actions'
import { retryOperation } from '@/lib/utils'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  // const files: File[] = (await req.formData()).getAll('file') as File[]
  const file = (await req.formData()).get('file') as File

  try {
    const { fileName, publicUrl } = await retryOperation(() =>
      uploadFileToSupabase(file)
    )
    return new Response(
      JSON.stringify({
        success: true,
        uploadResult: { fileName, url: publicUrl }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to upload file',
        error: errorMessage
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
