// file: app/api/upload/route.ts
import {
  uploadFileToSupabase
  // uploadResumableFileToSupabase
} from '@/app/docs/actions'
import { retryOperation } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const file = (await req.formData()).get('file') as File

  try {
    const { fileName, publicUrl } = await retryOperation(() =>
      uploadFileToSupabase(file, 'documents')
    )
    return NextResponse.json(
      {
        success: true,
        uploadResult: { fileName, url: publicUrl }
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        success: false,
        message: errorMessage
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
