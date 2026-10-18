import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yxqvmtepxwjxujxwbqfx.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cHNIrq0y1w00GDL8tnzFTw_UklU06t0'

export const supabase = createClient(supabaseUrl, supabaseKey)
