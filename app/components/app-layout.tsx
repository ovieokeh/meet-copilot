import { Link, Outlet, useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { GrHelpBook } from "react-icons/gr";
import { LuLibrary } from "react-icons/lu";

import Healthcheck from "~/components/healthcheck";
import { useAppContext } from "~/contexts/app-context";
import {
  getMeetingLinkForScreenType,
  getSystemStatusMessage,
} from "~/lib/utils";

import Hamburger from "./hamburger";

const AppLayout = () => {
  const appContext = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    setIsSidebarOpen(!appContext.isMobile);
  }, [appContext.isMobile]);

  useEffect(() => {
    const deselectMessageOnOutsideClick = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement) {
        const outletContainerElements = document.querySelectorAll(
          '[data-is-outlet-container="true"]',
        );

        if (
          outletContainerElements &&
          outletContainerElements.length > 0 &&
          [...outletContainerElements].some((el) =>
            el.contains(e.target as Node),
          )
        ) {
          setIsSidebarOpen(false);
          return;
        }

        const hamburgerElement = document.querySelector(
          '[data-is-hamburger="true"]',
        );
        const sidebarElement = document.querySelector(
          '[data-is-sidebar="true"]',
        );

        if (
          e.target === hamburgerElement ||
          e.target === sidebarElement ||
          (sidebarElement && sidebarElement.contains(e.target)) ||
          (hamburgerElement && hamburgerElement.contains(e.target))
        ) {
          return;
        }

        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("click", deselectMessageOnOutsideClick);
    return () => {
      document.removeEventListener("click", deselectMessageOnOutsideClick);
    };
  }, []);

  const isActiveMeeting = (id: string) => {
    return (
      appContext.selectedMeeting?.id && appContext.selectedMeeting.id === id
    );
  };

  const isActiveView = (view: string) => {
    return (
      (location.pathname === "/" && view === "Home") ||
      (location.pathname !== "/" &&
        location.pathname.includes(view.toLowerCase()))
    );
  };

  const isLoadingState = appContext.currentState.some((state) =>
    state.includes("FETCHING"),
  );

  const handleCreateMeeting = async () => {
    const newMeeting = await appContext.createMeeting();

    if (newMeeting?.id) {
      setIsSidebarOpen(false);
      navigate(getMeetingLinkForScreenType(newMeeting.id, isMobile));
    }
  };

  const isMobile = appContext.isMobile;

  const hasMoreThan5Meetings = appContext.meetings.length > 5;
  const meetingsToShow = hasMoreThan5Meetings
    ? appContext.meetings?.slice?.(appContext.meetings.length - 5) ?? []
    : appContext.meetings;

  const isSystemHealthy = appContext.currentState.includes("HEALTHY");
  const systemStatusMessage = getSystemStatusMessage(isSystemHealthy);

  const isBaseView = ["/app", "/app/"].includes(location.pathname);
  useEffect(() => {
    if (isBaseView) {
      navigate("/app/meetings");
    }
  }, [isBaseView, navigate]);

  return (
    <div className={`flex flex-col gap-4 w-full max-w-[2440px] mx-auto`}>
      <div className="flex relative flex-col sm:flex-row w-full bg-slate-50 text-slate-950 sm:rounded-lg">
        {isMobile ? (
          <>
            <button
              data-is-hamburger={true}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-4 fixed top-0 place-self-end z-10 transition-colors rounded-bl-md ${
                isSidebarOpen ? "text-slate-900" : "text-slate-600"
              }`}
              title="Toggle sidebar visibility"
              type="button"
            >
              <Hamburger isOpen={isSidebarOpen} />
            </button>
            <div
              data-is-outlet-container={true}
              className={`w-full h-dvh overflow-hidden transition-opacity  ${
                isSidebarOpen ? "opacity-30 pointer-events-none" : "opacity-100"
              }`}
            >
              <Outlet />
            </div>
          </>
        ) : null}

        <div
          data-is-sidebar={true}
          className={`flex flex-col gap-2 transition ease-in-out duration-300 overflow-hidden bg-slate-900 px-4 py-2 ${
            isMobile
              ? isSidebarOpen
                ? "-translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
              : ""
          } ${
            isMobile
              ? "fixed top-0 right-0 bottom-0 w-[80%]"
              : " w-[280px] opacity-100 border-slate-900"
          }`}
        >
          <Link
            to="/"
            className={`flex items-center gap-2 transition-colors text-slate-100 py-2 hover:text-slate-400 ${
              !isMobile ? "justify-between" : ""
            }`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="font-bold">Meet Copilot</span>
            <GrHelpBook className={`text-xl`} />
          </Link>

          <div className="flex flex-col w-full gap-2">
            <Link
              to="/app/meetings"
              className={`flex items-center py-2 gap-2 transition-all hover:text-slate-50 hover:font-semibold ${
                isActiveView("Meetings")
                  ? "font-bold text-slate-50"
                  : "text-slate-400"
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <LuLibrary className="text-lg" />
              Active Meetings
              <Healthcheck
                status={
                  isSystemHealthy ? "green" : isLoadingState ? "gray" : "red"
                }
                message={systemStatusMessage || "Loading..."}
              />
            </Link>

            {meetingsToShow.length ? (
              <div className="animate-fadeIn flex flex-col gap-4 no-scrollbar overflow-y-scroll">
                <div className="flex flex-col gap-2">
                  {meetingsToShow.map((meeting) => (
                    <Link
                      key={`${meeting.id}-${meeting.userId}`}
                      to={getMeetingLinkForScreenType(meeting.id, isMobile)}
                      className={`flex items-center gap-2 transition-colors text-sm py-2 px-3 rounded ${
                        isActiveMeeting(meeting.id)
                          ? "bg-slate-600 text-slate-50"
                          : "text-slate-400 bg-transparent hover:bg-slate-700"
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      {meeting.title}
                    </Link>
                  ))}

                  {hasMoreThan5Meetings ? (
                    <Link
                      to="/app/meetings"
                      className={`flex items-center gap-2 transition-colors text-sm py-2 px-3 rounded ${
                        isActiveView("Meetings")
                          ? "bg-slate-600 text-slate-50"
                          : "text-slate-400 bg-transparent hover:bg-slate-700"
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      View all meetings
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn ">
                <p className="italic text-slate-600 text-sm">
                  No active meetings
                </p>
              </div>
            )}
          </div>

          <div className="animate-fadeIn flex flex-col gap-2 mt-auto">
            {isSystemHealthy ? null : (
              <p className="text-sm text-slate-600">{systemStatusMessage}</p>
            )}
            <button
              disabled={isLoadingState || !isSystemHealthy}
              className={`px-4 py-2 rounded font-semibold text-sm border-2 border-slate-500 text-slate-100 transition-colors hover:text-slate-50 hover:bg-slate-500 disabled:opacity-30 disabled:cursor-not-allowed ${
                isLoadingState ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleCreateMeeting}
              title={systemStatusMessage}
              type="button"
            >
              New Meeting
            </button>

            <Link
              to="/app/settings"
              className={`p-2 text-sm rounded font-semibold border-2 border-slate-500 transition-colors hover:text-slate-50 hover:bg-slate-500 text-center ${
                isActiveView("Settings")
                  ? "bg-slate-200 text-slate-950"
                  : "text-slate-100"
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              App Settings
            </Link>
          </div>
        </div>

        {!isMobile ? (
          <div
            data-is-outlet-container={true}
            className={`bg-slate-50 text-slate-950 overflow-hidden h-[calc(100dvh)] w-full`}
          >
            <Outlet />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AppLayout;
