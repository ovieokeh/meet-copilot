import { SupabaseClient } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useMemo,
} from "react";
import { removeLoadingState, safeUpdateState } from "~/helpers/reducer-helpers";
import { createSBClientClient } from "~/lib/supabase";

export type SupabaseContextState =
  | "FETCHING_USER"
  | "FETCHING_CREDITS"
  | "FETCHING_ORDERS"
  | "IDLE"
  | "USER_FETCHED"
  | "CREDITS_FETCHED"
  | "ORDERS_FETCHED"
  | "CREDITS_ERROR"
  | "USER_ERROR"
  | "ORDERS_ERROR";
export interface SupabaseContextType {
  user: any;
  state: SupabaseContextState[];
  credits?: number;
  orders: any[];
  supabaseClient: SupabaseClient | null;
  fetchUser?: () => void;
  fetchCredits?: () => void;
  updateCredits?: (credits: number) => Promise<void>;
  fetchOrders?: () => Promise<undefined | any[]>;
  signOut?: () => Promise<void>;
  deleteUserData: () => Promise<void>;
}

const initialState: SupabaseContextType = {
  user: null,
  state: ["FETCHING_USER"] as SupabaseContextState[],
  orders: [],
  supabaseClient: null,
  deleteUserData: async () => {},
};

const SupabaseContext = createContext<SupabaseContextType>(initialState);

const supabaseReducer = (
  state: SupabaseContextType,
  action: { type: string; payload: any },
) => {
  switch (action.type) {
    case "FETCHING_USER":
    case "FETCHING_CREDITS":
    case "FETCHING_ORDERS":
      return {
        ...state,
        state: [...state.state, action.type],
      };

    case "USER_FETCHED":
      return {
        ...state,
        user: action.payload,
        state: safeUpdateState(
          removeLoadingState(state.state, "USER"),
          "USER_FETCHED",
        ),
      };
    case "CREDITS_FETCHED":
      return {
        ...state,
        credits: action.payload,
        state: safeUpdateState(
          removeLoadingState(state.state, "CREDITS"),
          "CREDITS_FETCHED",
        ),
      };
    case "ORDERS_FETCHED":
      return {
        ...state,
        orders: action.payload,
        state: safeUpdateState(
          removeLoadingState(state.state, "ORDERS"),
          "ORDERS_FETCHED",
        ),
      };
    case "USER_ERROR":
    case "CREDITS_ERROR":
    case "ORDERS_ERROR":
      return {
        ...state,
        state: safeUpdateState(
          removeLoadingState(state.state, action.type),
          action.type,
        ),
      };
    default:
      return state;
  }
};

export const SupabaseContextProvider = ({
  supabaseUrl,
  supabaseAnonKey,
  children,
}: {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(supabaseReducer, initialState);
  const supabase = useMemo(
    () => createSBClientClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey],
  );

  const fetchUser = useCallback(async () => {
    if (!supabase) {
      return null;
    }

    dispatch({ type: "FETCHING_USER", payload: null });

    const userResponse = await supabase?.auth.getUser().catch((error) => {
      console.error("Error fetching user", error);
    });

    const userDetails = userResponse?.data.user;

    if (!userDetails) {
      dispatch({ type: "USER_ERROR", payload: null });
      return null;
    }
    dispatch({ type: "USER_FETCHED", payload: userDetails });
    return userDetails;
  }, [supabase]);

  const fetchCredits = useCallback(async () => {
    if (!state.user?.email || !supabase) {
      return;
    }

    dispatch({ type: "FETCHING_CREDITS", payload: null });

    const { data, error } = await supabase
      .from("UserSettings")
      .select("credits")
      .eq("user_email", state.user?.email)
      .single();

    let creditsResponse = data?.credits;

    if (error) {
      if (
        error.code === "PGRST116" &&
        error.details === "The result contains 0 rows"
      ) {
        // This is the first time the user is logging in
        console.log("Creating credits for the first time");
        const createdCredits = await supabase
          .from("UserSettings")
          .upsert({ user_email: state.user.email, credits: 120 })
          .select("credits")
          .single();

        if (createdCredits.error) {
          console.error("Failed to create credits", createdCredits.error);
          dispatch({ type: "CREDITS_ERROR", payload: null });
          return;
        }

        if (createdCredits.data?.credits) {
          creditsResponse = createdCredits.data.credits;
        }
      }
    }

    dispatch({ type: "CREDITS_FETCHED", payload: creditsResponse });

    return creditsResponse;
  }, [state.user, supabase]);

  const updateCredits = useCallback(
    async (credits: number) => {
      if (!state.user?.email || !supabase) {
        return;
      }

      const { error } = await supabase
        .from("UserSettings")
        .update({ credits: (state.credits ?? 0) + credits })
        .eq("user_email", state.user.email);

      if (error) {
        console.error("Failed to update credits", error);
        dispatch({ type: "CREDITS_ERROR", payload: null });
        return;
      }

      dispatch({ type: "CREDITS_FETCHED", payload: credits });
    },
    [state.user, supabase],
  );

  const fetchOrders = useCallback(async () => {
    if (!state.user?.email || !supabase) {
      return;
    }

    dispatch({ type: "FETCHING_ORDERS", payload: null });

    const { data, error } = await supabase
      .from("UserOrders")
      .select("*")
      .eq("user_email", state.user?.email);

    if (error) {
      console.error("Failed to fetch orders", error);
      dispatch({ type: "ORDERS_ERROR", payload: null });
      return;
    }

    dispatch({ type: "ORDERS_FETCHED", payload: data });

    return data;
  }, [state.user, supabase]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const authSubscription = supabase?.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          dispatch({ type: "USER_FETCHED", payload: session?.user });
        }
        if (event === "SIGNED_OUT") {
          dispatch({ type: "USER_FETCHED", payload: null });
        }
      },
    );

    return () => {
      authSubscription?.data.subscription.unsubscribe();
    };
  }, [fetchUser, supabase]);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    dispatch({ type: "USER_FETCHED", payload: null });
    dispatch({ type: "CREDITS_FETCHED", payload: null });
    dispatch({ type: "ORDERS_FETCHED", payload: [] });
  }, [supabase]);

  const deleteUserData = useCallback(async () => {
    if (!state.user?.email || !supabase) {
      return;
    }

    await fetch("/api/supabase-user", {
      method: "DELETE",
    });
    await supabase.auth.signOut();
  }, [state.user, supabase]);

  const value = {
    user: state.user,
    state: state.state,
    credits: state.credits,
    supabaseClient: supabase,
    orders: state.orders,
    fetchUser,
    fetchCredits,
    updateCredits,
    fetchOrders,
    signOut,
    deleteUserData,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error(
      "useSupabase must be used within a SupabaseContextProvider",
    );
  }
  return context;
};
