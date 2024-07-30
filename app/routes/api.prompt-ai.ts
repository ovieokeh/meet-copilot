import { ActionFunctionArgs } from "@remix-run/node";

import { promptAIHandler } from "~/controllers/openai-controller";
import { createSBServerClient, getUserCredits } from "~/models/supabase.server";
import { createResponse } from "~/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const promptRequest = await request.json();
  const headers = new Headers();

  const supabase = createSBServerClient(request, headers);
  const supabaseUser = await supabase.auth.getUser();
  if (!promptRequest.openaiApiKey) {
    if (!supabaseUser.data.user?.email) {
      return createResponse({ error: "Unauthorized" }, 401);
    }

    const credits = await getUserCredits({
      email: supabaseUser.data.user.email,
      supabase,
    });

    if (!credits || credits.data?.credits <= 0) {
      return createResponse({ error: "Forbidden" }, 403);
    }

    promptRequest.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  const aiResponse = await promptAIHandler(promptRequest);
  return createResponse(aiResponse);
};
