// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

serve(async (req) => {
  try {
    const { chat_id, text } = await req.json();
    if (!chat_id || !text) return new Response('Bad Request', { status: 400 })
    const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!token) return new Response('Missing token', { status: 500 })
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' })
    })
    return new Response(await res.text(), { status: res.status })
  } catch (e) {
    return new Response('Error', { status: 500 })
  }
})


