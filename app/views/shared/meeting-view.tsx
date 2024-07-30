import { useNavigate, Outlet } from "@remix-run/react";
import { useCallback, useEffect } from "react";
import { ClientOnly } from "remix-utils/client-only";

import { PageHeader } from "~/components/page-header";
import { playSound } from "~/components/play-sound";
import { useAppContext } from "~/contexts/app-context";
import { useMeetingContext } from "~/contexts/meeting-context";

import { MeetingDesktopView } from "../desktop/meeting-view";
import { MeetingMobileView } from "../mobile/meeting-view";
import { useSupabase } from "~/contexts/supabase-context";
import { SystemUnhealthyMessage } from "~/components/system-unhealthy-message";
import { twMerge } from "tailwind-merge";
import { RecorderProvider } from "~/contexts/recorder/index.client";
import { ClientMeeting, ClientMeetingMessage } from "~/types";

export function MeetingView({ meetingId }: { meetingId: string }) {
  const { uiState, messages, selectedMessage, addMessage } =
    useMeetingContext();
  const appContext = useAppContext();
  const navigate = useNavigate();

  const isMobile = appContext.isMobile;
  const currentUserId = appContext.user?.id;
  const isSoundEnabled = appContext.appSettings?.isSoundEnabled;
  const supabase = useSupabase();

  // Guard clause to ensure the meeting exists
  useEffect(() => {
    if (!appContext || !appContext.currentState.includes("MEETINGS_FETCHED"))
      return;

    const foundMeeting = meetingId
      ? appContext.meetings?.find(
          (meeting: ClientMeeting) => meeting.id.toString() === meetingId,
        )
      : null;

    if (!foundMeeting) {
      navigate(`/app/meetings`);
    }
  }, [meetingId, appContext, navigate]);

  const handleSendMessage = useCallback(
    async ({ text, sender, createdAt }: Partial<ClientMeetingMessage>) => {
      if (isSoundEnabled) {
        playSound("sent-message");
      }

      await addMessage({
        text,
        sender: sender || currentUserId,
        createdAt: createdAt || new Date(),
        status: "DELIVERED",
      });
    },
    [currentUserId, isSoundEnabled, addMessage],
  );

  const handleSpeechReceived = useCallback(
    (transcript: string, sender: string) => {
      handleSendMessage({ text: transcript, sender });
      if (supabase.fetchCredits) {
        supabase.fetchCredits();
      }
    },
    [handleSendMessage],
  );

  const nonSystemMessages = messages.filter(
    (message) => message.sender !== "system",
  );

  return (
    <ClientOnly>
      {() => (
        <RecorderProvider handleSpeechReceived={handleSpeechReceived}>
          <main className={twMerge(`w-full animate-fadeIn`)}>
            <PageHeader
              title={appContext.selectedMeeting?.title || "Meeting"}
              description="Meet Copilot meeting view"
            />

            <SystemUnhealthyMessage />

            {isMobile ? (
              <MeetingMobileView
                messages={nonSystemMessages}
                selectedMessageId={selectedMessage?.id}
              />
            ) : (
              <MeetingDesktopView
                messages={nonSystemMessages}
                selectedMessageId={selectedMessage?.id}
                uiState={uiState}
                onSpeechReceived={handleSpeechReceived}
              />
            )}

            <Outlet />
          </main>
        </RecorderProvider>
      )}
    </ClientOnly>
  );
}
