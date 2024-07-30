import { useRef, useEffect, useCallback } from "react";

import { fetchTranscription } from "~/helpers/transcriber";
import { concatArrayBuffers, extractWavHeader } from "~/lib/utils";
import {
  AudioRecorderProps,
  ClientTranscriptionJob,
  OnSpeechReceived,
} from "~/types";

import { useAppContext } from "../app-context";

import { TranscriptionQueue } from "./transcription-queue";
import { useSupabase } from "../supabase-context";

const MIN_DECIBELS = -45;
const SPEECH_THRESHOLD = 15;
const SILENCE_THRESHOLD = 88;
const MAX_BUFFER_TIME = 1000;

const getUuidv4 = () => {
  return crypto.randomUUID();
};

export interface BaseRecorderHookOptions {
  isRecording: boolean;
  sender?: string;
  onSpeechReceived: OnSpeechReceived;
}

export const useBaseRecorder = ({
  isRecording,
  sender,
  onSpeechReceived,
}: BaseRecorderHookOptions) => {
  const mediaStream = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speechCounterRef = useRef(0);
  const silenceCounterRef = useRef(SILENCE_THRESHOLD);
  const audioChunksRef = useRef<{
    headerBuffer: ArrayBuffer | null;
    buffers: ArrayBuffer[];
  }>({
    headerBuffer: null,
    buffers: [],
  });
  const speechIdRef = useRef<string>(getUuidv4());
  const appContext = useAppContext();
  const { addJob: addTranscriptionJob } = new TranscriptionQueue(
    onSpeechReceived,
  );
  const supabase = useSupabase();

  const emitAudioChunk = useCallback(
    (data: AudioRecorderProps) => {
      if (
        !appContext.selectedMeeting?.id ||
        (!appContext.appSettings?.openaiApiKey && !supabase.credits) ||
        !appContext.user?.id ||
        !data.buffer
      )
        return;

      if (!audioChunksRef.current.headerBuffer) {
        audioChunksRef.current.headerBuffer = extractWavHeader(data.buffer);
      } else {
        data.buffer = concatArrayBuffers([
          audioChunksRef.current.headerBuffer,
          data.buffer,
        ]);
      }

      const finalSender = sender || appContext.user.id;

      const transcriptionRequest: ClientTranscriptionJob = {
        id: speechIdRef.current,
        status: "pending",
        meetingId: appContext.selectedMeeting.id,
        timestamp: new Date().toISOString(),
        openaiApiKey: appContext.appSettings?.openaiApiKey || "",
        sender: finalSender,
        ...data,
      };

      addTranscriptionJob({
        id: speechIdRef.current,
        timestamp: transcriptionRequest.timestamp,
        promise: fetchTranscription(transcriptionRequest),
        sender: finalSender,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      appContext.appSettings?.openaiApiKey,
      appContext.user?.id,
      appContext.selectedMeeting?.id,
      supabase.credits,
      sender,
    ],
  );

  const detectSound = useCallback(() => {
    if (!analyserRef.current) return;

    const concatenatedBuffer = concatArrayBuffers(
      audioChunksRef.current.buffers,
    );

    if (speechCounterRef.current > MAX_BUFFER_TIME) {
      emitAudioChunk({
        buffer: concatenatedBuffer,
        isLastChunk: false,
      });

      audioChunksRef.current.buffers = [];
      speechCounterRef.current = 0;
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const isSoundDetected = dataArray.some((value) => value > 0);

    const speakingThresholdExceeded =
      speechCounterRef.current > SPEECH_THRESHOLD;
    const silenceThresholdExceeded =
      silenceCounterRef.current > SILENCE_THRESHOLD;

    if (isSoundDetected) {
      speechCounterRef.current += 1;

      if (speakingThresholdExceeded) {
        silenceCounterRef.current = 0;
      }
    } else {
      silenceCounterRef.current += 1;

      if (silenceThresholdExceeded) {
        if (speakingThresholdExceeded) {
          audioChunksRef.current.buffers = [];

          emitAudioChunk({
            buffer: concatenatedBuffer,
            isLastChunk: false,
          });
        }

        speechCounterRef.current = 0;
      }
    }

    requestAnimationFrame(detectSound);
  }, [
    emitAudioChunk,
    speechCounterRef,
    silenceCounterRef,
    audioChunksRef,
    analyserRef,
  ]);

  useEffect(() => {
    if (!mediaStream.current) return;

    if (!audioContextRef.current) {
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
    }

    if (!analyserRef.current) {
      const analyser = audioContextRef.current.createAnalyser();
      analyser.minDecibels = MIN_DECIBELS;
      analyserRef.current = analyser;
    }

    if (isRecording) {
      const source = audioContextRef.current.createMediaStreamSource(
        mediaStream.current,
      );
      source.connect(analyserRef.current);

      requestAnimationFrame(detectSound);
    } else {
      audioContextRef.current?.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      audioChunksRef.current = {
        headerBuffer: null,
        buffers: [],
      };
      speechIdRef.current = getUuidv4();
      mediaStream.current = null;
    }
  }, [isRecording, detectSound]);

  return {
    isRecording,
    mediaStream,
    audioChunksRef,
    speechIdRef,
  };
};
