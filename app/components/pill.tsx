export const Pill = ({
  pill,
  onPillClick,
  disabled,
}: {
  pill: {
    label: string;
    value: string;
  };
  onPillClick: (value: string) => void;
  disabled?: boolean;
}) => (
  <button
    key={pill.value}
    onClick={() => onPillClick(pill.value)}
    className={`px-2 py-1 bg-slate-300 text-slate-900 text-xs sm:text-sm font-semibold rounded hover:bg-slate-200 transition-colors ${
      disabled ? "cursor-not-allowed opacity-30" : "cursor-pointer"
    }`}
    disabled={disabled}
  >
    {pill.label}
  </button>
);
