import {
  Button,
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useNavigate } from "@remix-run/react";
import { FC } from "react";
import { useAppContext } from "~/contexts/app-context";
import { useSupabase } from "~/contexts/supabase-context";

export const CloseAccountView: FC<{
  isOpen: boolean;
  onClose: () => void;
  onClosed?: () => void;
}> = ({ isOpen, onClose, onClosed }) => {
  const supabase = useSupabase();
  const appContext = useAppContext();
  const navigate = useNavigate();

  const confirmCloseAccount = async () => {
    if (supabase.user) {
      await supabase.deleteUserData();
    }

    if (appContext.user) {
      appContext.deleteUserData();
    }

    if (typeof onClosed === "function") {
      onClosed();
    } else {
      navigate("/");
    }
  };

  const credits = supabase.credits;

  if (!supabase.user) {
    return null;
  }

  return (
    <Dialog
      as="div"
      className="relative z-20 focus:outline-none"
      open={isOpen}
      onClose={onClose}
    >
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/50 backdrop-blur-sm"></div>
      <div className="fixed inset-0 z-20 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6  duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0">
            <DialogTitle as="h3" className="text-lg font-bold">
              Close Account
            </DialogTitle>

            <div className="py-4 flex flex-col gap-4">
              <Description as="p">
                You seem to have an account with us. If you do not want to use
                Meet Copilot anymore, or, if you do not consent to our use of
                your data, you can close your account.
              </Description>

              <Description as="p">
                Are you sure you want to close your account?
              </Description>

              {credits && (
                <Description as="p">
                  You have {credits} credits left. Closing your account will
                  remove all your data and credits.
                </Description>
              )}
            </div>
            <div className="py-4 flex gap-4">
              <Button
                className="py-2 px-4 border border-slate-800 text-slate-900 rounded-md"
                onClick={() => onClose()}
              >
                Cancel
              </Button>
              <Button
                className="py-2 px-4 bg-red-800 text-slate-100 rounded-md"
                onClick={confirmCloseAccount}
              >
                Close Account
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};
