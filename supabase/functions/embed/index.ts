// @ts-nocheck

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
  env,
  pipeline
} from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.5.0'

// Configuration for Deno runtime
env.useBrowserCache = false
env.allowLocalModels = false

console.log('Hello from Functions!')

const pipe = await pipeline('feature-extraction', 'Supabase/gte-small')

serve(async req => {
  // Extract input string from JSON body
  const { input } = await req.json()

  // Generate the embedding from the user input
  const output = await pipe(input, {
    pooling: 'mean',
    normalize: true
  })

  // Extract the embedding output
  const embedding = Array.from(output.data)

  // Return the embedding
  return new Response(JSON.stringify({ embedding }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/embed' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
