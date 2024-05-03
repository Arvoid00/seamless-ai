import { File } from 'buffer'
import { NextRequest } from 'next/server'
import { uploadFileToSupabase } from '@/app/docs/actions'
import { SelectedTagsProps } from '@/components/drag-drop'
import { retryOperation } from '@/lib/utils'
import {
  extractTextFromPDF,
  insertDocument,
  insertDocumentSections,
  splitText
} from '@/lib/uploads/actions'

// TODO: Rollback sequence if any of the steps fail

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('file')
    const tagsEntry = formData.get('tags')
    const tags = (
      tagsEntry ? JSON.parse(String(tagsEntry)) : {}
    ) as SelectedTagsProps

    for (const file of files) {
      if (!(file instanceof File)) {
        throw new Error('Invalid file type')
      }
      const originalFileName = file.name

      const { fileName, publicUrl } = await retryOperation(() =>
        // @ts-expect-error
        uploadFileToSupabase(file, 'documents')
      )
      const { name, pages, hash, docs } = await retryOperation(() =>
        extractTextFromPDF(publicUrl, fileName)
      )

      const chunks = await retryOperation(() => splitText(docs))

      const { id } = await retryOperation(() =>
        insertDocument({
          name,
          pages,
          hash,
          tags: tags[originalFileName],
          publicUrl,
          fileName
        })
      )

      await retryOperation(() =>
        insertDocumentSections({
          document_id: id,
          chunks,
          source: publicUrl,
          fileName: fileName
        })
      )
    }

    return Response.json({
      success: true,
      message: 'Files uploaded successfully'
    })
  } catch (error) {
    console.error('Error converting PDF to text and storing:', error)
    const errorMessage = error instanceof Error ? error.message : error
    return Response.json({ success: false, message: errorMessage })
  }
}
