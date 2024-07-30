import { ActionFunctionArgs } from "@remix-run/node";

import { testopenaiApiKeyHandler } from "~/controllers/openai-controller";
import { createResponse } from "~/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { openaiApiKey } = await request.json();

  const isValid = await testopenaiApiKeyHandler(openaiApiKey);
  return createResponse({
    body: { isValid },
  });
};
