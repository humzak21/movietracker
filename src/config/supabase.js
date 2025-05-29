import { createClient } from '@supabase/supabase-js';

// Use proper environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Direct database operations will not work.');
  console.warn('Backend API will be used instead.');
}

// For frontend, we'll primarily use the backend API
// But this client can be used for direct database operations if needed
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default supabase; 