import { useEffect, useRef } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { LuScreenShareOff, LuScreenShare } from "react-icons/lu";
import { twMerge } from "tailwind-merge";

import { useAppContext } from "~/contexts/app-context";
import { useRecorder } from "~/contexts/recorder/index.client";
import { OnSpeechReceived } from "~/types";

export const AudioRecorder = ({
  title = "Record Mic Audio",
  className,
  onSpeechReceived,
}: {
  title?: string;
  className?: string;
  onSpeechReceived: OnSpeechReceived;
}) => {
  const appContext = useAppContext();
  const recorder = useRecorder();
  const isMicRecording = recorder.state.includes("MIC_RECORDING");

  const isTabRecording = recorder.state.includes("TAB_RECORDING");
  const isRecording = isMicRecording || isTabRecording;

  const isMediaRecorderInitRef = useRef(false);
  const isMediaRecorderInit = isMediaRecorderInitRef.current;

  useEffect(() => {
    const init = async () => {
      (await import("extendable-media-recorder")).register(
        await (await import("extendable-media-recorder-wav-encoder")).connect(),
      );
    };

    if (typeof window !== "undefined" && isMediaRecorderInit === false) {
      init();
    }

    return () => {
      isMediaRecorderInitRef.current = true;
    };
  }, [isMediaRecorderInit]);

  useEffect(() => {
    const isActiveInputElement = () => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA" ||
          document.activeElement.role === "textbox")
      ) {
        return true;
      }

      return false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isActiveInputElement()) return;
      if (event.key === "Shift") {
        recorder.startMicRecording?.();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isActiveInputElement()) return;
      if (event.key === "Shift") {
        recorder.stopMicRecording?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    isRecording,
    appContext.selectedMeeting,
    recorder.startMicRecording,
    recorder.stopMicRecording,
  ]);

  const getButtonClassName = (isActive: boolean, alt?: boolean) => {
    return twMerge(
      "group bg-slate-200 text-slate-900 p-4 max-h-12 w-content text-lg group rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
      isActive
        ? alt
          ? "bg-purple-500 text-purple-100 hover:text-purple-100"
          : "bg-green-500 text-green-100 hover:text-green-100"
        : "",
      className,
    );
  };

  return (
    <>
      {!appContext.isMobile ? (
        <button
          className={getButtonClassName(isTabRecording, true)}
          onClick={
            isTabRecording
              ? recorder.stopTabRecording
              : recorder.startTabRecording
          }
          disabled={false}
        >
          <div
            className={`group-hover:scale-105 transition-transform flex items-center gap-2`}
          >
            <span className="text-sm font-semibold">Record Tab Audio</span>
            {isTabRecording ? (
              <LuScreenShareOff
                className={`sm:text-2xl text-3xl ${
                  isTabRecording ? "text-white" : ""
                }`}
              />
            ) : (
              <LuScreenShare className={`sm:text-2xl text-3xl`} />
            )}
          </div>
        </button>
      ) : null}
      <button
        className={getButtonClassName(isMicRecording)}
        onClick={
          isMicRecording
            ? recorder.stopMicRecording
            : recorder.startMicRecording
        }
        disabled={false}
      >
        <div className={`${title ? "flex items-center gap-2" : ""}`}>
          {title ? (
            <span className="text-sm font-semibold">{title}</span>
          ) : null}
          {isMicRecording ? (
            <FaMicrophone className="animate-pulse group-hover:scale-125 transition-transform" />
          ) : (
            <FaMicrophoneSlash className="group-hover:scale-125 transition-transform" />
          )}
        </div>
      </button>
    </>
  );
};
