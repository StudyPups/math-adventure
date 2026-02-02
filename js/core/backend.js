// js/core/backend.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://nsbugyglzltyvjuxbwrl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7d4nseAjxtgRFgybl_aMXQ_RInGS_DQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
