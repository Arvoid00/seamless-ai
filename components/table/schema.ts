import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const documentSchema = z.object({
  name: z.string().optional(),
  metadata: z
    .object({
      hash: z.string().optional(),
      size: z.number().optional(),
      pages: z.number().optional(),
      mimetype: z.string().optional()
    })
    .optional(),
  id: z.number().optional(),
  title: z.string().optional(),
  status: z.string().optional(),
  label: z.string().optional(),
  priority: z.string().optional(),
  source: z.string().optional()
})

export type Document = z.infer<typeof documentSchema>
