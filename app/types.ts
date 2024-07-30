export interface NotionSearchParams {
  accessToken: string;
  sort?: {
    timestamp: "last_edited_time";
    direction: "ascending" | "descending";
  };
  query: string;
  start_cursor?: string;
  page_size?: number;
}

export interface NotionGetDocumentParams {
  accessToken: string;
  id: string;
}

export type ClientMeetingUIState =
  | "loading-messages"
  | "loading-insights"
  | "idle";

export interface ClientMeetingAction {
  label: string;
  action: "generate-response" | "generate-question" | "generate-summary";
}

export interface AudioRecorderProps {
  buffer: ArrayBuffer;
  isLastChunk: boolean;
}

export interface RecorderReturnValue {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export interface ClientTranscriptionJob {
  id: string;
  meetingId: string;
  timestamp: string;
  openaiApiKey: string;
  buffer?: Blob | ArrayBuffer;
  sender: string;
  isLastChunk: boolean;
  status: "pending" | "completed" | "failed";
}

export type ClientTranscriptionResult = ClientTranscriptionJob & {
  text: string;
};

export type ClientTranscriptionJobs = Record<string, ClientTranscriptionJob>;

export type PartySocketSend = (
  data: unknown,
  without?: string[] | undefined,
) => void;

export interface TranscriptionSuccessResult {
  id: string;
  timestamp: string;
  status: string;
  transcript: string;
  sender: string;
}
export interface TranscriptionFailResult {
  id: string;
  timestamp: string;
  status: string;
  transcript?: string;
  sender: string;
}

export type TranscriptionResult =
  | TranscriptionSuccessResult
  | TranscriptionFailResult;

export type OnSpeechReceived = (transcript: string, sender: string) => void;

export interface SettingsAction {
  key: string;
  action: "update" | "delete";
  value?: string;
}

type UserCreateAction = {
  action: "create";
  value: {
    name: string;
    email: string;
    password: string;
  };
};

type UserUpdateAction = {
  action: "update";
  key: string;
  value: string;
};

type UserDeleteAction = {
  action: "delete";
  key: string;
};

type UserLoginAction = {
  action: "login";
  value: {
    email: string;
    password: string;
  };
};

export type UserAction =
  | UserCreateAction
  | UserUpdateAction
  | UserDeleteAction
  | UserLoginAction;

export const isUserCreateAction = (
  action: UserAction,
): action is UserCreateAction => action.action === "create";

export const isUserUpdateAction = (
  action: UserAction,
): action is UserUpdateAction => action.action === "update";

export const isUserDeleteAction = (
  action: UserAction,
): action is UserDeleteAction => action.action === "delete";

export const isUserLoginAction = (
  action: UserAction,
): action is UserLoginAction => action.action === "login";

export type MeetingMessageType =
  | "ACTION_RESPONSE"
  | "ACTION_QUESTION"
  | "ACTION_SUMMARY";
export enum MeetingMessageTypeEnum {
  ACTION_RESPONSE = "ACTION_RESPONSE",
  ACTION_QUESTION = "ACTION_QUESTION",
  ACTION_SUMMARY = "ACTION_SUMMARY",
}

export type MeetingMessageStatus = "DELIVERED" | "PENDING";

export interface ClientMeetingMessage {
  id: string;
  meetingId: string;
  userId: string;
  text: string;
  sender: string;
  createdAt: Date;
  updatedAt: Date;
  status: MeetingMessageStatus;
  type: MeetingMessageType;
  enrichment: string;
  repliedToId: string | null;
}

export interface ClientMeeting {
  id: string;
  userId: string;
  title: string;
  meetingPrompt: string;
  actionsPrompt: string;
  context: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientUserSettings {
  id: string;
  userId: string;
  openaiApiKey: string;
  notionAccessToken: string;
  googleAccessToken: string;
  isSoundEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
