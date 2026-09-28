import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Publishable keys are intended for browsers. Database access is still restricted by RLS.
export const supabase = url && key ? createClient(url, key) : null
