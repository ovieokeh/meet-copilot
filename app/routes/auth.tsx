import type { MetaFunction } from "@remix-run/node";

import { createMeta } from "~/helpers/create-meta";
import { AuthView } from "~/views/shared/auth-view";

export const meta: MetaFunction = () =>
  createMeta(
    "Login to your account | Meet Copilot",
    "Meet Copilot auth view",
  );

export default function AuthPage() {
  return (
    <div className="min-h-[85dvh]">
      <AuthView />
    </div>
  );
}
