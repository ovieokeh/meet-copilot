import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { MediaRecorder, IMediaRecorder } from "extendable-media-recorder";
import { useBaseRecorder } from "./shared";
import { TAB_TRANSCRIPTION_ID, extractWavHeader } from "~/lib/utils";
import { safeUpdateState } from "~/helpers/reducer-helpers";
import { useAppContext } from "../app-context";

type RecorderContextStateState =
  | "IDLE"
  | "MIC_RECORDING"
  | "TAB_RECORDING"
  | "MIC_RECORDING_ERROR"
  | "TAB_RECORDING_ERROR"
  | "MIC_RECORDING_STOPPED"
  | "TAB_RECORDING_STOPPED";

interface RecorderContextState {
  state: RecorderContextStateState[];
}

export interface RecorderContextType extends RecorderContextState {
  startMicRecording: () => void;
  stopMicRecording: () => void;
  startTabRecording: () => void;
  stopTabRecording: () => void;
}

type ActionObject = {
  type:
    | RecorderContextStateState
    | "MIC_RECORDING_STOPPED"
    | "TAB_RECORDING_STOPPED";
};

const initialState: RecorderContextType = {
  state: ["IDLE"],
  startMicRecording: () => {},
  stopMicRecording: () => {},
  startTabRecording: () => {},
  stopTabRecording: () => {},
};

const recorderReducer = (state: RecorderContextState, action: ActionObject) => {
  const toggleState = (
    states: RecorderContextStateState[],
    type: RecorderContextStateState,
  ): RecorderContextStateState[] => {
    if (["MIC_RECORDING_STOPPED", "MIC_RECORDING_ERROR"].includes(type)) {
      return states.filter((state) => state !== "MIC_RECORDING");
    } else if (
      ["TAB_RECORDING_STOPPED", "TAB_RECORDING_ERROR"].includes(type)
    ) {
      return states.filter((state) => state !== "TAB_RECORDING");
    } else if (type === "MIC_RECORDING") {
      return [
        ...states.filter(
          (s) =>
            !["IDLE", "MIC_RECORDING_STOPPED", "MIC_RECORDING_ERROR"].includes(
              s,
            ),
        ),
        type,
      ];
    } else if (type === "TAB_RECORDING") {
      return [
        ...states.filter(
          (s) =>
            !["IDLE", "TAB_RECORDING_STOPPED", "TAB_RECORDING_ERROR"].includes(
              s,
            ),
        ),
        type,
      ];
    } else {
      return safeUpdateState(states, type);
    }
  };

  switch (action.type) {
    case "MIC_RECORDING":
      return { state: toggleState(state.state, "MIC_RECORDING") };
    case "MIC_RECORDING_STOPPED":
      return {
        state: toggleState(state.state, "MIC_RECORDING_STOPPED"),
      };
    case "TAB_RECORDING":
      return { state: toggleState(state.state, "TAB_RECORDING") };
    case "TAB_RECORDING_STOPPED":
      return {
        state: toggleState(state.state, "TAB_RECORDING_STOPPED"),
      };
    case "MIC_RECORDING_ERROR":
      return { state: toggleState(state.state, "MIC_RECORDING") };
    case "IDLE":
      return { state: toggleState(state.state, "MIC_RECORDING") };
    default:
      return state;
  }
};

const RecorderContext = createContext<RecorderContextType>(initialState);

