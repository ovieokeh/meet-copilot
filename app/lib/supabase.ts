import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./supabase-types";

export const createSBClientClient = (
  supabaseUrl?: string,
  publicAnonKey?: string,
) => {
  if (!supabaseUrl || !publicAnonKey) {
    return null;
  }
  return createBrowserClient<Database>(supabaseUrl, publicAnonKey);
};
