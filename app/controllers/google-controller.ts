import { randomBytes } from "crypto";

import { google } from "googleapis";

export const getOauth2Client = (
  accessToken?: string,
  refreshToken?: string,
) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  if (accessToken && refreshToken) {
    client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
  return client;
};

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const state = randomBytes(32).toString("hex");

export const generateAuthUrl = () => {
  const oauth2Client = getOauth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state,
  });
};
