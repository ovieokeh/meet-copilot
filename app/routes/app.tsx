import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import AppLayout from "~/components/app-layout";
import { AppContextProvider } from "~/contexts/app-context";
import { MeetingContextProvider } from "~/contexts/meeting-context";
import { createMeta } from "~/helpers/create-meta";
import { getSession } from "~/session.server";

export const meta: MetaFunction = () =>
  createMeta("Meetings | Meet Copilot", "Meet Copilot meeting view");

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request);

  const googleAccessToken = session.get("googleAccessToken");
  const notionAccessToken = session.get("notionAccessToken");
  const openaiApiKey = session.get("openaiApiKey");

  return {
    googleAccessToken,
    notionAccessToken,
    openaiApiKey,
  };
};

export default function Index() {
  const loaderData = useLoaderData<{
    googleAccessToken?: string;
    notionAccessToken?: string;
    openaiApiKey?: string;
  }>();

  return (
    <AppContextProvider
      existingGoogleAccessToken={loaderData.googleAccessToken}
      existingNotionAccessToken={loaderData.notionAccessToken}
      existingopenaiApiKey={loaderData.openaiApiKey}
    >
      <MeetingContextProvider>
        <AppLayout />
      </MeetingContextProvider>
    </AppContextProvider>
  );
}
