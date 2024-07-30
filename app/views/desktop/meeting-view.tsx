import { twMerge } from "tailwind-merge";

import { ActionPills } from "~/components/action-pills";
import { MessageList } from "~/components/messages-list";
import { ModeStatusView } from "~/components/mode-status";
import { AudioRecorder } from "~/components/recorder";
import { useAppContext } from "~/contexts/app-context";
import { useMeetingContext } from "~/contexts/meeting-context";
import {
  ClientMeetingMessage,
  ClientMeetingUIState,
  OnSpeechReceived,
} from "~/types";
import { MeetingInsightsView } from "~/views/shared/insights-view";

export function MeetingDesktopView({
  uiState,
  messages,
  selectedMessageId,
  onSpeechReceived,
}: {
  messages: ClientMeetingMessage[];
  selectedMessageId?: string;
  onSpeechReceived: OnSpeechReceived;
  uiState: ClientMeetingUIState;
}) {
  const { fetchMeetingActionResponse } = useMeetingContext();
  const appContext = useAppContext();

  return (
    <div className="flex h-[calc(100dvh)] w-full overflow-hidden rounded-tl">
      <div className="flex flex-col w-4/6 grow bg-slate-50">
        <MessageList
          messages={messages}
          selectedMessageId={selectedMessageId}
        />

        <div
          className={twMerge(
            "flex gap-4 p-3 place-self-end mt-auto w-full",
            appContext.currentState.includes("HEALTHY")
              ? ""
              : "opacity-50 pointer-events-none",
          )}
        >
          <AudioRecorder
            className="w-full"
            onSpeechReceived={onSpeechReceived}
          />
        </div>
      </div>

      <div className="flex flex-col grow pb-2 bg-slate-50 w-2/6">
        <div className="flex flex-col grow shrink animate-fadeIn overflow-hidden">
          <div className="w-full flex place-items-end">
            <ModeStatusView />
          </div>

          <div className="flex gap-2 p-2 px-4 w-full overflow-y-scroll flex-1">
            <MeetingInsightsView />
          </div>
        </div>

        <div className="flex gap-2 px-2 place-self-end mt-auto w-full">
          <ActionPills
            uiState={uiState}
            onActionClick={(action) => fetchMeetingActionResponse?.(action)}
          />
        </div>
      </div>
    </div>
  );
}
