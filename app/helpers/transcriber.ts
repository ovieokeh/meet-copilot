import {
  ClientTranscriptionJob,
  TranscriptionFailResult,
  TranscriptionResult,
} from "~/types";

export const fetchTranscription = async (job: ClientTranscriptionJob) => {
  const defaultError = {
    id: job.meetingId.toString(),
    timestamp: job.timestamp,
    sender: job.sender,
    status: "failed",
  } as TranscriptionFailResult;

  if (!job.buffer) {
    console.error("processAudio > no io");
    return defaultError;
  }

  try {
    // send buffer in body to backend endpoint
    const response = await fetch(
      `/api/transcribe/${job.meetingId}/${job.sender}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: job.buffer,
      },
    );

    const transcriptionResponse = await response.json();
    return transcriptionResponse as TranscriptionResult;
  } catch (error: any) {
    console.error("Error processing audio", error.message);
    return defaultError;
  }
};
