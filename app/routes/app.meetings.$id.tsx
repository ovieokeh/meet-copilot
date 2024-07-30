import type { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";

import { createMeta } from "~/helpers/create-meta";
import { MeetingView } from "~/views/shared/meeting-view";

export const meta: MetaFunction = () =>
  createMeta("Meeting | Meet Copilot", "Meet Copilot meeting view");

/**
 * Potential fix for the issue of transcriptions not working when tab is not focused
 *
 * - Play a silent never-ending audio file in the background
 * - This will keep the tab active and allow the transcription to work
 */
export default function Index() {
  const params = useParams();

  const meetingId = params.id;

  if (!meetingId) {
    return <div>Meeting not found</div>;
  }

  return <MeetingView meetingId={meetingId} />;
}
