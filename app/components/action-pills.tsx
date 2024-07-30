import { ClientMeetingAction, ClientMeetingUIState } from "~/types";

import { Pill } from "./pill";

const ACTIONS: ClientMeetingAction[] = [
  {
    label: "Suggest question",
    action: "generate-question",
  },
  {
    label: "Suggest response",
    action: "generate-response",
  },
  {
    label: "Summarize",
    action: "generate-summary",
  },
];

export const ActionPills = ({
  uiState,
  onActionClick,
}: {
  uiState: ClientMeetingUIState;
  onActionClick: (action: ClientMeetingAction["action"]) => void;
}) => (
  <div className="flex flex-wrap items-center sm:justify-normal gap-2 p-2">
    {ACTIONS.map((action) => (
      <Pill
        key={action.action}
        pill={{
          label: action.label,
          value: action.action,
        }}
        onPillClick={() => onActionClick(action.action)}
        disabled={uiState === "loading-insights"}
      />
    ))}
  </div>
);
