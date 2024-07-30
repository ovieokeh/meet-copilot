import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

import {
  getDefaultPrompt,
  getFunctionCheckerPrompt,
  getFunctionsPrompt,
} from "~/context-utils";

import AI_FUNCTIONS_CONTROLLER from "./ai-functions-controller";
import { ClientMeetingMessage } from "~/types";

interface ResponseData {
  meetingId: string;
  message: ClientMeetingMessage;
  history: ClientMeetingMessage[];
  meetingPrompt?: string;
  context?: string;
}

const prepareRequest = (data: ResponseData) => {
  const latestMessage = data.message;

  const messages = [] as ChatCompletionMessageParam[];

  messages.push({
    role: "system",
    content: `${getDefaultPrompt()}
    ${data.meetingPrompt ? `Your meeting prompt: ${data.meetingPrompt}` : ""}`,
  });

  if (data.context) {
    messages.push({
      role: "system",
      content: `You have been supplied with the following data for extra context for your response: ${data.context}`,
    });
  }

  if (data.history.length) {
    messages.push({
      role: "system",
      content: `Your message history: ${data.history
        .map((t) => `${t.createdAt}: ${t.text}`)
        .join("\n")}`,
    });
  }

  messages.push({
    role: "user",
    content: latestMessage.text,
  });

  return { messages, latestMessage };
};

const handlePromptLoop = async (data: ResponseData, openai: OpenAI) => {
  const { latestMessage } = prepareRequest(data);

  const functionsMessages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
      ${getFunctionCheckerPrompt()}
      ${getFunctionsPrompt()}

      Your message history: ${data.history
        .map((t) => `${t.createdAt}: ${t.text}`)
        .join("\n")}
      `,
    },
    {
      role: "user",
      content: `Categorise this message: ${latestMessage.text}`,
    },
  ];

  const functionResponse = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    messages: functionsMessages,
  });

  let functionResponseMessage = functionResponse.choices[0].message.content;
  if (functionResponseMessage?.includes("```json\n")) {
    functionResponseMessage = functionResponseMessage.replace("```json\n", "");
    functionResponseMessage = functionResponseMessage.replace("```", "");
  }

  let parsedFunctionResponse: {
    function?: "notion";
    action?: "search";
    parameters?: { query: string };
  } = {};
  try {
    parsedFunctionResponse = JSON.parse(functionResponseMessage ?? "{}");
  } catch (error) {
    console.error("Error parsing function response", error);
  }

  return parsedFunctionResponse;
};

export async function streamResponse({
  openaiApiKey,
  notionAccessToken,
  data,
}: {
  openaiApiKey: string;
  notionAccessToken?: string;
  data: ResponseData;
}) {
  if (!openaiApiKey || !data.message) return;
  const openai = new OpenAI({
    apiKey: openaiApiKey,
  });

  const { messages, latestMessage } = prepareRequest(data);

  const functionResponse = await handlePromptLoop(data, openai);
  if (functionResponse?.function) {
    const functionFunction = AI_FUNCTIONS_CONTROLLER[functionResponse.function];
    if (
      !functionFunction ||
      !functionResponse.action ||
      !functionResponse.parameters
    ) {
      return;
    }

    if (
      functionFunction &&
      functionResponse.action &&
      functionResponse.parameters
    ) {
      const functionInvocation = functionFunction[functionResponse.action];
      if (functionInvocation) {
        const functionResult = await functionInvocation({
          ...functionResponse.parameters,
          accessToken: notionAccessToken ?? "",
        }).catch((error) => {
          console.error("Error handling function action", error);
        });

        messages.push({
          role: "assistant",
          content: `I used a function
          name: ${functionResponse.function}
          arguments: ${JSON.stringify(
            functionResponse.parameters,
          )} to fetch the following results in response to the message
          response:${JSON.stringify(functionResult)}
          `,
        });
      }
    }
  }

  try {
    const responseStream = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages,
      stream: true,
    });

    for await (const response of responseStream) {
      const isLastChunk = response.choices[0].finish_reason === "stop";

      const output = {
        isLastChunk,
        meetingId: data.meetingId,
        originalMessageId: latestMessage.id,
        message: response.choices[0].delta.content ?? "",
        functionUse: {
          function: functionResponse.function,
          action: functionResponse.action,
          parameters: functionResponse.parameters,
        },
        createdAt: data.message.createdAt,
      };

      return output;
    }
  } catch (error) {
    console.error("Error handling providing context", error);
  } finally {
    // do something
  }

  return null;
}
