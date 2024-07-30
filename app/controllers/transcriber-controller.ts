import { OpenAI, toFile } from "openai";

import { ClientTranscriptionJob, TranscriptionResult } from "../types";

const processAudio = async (
  job: ClientTranscriptionJob,
): Promise<TranscriptionResult> => {
  if (!job.buffer) {
    console.error("processAudio > no buffer found");
    return {
      id: job.meetingId.toString(),
      timestamp: job.timestamp,
      sender: job.sender,
      status: "failed",
    };
  }

  const openai = new OpenAI({
    apiKey: job.openaiApiKey,
  });

  const audioFile = await toFile(job.buffer, `audio-${job.id}.wav`);

  try {
    const transcriptionResponse = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
    });

    const transcript = transcriptionResponse.text;
    return {
      id: job.meetingId.toString(),
      transcript,
      timestamp: job.timestamp,
      sender: job.sender,
      status: "completed",
    };
  } catch (error: any) {
    console.error("Error processing audio", error.message);
    return {
      id: job.meetingId.toString(),
      timestamp: job.timestamp,
      sender: job.sender,
      status: "failed",
    };
  }
};

export async function transcriberHandler({
  audioBuffer,
  openaiApiKey,
  meetingId,
  sender,
}: {
  audioBuffer: ArrayBuffer;
  openaiApiKey: string;
  meetingId: string;
  sender: string;
}): Promise<TranscriptionResult | { error: string; message: string }> {
  if (!openaiApiKey || !meetingId || !sender) {
    return {
      error: "Unauthorized",
      message: !openaiApiKey
        ? "Missing OpenAI API key"
        : !meetingId
          ? "Missing meetingId"
          : "Missing sender",
    };
  }

  const job: ClientTranscriptionJob = {
    id: "1",
    meetingId,
    sender,
    openaiApiKey,
    timestamp: new Date().toISOString(),
    buffer: audioBuffer,
    isLastChunk: true,
    status: "pending",
  };

  const result = await processAudio(job);
  return result;
}
