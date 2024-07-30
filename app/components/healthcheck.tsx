import { Popover } from "@headlessui/react";

import Skeleton from "./skeleton";

const Healthcheck = ({
  status,
  message,
}: {
  status: "green" | "red" | "gray";
  message: string;
}) => {
  return (
    <Popover>
      <Popover.Button>
        {" "}
        <div
          className={`animate-fadeIn w-2 h-2 rounded-full flex items-center justify-center ${
            status === "green"
              ? "bg-green-700"
              : status === "gray"
                ? "bg-gray-700 animate-pulse"
                : "bg-red-700"
          }`}
        />
      </Popover.Button>

      <Popover.Panel className="absolute z-10">
        <div className="bg-white shadow-md p-4 rounded-lg">
          {status === "gray" ? (
            <Skeleton width={80} height={24} />
          ) : (
            <div className="w-48 text-sm">
              <p
                className={
                  status === "green" ? "text-green-700" : "text-red-700"
                }
              >
                {message}
              </p>
            </div>
          )}
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default Healthcheck;
