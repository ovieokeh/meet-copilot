import { useEffect, useRef, useState } from "react";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { MdContentCopy } from "react-icons/md";

import { MarkdownText } from "~/components/markdown-text";
import { playSound } from "~/components/play-sound";
import { useAppContext } from "~/contexts/app-context";
import { useMeetingContext } from "~/contexts/meeting-context";
import { ClientMeetingAction, ClientMeetingMessage } from "~/types";

export const MessageList = ({
  messages,
  selectedMessageId,
  onActionClick,
}: {
  messages: ClientMeetingMessage[];
  selectedMessageId?: string;
  onActionClick?: (action: ClientMeetingAction["action"]) => void;
}) => {
  const otherMessageContainerRef = useRef<HTMLDivElement | null>(null);
  const userMessageContainerRef = useRef<HTMLDivElement | null>(null);
  const { uiState, selectMessage, fetchMeetingActionResponse } =
    useMeetingContext();
  const { user, appSettings } = useAppContext();
  const [syncedMessages, setSyncedMessages] = useState<ClientMeetingMessage[]>(
    () => messages,
  );

  const sortedMessages = syncedMessages.sort(
    (a: ClientMeetingMessage, b: ClientMeetingMessage) =>
      new Date(b.createdAt).getTime() > new Date(a.createdAt).getTime()
        ? -1
        : 1,
  );
  const userMessages = sortedMessages.filter(
    (message) => message.sender == user?.id,
  );
  const otherMessages = sortedMessages.filter(
    (message) => message.sender != user?.id,
  );

  useEffect(() => {
    setSyncedMessages(messages);
  }, [messages]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const otherMessageContainer = otherMessageContainerRef.current;
    if (otherMessageContainer && !selectedMessageId) {
      otherMessageContainer.scrollTop = otherMessageContainer.scrollHeight;
    }
  }, [otherMessages, selectedMessageId]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const userMessageContainer = userMessageContainerRef.current;
    if (userMessageContainer && !selectedMessageId) {
      userMessageContainer.scrollTop = userMessageContainer.scrollHeight;
    }
  }, [userMessages, selectedMessageId]);

  const handleMessageClick = async (message: ClientMeetingMessage) => {
    if (appSettings?.isSoundEnabled) {
      playSound("insights-action");
    }
    selectMessage(message.id);
    if (onActionClick) {
      onActionClick("generate-response");
    }
    await fetchMeetingActionResponse("generate-response", message);
  };

  const handleCopyMessage = async (message: ClientMeetingMessage) => {
    navigator.clipboard.writeText(message.text);
    if (appSettings?.isSoundEnabled) {
      playSound("copy-action");
    }
  };

  const renderMessage = (message: ClientMeetingMessage) => {
    return (
      <div key={message.id} className={`relative`}>
        <div
          data-is-message-element={true}
          className={`flex flex-col gap-1 py-1 px-2 leading-8 text-left w-full ${
            selectedMessageId === message.id ? "bg-slate-700 text-slate-50" : ""
          } ${message.sender === user?.id ? "text-right" : "text-left"}`}
        >
          <MarkdownText className="!text-xs" text={message.text} />
          <div
            className={`flex gap-2 text-xs ${
              message.sender === user?.id ? "self-end" : "self-start"
            }`}
          >
            <button
              onClick={() => handleMessageClick(message)}
              className="bg-white hover:bg-slate-400 hover:text-white text-slate-900 px-2 py-1 rounded transition-colors"
              disabled={uiState === "loading-insights"}
            >
              <FaWandMagicSparkles />
            </button>
            <button
              onClick={() => handleCopyMessage(message)}
              className="bg-white hover:bg-slate-400 hover:text-white text-slate-900 px-2 py-1 rounded transition-colors"
            >
              <MdContentCopy />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderedUserMessages = userMessages.map(renderMessage);
  const renderedOtherMessages = otherMessages.map(renderMessage);

  return (
    <div className="flex gap-2 w-full overflow-hidden flex-1 *:py-4 *:px-2">
      <div
        ref={otherMessageContainerRef}
        className="bg-gray-50 flex flex-col gap-1 w-1/2 overflow-y-scroll no-scrollbar"
      >
        {renderedOtherMessages.length ? (
          renderedOtherMessages
        ) : (
          <p className="text-slate-500 px-2 text-sm">
            No messages yet. Click on the "Record Tab Audio" below to start
            listening for meeting speech
          </p>
        )}
      </div>
      <div
        ref={userMessageContainerRef}
        className="bg-slate-100 flex flex-col gap-1 w-1/2 overflow-y-scroll no-scrollbar"
      >
        {renderedUserMessages.length ? (
          renderedUserMessages
        ) : (
          <p className="text-slate-500 px-2 text-sm">
            No messages yet. Click on the "Record Mic Audio" button below to
            start listening for your speech
          </p>
        )}
      </div>
    </div>
  );
};
