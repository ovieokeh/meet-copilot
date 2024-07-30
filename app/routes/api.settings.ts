import { ActionFunctionArgs } from "@remix-run/node";

import { testopenaiApiKeyHandler } from "~/controllers/openai-controller";
import { sessionStorage } from "~/session.server";
import { SettingsAction } from "~/types";
import { createResponse } from "~/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const actions: SettingsAction[] = await request.json();

  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionStorage.getSession(cookieHeader);

  for (const action of actions) {
    if (action.action === "delete") {
      session.unset(action.key);
    }

    if (action.action === "update") {
      if (action.key === "openaiApiKey") {
        const isValid = await testopenaiApiKeyHandler(action.value ?? "");
        if (!isValid)
          return createResponse({
            status: "openai-key-invalid",
            message: "Invalid OpenAI API key",
          });
      }

      session.set(action.key, action.value);
    }
  }

  const updatedSession = await sessionStorage.commitSession(session);

  return createResponse(
    {
      status: "ok",
      message: "Settings updated successfully",
    },
    200,
    {
      "Set-Cookie": updatedSession,
    },
  );
};
