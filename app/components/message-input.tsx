import { useCallback, useEffect, useState } from "react";
import { LuSend } from "react-icons/lu";

import FormInput from "./form-input";
import { AudioRecorder } from "./recorder";
import { ClientMeetingMessage } from "~/types";

const MessageInput = ({
  handleSendMessage,
  shouldFocusInput,
}: {
  shouldFocusInput?: boolean;
  handleSendMessage: (message: Partial<ClientMeetingMessage>) => void;
}) => {
  const [message, setMessage] = useState("");

  const sendMessage = useCallback(async () => {
    if (message.trim() === "") return;

    handleSendMessage({ text: message });
    setMessage("");
  }, [message, handleSendMessage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        sendMessage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [message, sendMessage]);

  return (
    <div className="flex items-end gap-2 bg-slate-50 relative">
      <div className="flex gap-2 grow">
        <AudioRecorder
          onSpeechReceived={(transcript, sender) => {
            console.info("transcript", transcript, sender);
          }}
        />
      </div>

      <FormInput
        containerClassName="shrink"
        className="w-full p-3 rounded-lg"
        id="messageInput"
        placeholder="Type a message..."
        type="textarea"
        value={message}
        onChange={(value) => setMessage(value)}
        shouldFocusInput={shouldFocusInput}
      />

      <div className="flex gap-2 items-center">
        <button
          className="bg-green-300 text-slate-900 sm:h-12 sm:w-12 sm:p-4 p-4 text-lg group rounded-md"
          onClick={sendMessage}
        >
          <LuSend className="group-hover:scale-125 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
