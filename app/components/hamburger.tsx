import { twMerge } from "tailwind-merge";

export default function Hamburger({
  isOpen,
  className,
}: {
  isOpen: boolean;
  className?: string;
}) {
  return (
    <div className="flex flex-col justify-around w-6 h-6 cursor-pointer p-0 z-20">
      <div
        className={twMerge(
          "w-6 h-1 rounded transition-all duration-300",
          isOpen
            ? "transform bg-slate-300 -translate-x-1"
            : "bg-slate-700 opacity-30",
          className,
        )}
      />
      <div
        className={twMerge(
          "w-4 h-1 rounded transition-all duration-300",
          isOpen ? "translate-x-2 bg-slate-50" : "translate-x-1 bg-slate-900",
          className,
        )}
      />
      <div
        className={twMerge(
          "w-6 h-1 rounded transition-all duration-300",
          isOpen
            ? "transform bg-slate-300 -translate-x-1"
            : "bg-slate-700 opacity-30",
          className,
        )}
      />
    </div>
  );
}
