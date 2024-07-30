import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/app/meetings";
  const headers = new Headers();

  if (code) {
    const cookies = parseCookieHeader(request.headers.get("Cookie") ?? "");
    const supabase = createServerClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_PUBLIC_ANON_KEY!,
      {
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
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return redirect(next, { headers });
    }
    console.error("Error exchanging auth code for session", code, error);
  }

  // return the user to an error page with instructions
  return redirect("/auth", { headers });
}
