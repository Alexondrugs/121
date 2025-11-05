import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

// Minimal stub. Real implementation should assemble PDF via pdf-lib and upload to Storage
serve(async (req) => {
  try {
    const { estimate_id } = await req.json()
    if (!estimate_id) return new Response('Bad Request', { status: 400 })
    return new Response(JSON.stringify({ url: null }), { headers: { 'content-type': 'application/json' } })
  } catch (_) {
    return new Response('Error', { status: 500 })
  }
})


