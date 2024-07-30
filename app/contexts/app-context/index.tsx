import { useNavigate, useParams } from "@remix-run/react";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { createToast } from "vercel-toast";

import { getMeetingLinkForScreenType } from "~/lib/utils";

import { useClientDatabaseContext } from "../client-database-context";
import useIsMobile from "../ui/use-is-mobile";
import { useSupabase } from "../supabase-context";
import { removeLoadingState, safeUpdateState } from "~/helpers/reducer-helpers";
import { ClientMeeting, ClientUser, ClientUserSettings } from "~/types";

type AppContextStateState =
  | "HEALTHY"
  | "FETCHING_SETTINGS"
  | "SETTINGS_FETCHED"
  | "SETTINGS_ERROR"
  | "FETCHING_MEETINGS"
  | "MEETINGS_FETCHED"
  | "MEETINGS_ERROR"
  | "FETCHING_USER"
  | "USER_FETCHED"
  | "USER_ERROR";

export interface AppContextState {
  appSettings: ClientUserSettings;
  user: ClientUser | null;
  meetings: ClientMeeting[];
  selectedMeeting: ClientMeeting | null;
  currentState: AppContextStateState[];
  isMobile: boolean;
}

export interface AppContextType extends AppContextState {
  updateSettings: (
    field: keyof ClientUserSettings,
    value: string | boolean,
    showToast?: boolean,
  ) => Promise<void>;
  createMeeting: (title?: string) => Promise<ClientMeeting | void>;
  deleteMeeting: (meetingId: string) => Promise<void>;
  selectMeeting: (meeting: ClientMeeting) => void;
  updateMeeting: (
    meeting: Partial<ClientMeeting>,
    showToast?: boolean,
  ) => Promise<void>;
}

interface ActionObject {
  type:
    | AppContextStateState
    | "UPDATE_CURRENT_STATE"
    | "UPDATE_SETTINGS"
    | "SELECT_MEETING"
    | "UPDATE_MEETINGS"
    | "UPDATE_MEETING";
  payload?: any;
}

