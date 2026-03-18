// ─────────────────────────────────────────────────────────
// lib/supabase/client.ts — Cliente para el browser
// ─────────────────────────────────────────────────────────
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
