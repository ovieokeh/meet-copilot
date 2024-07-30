import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

import { getDefaultPrompt } from "~/context-utils";
import { ClientMeetingMessage } from "~/types";

interface PromptAIParams {
  openaiApiKey: string;
  meetingId: string;
  message: string;
  history: ClientMeetingMessage[];
  prompt: string;
}

export const promptAIHandler = async (promptParams: PromptAIParams) => {
  if (
    !promptParams.openaiApiKey ||
    !promptParams.message ||
    !promptParams.prompt
  ) {
    return;
  }

  const openai = new OpenAI({
    apiKey: promptParams.openaiApiKey,
  });

  const latestMessage = promptParams.message;
  const messages = [
    {
      role: "system",
      content: `
      Meeting message history: ${promptParams.history
        .map((t) => `${t.createdAt}: ${t.text}`)
        .join("\n")}
        `,
    },
  ] as ChatCompletionMessageParam[];

  messages.push(
    {
      role: "user",
      content: promptParams.prompt || getDefaultPrompt(),
    },
    {
      role: "user",
      content: latestMessage,
    },
  );

  try {
    const context = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
    });

    const promptResponse = context.choices[0].message.content;
    if (!promptResponse) {
      return;
    }

    return promptResponse;
  } catch (error) {
    console.error("Error handling providing context", error);
    return { error: "Internal Server Error" };
  }
};

export const testopenaiApiKeyHandler = async (openaiApiKey: string) => {
  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    const openAIResponse = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        { role: "system", content: getDefaultPrompt() },
        {
          role: "user",
          content: "Test message",
        },
      ],
    });

    const isValid = !!openAIResponse.choices[0].message.content;
    return isValid;
  } catch (error) {
    console.error("Error testing OpenAI API key", error);
  }

  return false;
};
