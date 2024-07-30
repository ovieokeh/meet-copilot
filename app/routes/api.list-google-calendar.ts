import { LoaderFunctionArgs, createCookie } from "@remix-run/node";
import { google } from "googleapis";

import { getOauth2Client } from "~/controllers/google-controller";
import { createResponse, safeRedirect } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // grab accessToken and refreshToken from session cookie
  const cookieHeader = request.headers.get("Cookie");
  const cookie = await createCookie("session").parse(cookieHeader);
  const accessToken = cookie.accessToken;
  const refreshToken = cookie.refreshToken;

  if (!accessToken) return safeRedirect("/login");

  const oauth2Client = getOauth2Client(accessToken, refreshToken);
  await oauth2Client.getAccessToken().catch((error) => {
    console.error(error);
    return safeRedirect("/login");
  });

  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client,
  });
  const calenderResponse = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  return createResponse(calenderResponse.data);
};
