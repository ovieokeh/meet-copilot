import { Link } from "@remix-run/react";

import { useAppContext } from "~/contexts/app-context";
import {
  getMeetingLinkForScreenType,
  getSystemStatusMessage,
  optionallyRenderComponent,
} from "~/lib/utils";

export const MeetingsView = () => {
  const appContext = useAppContext();
  const isMobile = appContext.isMobile;
  const isSystemHealthy = appContext.currentState.includes("HEALTHY");

  const CREATE_NEW_SESSION_VIEW = (
    <div className="flex flex-col gap-2 py-4">
      {optionallyRenderComponent(
        !isSystemHealthy,
        <div className="text-red-500 text-sm max-w-72 py-2">
          <p>{getSystemStatusMessage(isSystemHealthy)}</p>
          <p>
            <Link
              to="/app/settings?redirect=/app/meetings/1"
              className="underline"
            >
              Go to settings
            </Link>
          </p>
        </div>,
      )}

      <button
        className="px-4 py-2 bg-slate-700 text-slate-50 cursor-pointer w-fit transition-colors hover:bg-slate-300 hover:text-slate-900 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => appContext.createMeeting()}
        disabled={!isSystemHealthy}
      >
        Start a new interview meeting
      </button>
    </div>
  );

  const USE_CASES = [
    {
      text: "Transcribe your meetings or interviews so you can reflect on them later",
    },
    {
      text: "Get summaries on the go so you can focus on the conversation",
    },
    {
      text: "Generate insightful questions or answers to contribute to the conversation",
    },
  ];

  return (
    <div className="flex flex-col px-4 bg-slate-50 text-slate-950 w-full">
      <h2 className="text-lg font-bold bg-inherit sticky top-0 py-4 sm:relative">
        Meetings
      </h2>

      <div className="flex sm:flex-row flex-col gap-6 h-[calc(100dvh-66px)] sm:justify-between">
        <div className="flex flex-col gap-6 overflow-y-scroll no-scrollbar sm:w-1/2">
          {!appContext.appSettings?.notionAccessToken ? (
            <p className="text-sm text-slate-500 max-w-lg">
              Tip: Sharing a Notion page in{" "}
              <Link className="text-blue-500" to="/app/settings">
                Settings
              </Link>{" "}
              with all the information you need for your interview will help
              Meet Copilot provide you with the best insights!
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            {appContext && appContext.meetings ? (
              <div className="flex flex-col gap-4">
                {optionallyRenderComponent(
                  !appContext.meetings.length,
                  <>
                    <h3 className="text-slate-800 font-bold flex items-center gap-2">
                      No meetings yet
                    </h3>

                    {!appContext.appSettings?.googleAccessToken ? (
                      <p className="">
                        Connect your Calendar in{" "}
                        <Link className="text-blue-500" to="/app/settings">
                          Settings
                        </Link>{" "}
                        to display your upcoming interviews here (coming soon!)
                      </p>
                    ) : null}

                    <p className="text-sm text-slate-500">
                      Or create one with the big button below
                    </p>
                  </>,
                )}

                <div className="flex flex-col gap-2 ">
                  {appContext.meetings.map((meeting) => (
                    <Link
                      key={`${meeting.id}-${meeting.userId}`}
                      to={getMeetingLinkForScreenType(meeting.id, isMobile)}
                      className={`flex items-center border w-fit border-slate-300 transition-colors hover:bg-slate-700 hover:text-slate-50 gap-2 text-sm py-2 px-3 rounded`}
                    >
                      {meeting.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {CREATE_NEW_SESSION_VIEW}
        </div>

        <div className="flex flex-col gap-2 sm:w-1/2">
          <h3 className="text-slate-800 font-bold flex items-center gap-2">
            How to use Meet Copilot
          </h3>

          <video
            className="max-w-3xl rounded"
            src="/videos/new-meeting-demo.mp4"
            controls
          />

          <p className="font-bold text-slate-800 max-w-lg">
            Ensure that the Meet Copilot tab is always visible during the
            meeting. This is due to browser restrictions on audio capture from
            background tabs.
          </p>

          <h3 className="text-slate-800 font-bold flex items-center gap-2">
            Use cases
          </h3>

          <ul className="list-disc list-inside">
            {USE_CASES.map((useCase, index) => (
              <li key={index}>{useCase.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
