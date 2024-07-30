import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useAppContext } from "~/contexts/app-context";
import { useRecorder } from "~/contexts/recorder/index.client";
import { SupabaseContextState, useSupabase } from "~/contexts/supabase-context";

export const SystemUnhealthyMessage = () => {
  const appSettings = useAppContext().appSettings;
  const supabase = useSupabase();
  const recorder = useRecorder();
  const getIsOpen = () =>
    ["CREDITS_FETCHED", "USER_ERROR", "CREDITS_ERROR"].some((state) =>
      supabase.state.includes(state as SupabaseContextState),
    ) &&
    !appSettings?.openaiApiKey &&
    !supabase.credits;

  const [isOpen, setIsOpen] = useState(() => {
    return getIsOpen();
  });

  useEffect(() => {
    const newIsOpen = getIsOpen();

    setIsOpen(newIsOpen);
    if (newIsOpen) {
      if (recorder.state.includes("MIC_RECORDING")) {
        recorder.stopMicRecording();
      }
      if (recorder.state.includes("TAB_RECORDING")) {
        recorder.stopTabRecording();
      }
    }
  }, [
    supabase.state,
    appSettings?.openaiApiKey,
    supabase.credits,
    recorder.state,
  ]);

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={() => {
        setIsOpen(false);
      }}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/50 backdrop-blur-sm"></div>
      <div className="fixed inset-0 z-20 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6  duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0">
            <DialogTitle className="font-semibold">Notice!</DialogTitle>
            <div className="py-4 flex flex-col gap-2">
              <p>
                There seems to be no more credits left or OpenAI key attached
              </p>
              <p className="text-sm">
                Either purchase more credits or attach an OpenAI key to continue
              </p>
            </div>
            <div className="py-4 flex gap-4">
              <Button
                className="py-2 px-4 border border-slate-800 text-slate-900 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
              <Link
                className="py-2 px-4 bg-blue-500 text-white rounded-md"
                to="/app/settings"
              >
                Go to settings
              </Link>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};
