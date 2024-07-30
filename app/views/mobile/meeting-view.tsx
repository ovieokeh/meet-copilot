import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { Outlet, useLocation } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { MessageList } from "~/components/messages-list";
import { ModeStatusView } from "~/components/mode-status";
import { useMeetingContext } from "~/contexts/meeting-context";
import { ClientMeetingMessage } from "~/types";
import { MeetingInsightsView } from "~/views/shared/insights-view";

export const MeetingMobileView = ({
  messages,
  selectedMessageId,
}: {
  messages: ClientMeetingMessage[];
  selectedMessageId?: string;
}) => {
  const location = useLocation();
  const meetingModeMessageRef = useRef<HTMLDivElement | null>(null);
  const messagesHeaderRef = useRef<HTMLDivElement | null>(null);
  const [messagesViewHeight, setMessagesViewHeight] = useState<string>("");
  const [messagesHeaderHeight, setMessagesHeaderHeight] = useState<string>("");
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);

  useEffect(() => {
    setMessagesViewHeight(
      `calc(100dvh - ${
        +(meetingModeMessageRef.current?.clientHeight ?? 0) +
        +(messagesHeaderRef.current?.clientHeight ?? 0)
      }px)`,
    );

    setMessagesHeaderHeight(
      `${
        messagesHeaderRef.current?.clientHeight
          ? messagesHeaderRef.current?.clientHeight
          : 0
      }`,
    );
  }, [messages]);

  const isSettingsPath = location.pathname.includes("settings");

  if (isSettingsPath) return <Outlet />;

  const MESSAGES_VIEW = (
    <div
      style={{
        height: messagesViewHeight,
      }}
      className={twMerge(
        "flex flex-col *:h-1/2 *:w-full gap-2 transition-all ease-in-out grow overflow-hidden bg-slate-50",
      )}
    >
      <MessageList
        messages={messages}
        selectedMessageId={selectedMessageId}
        onActionClick={() => setIsInsightsModalOpen(true)}
      />
    </div>
  );

  return (
    <div className="h-dvh overflow-hidden relative flex flex-col">
      <MeetingInsightsModal
        isOpen={isInsightsModalOpen}
        setIsOpen={setIsInsightsModalOpen}
      />

      <div ref={messagesHeaderRef} className="bg-slate-50 w-full py-2">
        <ModeStatusView />
      </div>

      <div
        className="w-full flex flex-col"
        style={{
          height: `calc(100dvh - ${messagesHeaderHeight}px)`,
        }}
      >
        <div className="flex flex-col overflow-hidden relative">
          <div className="flex flex-col">{MESSAGES_VIEW}</div>

          <div className="w-full fixed bottom-0 flex flex-col grow place-self-end bg-slate-200">
            <div
              ref={meetingModeMessageRef}
              className="flex items-center justify-center text-center py-2"
            >
              <p className="text-slate-500 text-xs font-semibold text-center mt-0 py-0">
                Meeting mode not supported on mobile
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MeetingInsightsModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const { selectMessage } = useMeetingContext();
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative" onClose={() => setIsOpen(false)}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0">
          <div className="flex items-center justify-center p-4 text-center min-h-full">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-screen-sm transform overflow-hidden rounded-2xl bg-white p-4 text-left align-middle shadow-xl transition-all">
                <div className="flex flex-col gap-2 pb-4">
                  <div className="flex justify-between items-start">
                    <DialogTitle className="text-md font-bold">
                      Copilot says
                    </DialogTitle>

                    <button
                      type="button"
                      className="text-slate-950 hover:text-slate-700"
                      title="Delete meeting"
                      onClick={() => {
                        setIsOpen(false);

                        setTimeout(() => {
                          selectMessage(undefined);
                        }, 300);
                      }}
                    >
                      <IoMdClose className="text-md " />
                    </button>
                  </div>
                </div>

                <MeetingInsightsView />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