const initialState: AppContextState = {
  currentState: ["FETCHING_USER"],
  user: null,
  meetings: [],
  selectedMeeting: null,
  appSettings: {
    id: "",
    userId: "",
    openaiApiKey: "",
    notionAccessToken: "",
    googleAccessToken: "",
    isSoundEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  isMobile: false,
};

const setupReducer = (
  state: AppContextState,
  action: ActionObject,
): AppContextState => {
  const toggleCurrentState = (
    states: AppContextStateState[],
    type: "HEALTHY" | "UNHEALTHY",
  ): AppContextStateState[] => {
    if (type === "HEALTHY") {
      if (!states.includes("HEALTHY")) {
        return safeUpdateState(states, "HEALTHY");
      }
    } else {
      if (states.includes("HEALTHY")) {
        return states.filter((state) => state !== "HEALTHY");
      }
    }

    return states;
  };

  switch (action.type) {
    case "UPDATE_CURRENT_STATE":
      return {
        ...state,
        currentState: toggleCurrentState(state.currentState, action.payload),
      };
    case "FETCHING_SETTINGS":
    case "FETCHING_MEETINGS":
    case "FETCHING_USER":
      return {
        ...state,
        currentState: safeUpdateState(state.currentState, action.type),
      };
    case "SETTINGS_FETCHED": {
      const filteredCurrentState = removeLoadingState(
        state.currentState,
        "SETTINGS",
      );

      return {
        ...state,
        appSettings: action.payload,
        currentState: safeUpdateState(filteredCurrentState, "SETTINGS_FETCHED"),
      };
    }
    case "MEETINGS_FETCHED": {
      const filteredCurrentState = removeLoadingState(
        state.currentState,
        "MEETINGS",
      );
      return {
        ...state,
        meetings: action.payload,
        currentState: safeUpdateState(filteredCurrentState, "MEETINGS_FETCHED"),
      };
    }
    case "USER_FETCHED": {
      const filteredCurrentState = removeLoadingState(
        state.currentState,
        "USER",
      );
      return {
        ...state,
        user: action.payload,
        currentState: safeUpdateState(filteredCurrentState, "USER_FETCHED"),
      };
    }
    case "SETTINGS_ERROR":
    case "MEETINGS_ERROR":
    case "USER_ERROR": {
      const filteredCurrentState = removeLoadingState(
        state.currentState,
        action.type,
      );

      return {
        ...state,
        ...action.payload,
        currentState: safeUpdateState(filteredCurrentState, action.type),
      };
    }

    case "UPDATE_SETTINGS":
      return {
        ...state,
        appSettings: action.payload,
      };

    case "SELECT_MEETING":
      return {
        ...state,
        selectedMeeting: action.payload,
      };
    case "UPDATE_MEETINGS":
      return {
        ...state,
        meetings: state.meetings
          ? [...state.meetings, action.payload]
          : [action.payload],
      };
    case "UPDATE_MEETING":
      return {
        ...state,
        meetings: state.meetings?.map((meeting) =>
          meeting.id === action.payload.id ? action.payload : meeting,
        ),
      };
    default:
      return state;
  }
};

export const AppContext = createContext<AppContextType>({
  ...initialState,
  updateSettings: async () => {},
  selectMeeting: () => {},
  createMeeting: async () => {},
  deleteMeeting: async () => {},
  updateMeeting: async () => {},
});

export const AppContextProvider = ({
  existingopenaiApiKey,
  existingNotionAccessToken,
  existingGoogleAccessToken,
  children,
}: {
  existingopenaiApiKey?: string;
  existingNotionAccessToken?: string;
  existingGoogleAccessToken?: string;
  children: React.ReactNode;
}) => {
  const currentParamsMeetingId = useParams().id;
  const [state, dispatch] = useReducer(setupReducer, initialState);
  const { database: clientDatabase } = useClientDatabaseContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile() || false;
  const supabase = useSupabase();

  useEffect(() => {
    if (!clientDatabase || state.user) return;

    const setupUser = async () => {
      dispatch({ type: "FETCHING_USER" });

      try {
        let [user] = await clientDatabase.listObjects<ClientUser>({
          store: "users",
          index: "email",
          value: "anonymous@email.com",
        });

        if (!user) {
          const createdUserId = await clientDatabase.createObject<string>({
            store: "users",
            object: {
              name: "Anonymous",
              email: "anonymous@email.com",
            },
          });

          user = await clientDatabase.getObject<ClientUser>({
            store: "users",
            key: createdUserId,
          });
        }

        dispatch({ type: "USER_FETCHED", payload: user });
      } catch (error) {
        dispatch({
          type: "USER_ERROR",
          payload: {
            systemStatusMessage: "Error fetching user",
          },
        });
      }
    };

    setupUser();
  }, [clientDatabase]);

  useEffect(() => {
    if (!clientDatabase || !state.user) return;

    const user = state.user;
    const setupSettings = async () => {
      dispatch({ type: "FETCHING_SETTINGS" });

      try {
        let [appSettings] =
          await clientDatabase.listObjects<ClientUserSettings>({
            store: "settings",
            index: "userId",
            value: user.id,
          });

        if (!appSettings) {
          const appSettingsId = await clientDatabase.createObject<string>({
            store: "settings",
            object: {
              userId: user.id,
              openaiApiKey: existingopenaiApiKey || "",
              notionAccessToken: existingNotionAccessToken || "",
              googleAccessToken: existingGoogleAccessToken || "",
              isSoundEnabled: false,
            },
          });

          appSettings = await clientDatabase.getObject<ClientUserSettings>({
            store: "settings",
            key: appSettingsId,
          });
        } else {
          const updatedSettings = {
            ...appSettings,
            openaiApiKey:
              existingopenaiApiKey?.trim() ?? appSettings.openaiApiKey.trim(),
            notionAccessToken:
              existingNotionAccessToken?.trim() ??
              appSettings.notionAccessToken?.trim(),
            googleAccessToken:
              existingGoogleAccessToken?.trim() ??
              appSettings.googleAccessToken,
          };

          await clientDatabase.putObject({
            store: "settings",
            value: updatedSettings,
          });

          appSettings = updatedSettings as ClientUserSettings;
        }

        dispatch({ type: "SETTINGS_FETCHED", payload: appSettings });
      } catch (error) {
        dispatch({
          type: "SETTINGS_ERROR",
          payload: {
            systemStatusMessage: "Error fetching settings",
          },
        });
      }
    };

    setupSettings();
  }, [clientDatabase, state.user]);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!clientDatabase || !state.user) return;

      dispatch({ type: "FETCHING_MEETINGS" });

      try {
        const meetings = await clientDatabase.listObjects<ClientMeeting>({
          store: "meetings",
          index: "userId",
          value: state.user.id,
        });

        dispatch({ type: "MEETINGS_FETCHED", payload: meetings });
      } catch (error) {
        dispatch({
          type: "MEETINGS_ERROR",
          payload: {
            systemStatusMessage: "Error fetching meetings",
          },
        });
      }
    };

    fetchMeetings();
  }, [state.appSettings, state.user]);

  useEffect(() => {
    if (
      !state.meetings ||
      !currentParamsMeetingId ||
      state.selectedMeeting?.id === currentParamsMeetingId
    )
      return;

    const foundMeeting = state.meetings.find(
      (meeting) => meeting.id.toString() === currentParamsMeetingId,
    );

    if (foundMeeting) {
      dispatch({ type: "SELECT_MEETING", payload: foundMeeting });
    }
  }, [state.meetings, currentParamsMeetingId]);

  useEffect(() => {
    const hasOpenaiApiKey = !!state.appSettings.openaiApiKey;
    const hasCredits = supabase.credits ? supabase.credits > 0 : false;

    if (hasOpenaiApiKey || hasCredits) {
      dispatch({
        type: "UPDATE_CURRENT_STATE",
        payload: "HEALTHY",
      });
    } else {
      dispatch({
        type: "UPDATE_CURRENT_STATE",
        payload: "UNHEALTHY",
      });
    }
  }, [state.appSettings, supabase]);

  const selectMeeting = useCallback(
    (meeting: ClientMeeting) => {
      const existingMeeting = state.meetings?.find((m) => m.id === meeting.id);

      if (existingMeeting) {
        dispatch({ type: "SELECT_MEETING", payload: existingMeeting });
      } else {
        createToast("ClientMeeting not found", {
          type: "error",
        });
      }
    },
    [navigate, state.meetings],
  );

  const createMeeting = useCallback(
    async (title?: string) => {
      if (!clientDatabase || !state.user) return;

      try {
        const readableDate = Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(Date.now());

        const newMeetingId = await clientDatabase
          .createObject<string>({
            store: "meetings",
            object: {
              userId: state.user.id,
              title: title || `${readableDate}`,
              meetingPrompt: "",
              actionsPrompt: `Answer any questions or prompts in this message. If there are no questions, simply explain any technical concepts in the message. Barring that, explain the message in your own words. Keep your answer very short and to the point.`,
              context: "",
              createdAt: new Date().toISOString(),
              lastEditedAt: new Date().toISOString(),
            },
          })
          .catch((err) => {
            console.error(err);
          });

        if (newMeetingId) {
          const newMeeting = await clientDatabase.getObject<ClientMeeting>({
            store: "meetings",
            key: newMeetingId,
          });

          dispatch({ type: "UPDATE_MEETINGS", payload: newMeeting });
          createToast("ClientMeeting created", {
            type: "success",
            timeout: 2000,
          });
          navigate(getMeetingLinkForScreenType(newMeetingId, isMobile));

          return { ...newMeeting, newMeetingId };
        }
      } catch (error) {
        console.error("Failed to create ClientMeeting", error);
        createToast("Failed to create ClientMeeting", {
          type: "error",
          timeout: 2000,
        });
      }
    },
    [clientDatabase, state.user, state.meetings, selectMeeting, navigate],
  );

  const updateMeeting = useCallback(
    async (meeting: Partial<ClientMeeting>, showToast?: boolean) => {
      if (!clientDatabase || !state.selectedMeeting) return;

      try {
        const updatedMeeting = {
          ...state.selectedMeeting,
          ...meeting,
          lastEditedAt: new Date().toISOString(),
        };
        await clientDatabase.putObject({
          store: "meetings",
          value: updatedMeeting,
        });

        dispatch({
          type: "UPDATE_MEETING",
          payload: updatedMeeting,
        });
        selectMeeting(updatedMeeting);

        if (showToast) {
          createToast("ClientMeeting updated", {
            type: "success",
            timeout: 2000,
          });
        }
      } catch (error) {
        console.error("Failed to update ClientMeeting", error);
        if (showToast) {
          createToast("Failed to update ClientMeeting", {
            type: "error",
            timeout: 2000,
          });
        }
      }
    },
    [clientDatabase, state.meetings, state.selectedMeeting, selectMeeting],
  );

  const deleteMeeting = useCallback(
    async (meetingId: string) => {
      if (!clientDatabase) return;

      try {
        await clientDatabase.deleteObject({
          store: "meetings",
          key: +meetingId,
        });

        const updatedMeetings = state.meetings.filter(
          (meeting) => meeting.id !== meetingId,
        );

        dispatch({ type: "MEETINGS_FETCHED", payload: updatedMeetings });
        createToast("ClientMeeting deleted", {
          type: "success",
          timeout: 2000,
        });
      } catch (error) {
        console.error("Failed to delete ClientMeeting", error);
        createToast("Failed to delete ClientMeeting", {
          type: "error",
          timeout: 2000,
        });
      }
    },
    [clientDatabase, state.meetings],
  );

  const updateSettings = useCallback(
    async (
      field: keyof ClientUserSettings,
      value: string | boolean,
      showToast?: boolean,
    ) => {
      if (!clientDatabase || !state.appSettings) return;

      try {
        const updatedSettings = { ...state.appSettings, [field]: value };
        await clientDatabase.putObject({
          store: "settings",
          value: updatedSettings,
        });

        if (field === "openaiApiKey") {
          if (state.meetings?.length < 1) {
            const newUserMeeting = await createMeeting("New ClientMeeting");
            if (newUserMeeting) {
              dispatch({ type: "UPDATE_MEETINGS", payload: newUserMeeting });
              selectMeeting(newUserMeeting);
            }
          }
        }

        dispatch({ type: "UPDATE_SETTINGS", payload: updatedSettings });

        if (showToast) {
          createToast("Settings updated", {
            type: "success",
            timeout: 2000,
          });
        }
      } catch (error) {
        console.error("Failed to update settings", error);
        if (showToast) {
          createToast("Failed to update settings", {
            type: "error",
            timeout: 2000,
          });
        }
      }
    },
    [clientDatabase, state.appSettings],
  );

  return (
    <AppContext.Provider
      value={{
        ...state,
        isMobile,
        createMeeting,
        selectMeeting,
        updateMeeting,
        deleteMeeting,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  return useContext(AppContext);
};
