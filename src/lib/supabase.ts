import { createClient } from '@supabase/supabase-js'
import {
  LAW_APPROVED_SUPABASE_URL,
  assertLawPublicBackend,
} from '../config/law-public-backend'

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? LAW_APPROVED_SUPABASE_URL
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ''

assertLawPublicBackend(configuredUrl, publishableKey)

export const supabase = createClient(configuredUrl, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
