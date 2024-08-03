import { ActionFunctionArgs } from "@remix-run/node";

import { transcriberHandler } from "~/controllers/transcriber-controller";
import { createSBServerClient } from "~/models/supabase.server";
import { getSession } from "~/session.server";
import { createResponse } from "~/utils";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const meetingId = params.meetingId;
  const sender = params.sender;
  const { headers } = request;
  const supabase = createSBServerClient(request, headers);

  const session = await getSession(request);
  if (!session || !sender) {
    return createResponse({
      status: 401,
      body: { error: "Unauthorized" },
    });
  }

  let openaiApiKey = session.get("openaiApiKey");
  const supabaseUser = await supabase.auth.getUser();
  const supbaseUserEmail = supabaseUser.data.user?.email;
  const userCredits = supbaseUserEmail
    ? await supabase
        .from("UserSettings")
        .select("credits")
        .eq("user_email", supbaseUserEmail)
        .single()
    : null;
  const credits = userCredits?.data?.credits || 0;
  const hasCredits = credits ? credits > 0 : false;

  if (!openaiApiKey) {
    if (!hasCredits) {
      return createResponse({
        status: 401,
        body: { error: "Unauthorized. Please provide an OpenAI API key" },
      });
    }

    openaiApiKey = process.env.OPENAI_API_KEY;
  }

  const buffer = await request.arrayBuffer();

  const promises = [
    supabase
      .from("UserSettings")
      .update({ credits: credits - 1 })
      .eq("user_email", supbaseUserEmail!),
    transcriberHandler({
      audioBuffer: buffer,
      openaiApiKey,
      meetingId: meetingId!,
      sender: sender!,
    }),
  ];

  const [_, transcription] = await Promise.allSettled(promises);

  return transcription.status === "fulfilled"
    ? createResponse(transcription.value)
    : createResponse({
        status: 500,
        body: { error: transcription.reason },
      });
};
