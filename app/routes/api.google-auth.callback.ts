import { LoaderFunctionArgs } from "@remix-run/node";

import { getOauth2Client } from "~/controllers/google-controller";
import { getSession, sessionStorage } from "~/session.server";
import { safeRedirect } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const oauth2Client = getOauth2Client();

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");

  const session = await getSession(request);
  const redirect = session.get("redirect");

  if (error || !code) return safeRedirect("/login");

  const { tokens } = await oauth2Client.getToken(code as string);

  if (tokens.access_token)
    session.set("googleAccessToken", tokens.access_token.toString());
  if (tokens.expiry_date)
    session.set("googleTokenExpiry", tokens.expiry_date.toString());

  throw safeRedirect(redirect ?? "/app/settings", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
};
