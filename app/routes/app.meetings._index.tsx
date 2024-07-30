import type { MetaFunction } from "@remix-run/node";

import { createMeta } from "~/helpers/create-meta";
import { MeetingsView } from "~/views/shared/meetings-view";

export const meta: MetaFunction = () =>
  createMeta(
    "Meetings | Meet Copilot",
    "Configure the settings for Meet Copilot",
  );

export default function Index() {
  return <MeetingsView />;
}
