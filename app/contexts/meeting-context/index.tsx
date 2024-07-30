import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { createToast } from "vercel-toast";

import { playSound } from "~/components/play-sound";
import { AI_ACTION_MESSAGE_MAP } from "~/context-utils";
import { useAppContext } from "~/contexts/app-context";
import { useClientDatabaseContext } from "~/contexts/client-database-context";
import { promptAI } from "~/helpers/prompt-ai";
import {
  ClientMeetingAction,
  ClientMeetingMessage,
  ClientMeetingUIState,
  MeetingMessageTypeEnum,
} from "~/types";
import { useSupabase } from "../supabase-context";

interface MeetingContextType {
  messages: ClientMeetingMessage[];
  selectedMessage: ClientMeetingMessage | null;
  uiState: ClientMeetingUIState;
  updateMessages: (messages: ClientMeetingMessage[]) => void;
  selectMessage: (id: string | undefined) => void;
  addMessage: (
    data: Partial<ClientMeetingMessage>,
  ) => Promise<ClientMeetingMessage | void>;
  putMessage: (data: Partial<ClientMeetingMessage>) => Promise<string | void>;
  fetchMeetingActionResponse: (
    action: ClientMeetingAction["action"],
    message?: ClientMeetingMessage,
  ) => Promise<void>;
}

export const MeetingContext = createContext<MeetingContextType>({
  messages: [],
  selectedMessage: null,
  uiState: "loading-messages",
  updateMessages: () => {},
  selectMessage: () => {},
  addMessage: async () => {},
  putMessage: async () => {},
  fetchMeetingActionResponse: async () => {},
});

const LOOKBACK_LIMIT = 50;

export function MeetingContextProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ClientMeetingMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<
    string | undefined
  >();
  const [uiState, setUiState] =
    useState<ClientMeetingUIState>("loading-messages");
  const appContext = useAppContext();
  const { database } = useClientDatabaseContext();
  const supabase = useSupabase();

  const params = useParams();
  const meetingId = params.id;

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedMessageId) || null,
    [selectedMessageId, messages],
  );

  const messageHistory = useMemo(
    () =>
      messages.length > LOOKBACK_LIMIT
        ? messages.slice(messages.length - LOOKBACK_LIMIT)
        : messages,
    [messages],
  );

  const previousSummary = "";
  const MEETING_MODE_RESPONSE_PROMPT = `The user is in a meeting and needs help with the following:
  - Your response should be relevant to the discussion and should be insightful
  - Try to notice any patterns or action items in the conversation

  ${
    previousSummary
      ? `
  ---
  **Previous summary**: ${previousSummary}
  ---
  `
      : ""
  }
  `;

  const fetchMessages = useCallback(async () => {
    if (!meetingId || !database) return;

    const savedMessages: ClientMeetingMessage[] = await database.listObjects({
      store: "meeting-messages",
      index: "meetingId",
      value: meetingId.toString(),
    });

    savedMessages.sort(
      (a: ClientMeetingMessage, b: ClientMeetingMessage) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setMessages(savedMessages ?? []);
  }, [database, meetingId]);

  // Fetch messages on load
  useEffect(() => {
    fetchMessages().then(() => {
      setUiState("idle");
    });
  }, [meetingId, appContext.user?.id, fetchMessages]);

  const updateMessages = (newMessages: ClientMeetingMessage[]) => {
    setMessages((prev) => [...prev, ...newMessages]);
  };

  const addMessage = useCallback(
    async (data: Partial<ClientMeetingMessage>) => {
      if (!database || !appContext.user || !meetingId || !data.text?.trim())
        return;

      const createValue: Partial<ClientMeetingMessage> = {
        ...data,
        userId: appContext.user.id,
        meetingId,
        enrichment: "",
      };

      const createdId = await database.createObject<string>({
        store: "meeting-messages",
        object: createValue,
      });

      if (!createdId) {
        return;
      }

      const createdMessage: ClientMeetingMessage = await database.getObject({
        store: "meeting-messages",
        key: createdId,
      });
      const newMessageObject = { ...createdMessage, id: createdId };

      updateMessages([newMessageObject]);
      return newMessageObject;
    },
    [database, appContext.user, meetingId],
  );

  const putMessage = useCallback(
    async (data: Partial<ClientMeetingMessage>) => {
      if (!database || !data.id) return;

      const updatedId = await database.putObject<string>({
        store: "meeting-messages",
        value: data,
      });

      return updatedId;
    },
    [database],
  );

  const fetchMeetingActionResponse = async (
    action: ClientMeetingAction["action"],
    message?: ClientMeetingMessage,
  ) => {
    if (
      !meetingId ||
      (!appContext.appSettings?.openaiApiKey && !supabase.credits)
    )
      return;

    try {
      setUiState("loading-insights");

      const meeting = appContext.selectedMeeting;

      const response = await promptAI({
        meetingId,
        message: message ? message.text : AI_ACTION_MESSAGE_MAP[action],
        history: messageHistory,
        prompt: meeting?.actionsPrompt ?? MEETING_MODE_RESPONSE_PROMPT,
        enrichment: "",
        openaiApiKey: appContext.appSettings?.openaiApiKey,
      });

      if (!response) return;

      await addMessage({
        text: response,
        sender: "system",
        createdAt: new Date(),
        status: "DELIVERED",
        type:
          action === "generate-response"
            ? MeetingMessageTypeEnum.ACTION_RESPONSE
            : action === "generate-question"
              ? MeetingMessageTypeEnum.ACTION_QUESTION
              : MeetingMessageTypeEnum.ACTION_SUMMARY,
      });
    } catch (error) {
      createToast("An error occurred. Please try again", {
        type: "error",
        timeout: 2000,
      });
    } finally {
      setUiState("idle");
      setSelectedMessageId(undefined);

      if (appContext.appSettings?.isSoundEnabled) {
        playSound("insights-action");
      }
    }
  };

  const contextValue = {
    uiState,
    messages,
    selectedMessage,
    selectMessage: setSelectedMessageId,
    updateMessages,
    addMessage,
    putMessage,
    fetchMeetingActionResponse,
  };

  return (
    <MeetingContext.Provider value={contextValue}>
      {children}
    </MeetingContext.Provider>
  );
}

export const useMeetingContext = (): MeetingContextType => {
  return useContext(MeetingContext);
};
