// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tvqjafwmmefwsnhoovbn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cWphZndtbWVmd3NuaG9vdmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjYwMDEsImV4cCI6MjA2NTMwMjAwMX0.GzsSZ1fs_Pvm2MmzLZDZwQoBaZHJgD2U9sgSkLTiuoI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);