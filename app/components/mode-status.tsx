import { Link } from "@remix-run/react";
import { MdSettings } from "react-icons/md";

export const ModeStatusView = () => {
  return (
    <Link
      className="flex items-center gap-2 bg-slate-50 p-2 sm:p-4 w-full grow"
      to="settings"
    >
      <MdSettings className="text-2xl" />

      <p className="text-sm font-semibold text-slate-900">
        Meeting mode (Keep tab open!)
      </p>
    </Link>
  );
};