export const RecorderProvider: React.FC<{
  handleSpeechReceived: (transcript: string, sender: string) => void;
  children: React.ReactNode;
}> = ({ handleSpeechReceived, children }) => {
  const appContext = useAppContext();
  const [state, dispatch] = useReducer(recorderReducer, initialState);
  const micRecorder = useRef<IMediaRecorder | null>(null);
  const tabRecorder = useRef<IMediaRecorder | null>(null);

  const isMicRecording = state.state.includes("MIC_RECORDING");
  const isTabRecording = state.state.includes("TAB_RECORDING");

  const micRecorderState = useBaseRecorder({
    isRecording: isMicRecording,
    onSpeechReceived: handleSpeechReceived,
  });
  const tabRecorderState = useBaseRecorder({
    isRecording: isTabRecording,
    sender: TAB_TRANSCRIPTION_ID,
    onSpeechReceived: handleSpeechReceived,
  });

  const startMicRecording = useCallback(async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micRecorderState.mediaStream.current = stream;
    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/wav",
      bitsPerSecond: 44100,
    });
    micRecorder.current = recorder;

    micRecorderState.audioChunksRef.current = {
      headerBuffer: null,
      buffers: [],
    };

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        const audioBlob = event.data;

        const fileReader = new FileReader();

        fileReader.onload = () => {
          try {
            const arrayBuffer = fileReader.result as ArrayBuffer;

            micRecorderState.audioChunksRef.current.buffers.push(arrayBuffer);
            if (!micRecorderState.audioChunksRef.current.headerBuffer) {
              micRecorderState.audioChunksRef.current.headerBuffer =
                extractWavHeader(arrayBuffer);
            }
          } catch (error) {
            console.error("Error decoding audio data", error);
          }
        };

        fileReader.readAsArrayBuffer(audioBlob);
      }
    };

    recorder.start(400);
    dispatch({ type: "MIC_RECORDING" });
  }, [micRecorderState.mediaStream]);

  const stopMicRecording = useCallback(() => {
    if (!micRecorder.current || !micRecorderState.mediaStream.current) return;

    micRecorder.current.stop();
    micRecorderState.mediaStream.current
      .getTracks()
      .forEach((track) => track.stop());
    dispatch({ type: "MIC_RECORDING_STOPPED" });
    micRecorderState.audioChunksRef.current = {
      headerBuffer: null,
      buffers: [],
    };
  }, [
    micRecorderState.mediaStream,
    micRecorder.current,
    micRecorderState.mediaStream.current,
  ]);

  const handleTabAudioStream = (stream: MediaStream): void => {
    const tabSpeechId = tabRecorderState.speechIdRef.current;
    if (!tabSpeechId) return;

    tabRecorder.current = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });
    const audioStream = new MediaStream(stream.getAudioTracks());
    tabRecorderState.mediaStream.current = audioStream;

    // New MediaRecorder for only the audio part
    const audioRecorder = new MediaRecorder(audioStream, {
      mimeType: "audio/wav",
      bitsPerSecond: 44100,
    });
    audioRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        const audioBlob = event.data;

        audioBlob.arrayBuffer().then((arrayBuffer) => {
          tabRecorderState.audioChunksRef.current.buffers.push(arrayBuffer);
        });
      }
    };

    audioRecorder.start(1000);
    dispatch({ type: "TAB_RECORDING" });
  };
  const startTabRecording = useCallback(async () => {
    const tabSpeechId = tabRecorderState.speechIdRef.current;
    if (!tabSpeechId) return;

    const isRecording = state.state.includes("TAB_RECORDING");
    if (!isRecording && navigator.mediaDevices) {
      const stream = await navigator.mediaDevices
        .getDisplayMedia({
          video: true,
          audio: {
            sampleRate: 44100,
            channelCount: 1,
            noiseSuppression: true,
          },
        })
        .catch((error) => {
          console.error("Error getting display media", error);
        });

      if (!stream) return;
      tabRecorderState.mediaStream.current = stream;
      handleTabAudioStream(stream);
    }
  }, [tabRecorderState.speechIdRef]);
  const stopTabRecording = useCallback(() => {
    if (
      !state.state.includes("TAB_RECORDING") ||
      !tabRecorder.current ||
      !tabRecorderState.mediaStream.current
    )
      return;

    tabRecorder.current.stop();
    tabRecorderState.mediaStream.current
      .getTracks()
      .forEach((track) => track.stop());
    dispatch({ type: "TAB_RECORDING_STOPPED" });
    tabRecorderState.audioChunksRef.current = {
      headerBuffer: null,
      buffers: [],
    };
  }, [state.state, tabRecorder.current, tabRecorderState.mediaStream.current]);

  useEffect(() => {
    stopMicRecording();
    stopTabRecording();
  }, [appContext.selectedMeeting?.id]);

  const value = {
    state: state.state,
    startMicRecording,
    stopMicRecording,
    startTabRecording,
    stopTabRecording,
  };

  return (
    <RecorderContext.Provider value={value}>
      {children}
    </RecorderContext.Provider>
  );
};

export const useRecorder = (): RecorderContextType => {
  return useContext(RecorderContext);
};
