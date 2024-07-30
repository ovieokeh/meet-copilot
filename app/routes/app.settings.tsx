import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { createMeta } from "~/helpers/create-meta";
import { SettingsView } from "~/views/shared/settings-view";

export const meta: MetaFunction = () =>
  createMeta(
    "Settings | Meet Copilot",
    "Configure the settings for Meet Copilot",
  );

export const loader: LoaderFunction = async () => {
  const notionAuthUrl = process.env.NOTION_OAUTH_AUTHORIZATION_URL;
  return { notionAuthUrl };
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <SettingsView
      data={{
        notionAuthUrl: loaderData.notionAuthUrl,
      }}
    />
  );
}
