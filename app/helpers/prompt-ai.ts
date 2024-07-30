import { ClientMeetingMessage } from "~/types";

export const promptAI = async ({
  meetingId,
  message,
  history,
  prompt,
  enrichment,
  openaiApiKey,
}: {
  meetingId: string;
  message: string;
  history: ClientMeetingMessage[];
  prompt: string;
  enrichment: string;
  openaiApiKey: string;
}) => {
  const reponse = await fetch("/api/prompt-ai", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      meetingId,
      message,
      history,
      prompt,
      enrichment,
      openaiApiKey,
    }),
  }).then((res) => res.json());

  return reponse;
};
