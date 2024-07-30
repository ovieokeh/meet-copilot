import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { Database } from "~/lib/supabase-types";

config();

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PUBLIC_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLIC_ANON_KEY;

export const createSBServerClient = (request: Request, headers: Headers) => {
  if (!SUPABASE_URL || !PUBLIC_ANON_KEY) {
    throw new Error("Missing environment variables for Supabaase");
  }

  return createServerClient<Database>(SUPABASE_URL, PUBLIC_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          headers.append(
            "Set-Cookie",
            serializeCookieHeader(name, value, options),
          ),
        );
      },
    },
  });
};

export const getUserCredits = async ({
  email,
  supabase,
}: {
  email: string;
  supabase: SupabaseClient;
}) =>
  await supabase
    .from("UserSettings")
    .select("credits")
    .eq("user_email", email)
    .single();
