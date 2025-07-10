// File: lib/supabase.ts

import { createClient } from '@supabase/supabase-js'

// These are the public keys, safe to be used in the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)