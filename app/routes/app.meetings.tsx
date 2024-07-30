import type { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { createMeta } from "~/helpers/create-meta";

export const meta: MetaFunction = () =>
  createMeta(
    "Meetings | Meet Copilot",
    "Configure the settings for Meet Copilot",
  );

export default function Index() {
  return (
    <div className="w-full ">
      <Outlet />
    </div>
  );
}
