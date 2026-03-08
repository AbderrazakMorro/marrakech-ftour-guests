import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn(
    "Supabase environment variables are not fully set. Please configure SUPABASE_URL and SUPABASE_SERVICE_KEY."
  );
}

let client: SupabaseClient | null = null;

export function getServiceSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error(
      "Supabase environment variables are not set. Please configure SUPABASE_URL and SUPABASE_SERVICE_KEY."
    );
  }
  
  if (!client) {
    client = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false
      }
    });
  }
  return client;
}

// Alias for convenience
export function createClient(): SupabaseClient {
  return getServiceSupabaseClient();
}


