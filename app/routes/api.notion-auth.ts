import { LoaderFunctionArgs } from "@remix-run/node";
import axios from "axios";

import { sessionStorage } from "~/session.server";
import { createResponse, safeRedirect } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionStorage.getSession(cookieHeader);
  const redirect = session.get("redirect");

  if (error) return createResponse(error, 400);

  if (!code) {
    if (redirect) return safeRedirect(redirect);
    return createResponse("No code provided", 400);
  }

  const accessTokenResponse = await axios(
    "https://api.notion.com/v1/oauth/token",
    {
      method: "post",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.NOTION_OAUTH_CLIENT_ID}:${process.env.NOTION_OAUTH_CLIENT_SECRET}`,
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
      data: {
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NOTION_OAUTH_REDIRECT,
      },
    },
  )
    .then((response) => response.data)
    .catch((error) => {
      console.error("Failed to authenticate with Notion", error);
      return error.message;
    });

  if (!accessTokenResponse.access_token)
    return createResponse({ error: "Failed to authenticate with Notion" }, 500);

  session.set("notionAccessToken", accessTokenResponse.access_token);
  const updatedSession = await sessionStorage.commitSession(session);

  return safeRedirect(redirect ?? "/", {
    headers: {
      "Set-Cookie": updatedSession,
    },
  });
};
