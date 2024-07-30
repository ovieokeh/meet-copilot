import type { MetaFunction } from "@remix-run/node";

import { createMeta } from "~/helpers/create-meta";
import { HomeView } from "~/views/shared/home-view";

export const meta: MetaFunction = () =>
  createMeta(
    "Meet Copilot",
    "Meet Copilot is your AI-powered assistant to help you ace your interviews and meetings",
    "/home-hero.jpg",
  );

export default function Index() {
  return <HomeView />;
}
