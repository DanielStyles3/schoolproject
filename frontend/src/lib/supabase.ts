import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() ||
  "https://tamfoctishttjfiffizq.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhbWZvY3Rpc2h0dGpmaWZmaXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MTY1MDcsImV4cCI6MjA5NzA5MjUwN30.rYWeg-hRkFM_Bf03T-mXrT1v03ShmdtrnaW_bSladZs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
