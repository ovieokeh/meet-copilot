import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Link, useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { twMerge } from "tailwind-merge";
import { createToast } from "vercel-toast";
import { SocialLoginButton } from "~/components/social-login-button";

import { useAppContext } from "~/contexts/app-context";
import { useSupabase } from "~/contexts/supabase-context";
import {
  optionallyRenderComponent,
  removeClientOnlyCookie,
  setClientOnlyCookie,
} from "~/lib/utils";
import { SettingsAction } from "~/types";

type SettingsService =
  | "googleAccessToken"
  | "notionAccessToken"
  | "openaiApiKey";

export const SettingsView = ({
  data,
}: {
  data: {
    notionAuthUrl: string;
  };
}) => {
  const appContext = useAppContext();
  const navigate = useNavigate();

  const updateSettings = async (actions: SettingsAction[]) => {
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(actions),
    }).then((res) => res.json());

    return response;
  };

  const handleDisconnectService = async (service: SettingsService) => {
    await updateSettings([
      {
        key: `${service}`,
        action: "delete",
      },
    ]);
    await appContext.updateSettings(service, "");
  };

  const BACK_BUTTON_VIEW = (
    <button
      className="text-slate-500 hover:text-slate-500 flex items-center gap-1 cursor-pointer"
      type="button"
      onClick={() => {
        navigate(-1);
      }}
    >
      <IoMdArrowRoundBack className="inline text-2xl" />
      <span className="ml-1">Back</span>
    </button>
  );

  const baseTabClassName = "rounded-lg py-1 px-3 text-sm/6 text-slate-500";
  const activeTabClassName =
    "focus:outline-none data-[selected]:text-slate-100 data-[selected]:font-semibold data-[selected]:bg-slate-700 data-[hover]:bg-slate-600 data-[selected]:data-[hover]:slate-700 data-[focus]:outline-1 data-[focus]:outline-slate-800";

  return (
    <div className="flex flex-col gap-2 px-4 sm:pt-0 bg-slate-50 text-slate-700 w-full">
      <div className="sticky top-0 left-2 py-4 bg-slate-50 sm:left-0 flex gap-4 sm:relative sm:mb-4">
        {BACK_BUTTON_VIEW}
        <h2 className="text-base font-bold">Configure settings</h2>
      </div>

      <div className="flex flex-col gap-4 pb-4 overflow-y-scroll no-scrollbar h-[calc(100dvh-66px)]">
        <p className="text-md">
          You can configure the integrations and behaviour of Meet Copilot here.
        </p>

        {/* <label className="flex items-center gap-3 w-fit">
          <input
            type="checkbox"
            className="rounded"
            checked={appContext.appSettings?.isSoundEnabled}
            onChange={(e) =>
              appContext.updateSettings("isSoundEnabled", e.target.checked)
            }
          />
          <span className="text-lg font-bold">Enable sound effects</span>
        </label> */}

        <TabGroup>
          <TabList className="flex gap-4 bg-slate-200 p-2">
            <Tab className={twMerge(baseTabClassName, activeTabClassName)}>
              <span className="text-lg font-bold">Access</span>
            </Tab>
            <Tab className={twMerge(baseTabClassName, activeTabClassName)}>
              <span className="text-lg font-bold">Integrations</span>
            </Tab>
          </TabList>
          <TabPanels className="py-4">
            <TabPanel>
              <AccessSettings
                handleDisconnectService={handleDisconnectService}
                updateSettings={updateSettings}
              />
            </TabPanel>
            <TabPanel>
              <IntegrationSettings
                notionAuthUrl={data.notionAuthUrl}
                handleDisconnectService={handleDisconnectService}
              />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};

export const UnauthenticatedAccessSettingsView = () => {
  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <p className="">
        Sign in using your Google account to get 120 free credits (1 credit = 1
        chunk of transcription)
        <Link to="/credits" className="text-blue-900 underline block">
          Learn more about credits
        </Link>
      </p>

      <p className="text-sm max-w-sm">
        We store only your email address to identify you and manage your
        credits.
      </p>

      <SocialLoginButton />
    </div>
  );
};

const AuthenticatedAccessSettingsView = () => {
  const { user, credits, signOut } = useSupabase();

  const handleSignOut = async () => {
    await signOut!();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-slate-900">
        You are signed in as{" "}
        <span className="font-bold text-slate-900">{user?.email}</span>
      </p>

      <p className="text-slate-900">
        You have{" "}
        <span className="font-bold text-slate-900">{credits ?? 0} credits</span>{" "}
        left
      </p>

      <Link to="/credits" className="text-blue-900 underline">
        Purchase credits
      </Link>

      <button
        className="bg-red-700 text-white rounded px-4 py-2 w-fit text-center hover:bg-red-900 transition-colors"
        onClick={handleSignOut}
      >
        Sign out
      </button>
    </div>
  );
};

const AccessSettings = ({
  handleDisconnectService,
  updateSettings,
}: {
  handleDisconnectService: (service: SettingsService) => Promise<void>;
  updateSettings: (actions: SettingsAction[]) => Promise<any>;
}) => {
  const appContext = useAppContext();
  const [openaiApiKey, setOpenaiApiKey] = useState(
    () => appContext.appSettings?.openaiApiKey || "",
  );
  const [state, setState] = useState<"idle" | "loading">("idle");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSupabase();

  // client-side only cookie for redirecting after settings update
  useEffect(() => {
    if (!appContext.appSettings) return;
    setOpenaiApiKey(appContext.appSettings.openaiApiKey);

    const currentUrlAsRedirectParam = encodeURIComponent(
      `${window.location.href}${window.location.search}`,
    );
    setClientOnlyCookie("redirect", currentUrlAsRedirectParam, "/");
  }, [appContext.appSettings]);

  const handleClearOpenaiApiKey = async () => {
    setOpenaiApiKey("");

    await handleDisconnectService("openaiApiKey");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!appContext || state === "loading") return;

    setState("loading");

    try {
      const settingsResponse = await updateSettings([
        {
          key: "openaiApiKey",
          action: openaiApiKey ? "update" : "delete",
          value: openaiApiKey,
        },
      ]);
      const isOpenAIKeyInvalid =
        settingsResponse.status === "openai-key-invalid";

      if (isOpenAIKeyInvalid) {
        createToast("Invalid OpenAI API Key", {
          type: "error",
          timeout: 3000,
        });
        setState("idle");
        return;
      }

      await appContext.updateSettings("openaiApiKey", openaiApiKey);

      const searchParam = location.search;
      const urlParams = new URLSearchParams(searchParam);
      const redirect = urlParams.get("redirect");

      if (redirect) {
        removeClientOnlyCookie("redirect");
        navigate(redirect);
      }
    } catch (error) {
      console.error("Failed to update settings", error);
      createToast("Failed to update settings", {
        type: "error",
        timeout: 3000,
      });
    } finally {
      setState("idle");
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-3 w-full">
        {user ? (
          <AuthenticatedAccessSettingsView />
        ) : (
          <UnauthenticatedAccessSettingsView />
        )}
      </div>

      <form className="flex flex-col gap-8 mt-4 w-full" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 grow sm:w-3/5">
          <label className="text-md flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <span className="font-bold text-base">
                OpenAI API Key (GPT 3.5-turbo)
              </span>

              <span className="">
                If you have an OpenAI API Key, you can enter it here to use Meet
                Copilot with GPT 3.5-turbo.
              </span>

              <p className="">
                This is optional but useful if for example you don't want to
                create an account, you can use the API key to get started with a
                subset of features.
              </p>

              <p className="">
                If you already have an account with credits, setting this will
                allow you to use the API key instead of the credits.
              </p>

              <span className="">
                You can usually find this in your OpenAI dashboard.{" "}
              </span>
              <a
                className="text-blue-900 underline"
                href="https://platform.openai.com/docs/quickstart/account-setup"
                target="_blank"
                rel="noreferrer"
              >
                Instructions to get OpenAI API Key
              </a>
            </div>
            <input
              id="openai-api-key"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              type="password"
              className={`border border-slate-300 rounded p-2 w-full mt-2`}
              placeholder="e.g a94904df-6a77-4976-906d-0d2a8d9fe860"
            />
          </label>
        </div>

        <div className="flex w-full items-center gap-4">
          <button
            type="submit"
            className={`bg-slate-700 self-end disabled:opacity-50 disabled:cursor-not-allowed text-slate-50 rounded p-2 w-32 hover:bg-slate-500 ${
              state === "loading" ? "animate-pulse" : ""
            }`}
            disabled={state === "loading"}
          >
            Save
          </button>
          {optionallyRenderComponent(
            !!openaiApiKey,
            <button
              type="button"
              className="text-red-700 rounded px-4 py-2 pl-0 w-fit text-center hover:text-red-900 transition-colors"
              onClick={handleClearOpenaiApiKey}
            >
              Clear API Key
            </button>,
          )}
        </div>
      </form>
    </div>
  );
};

const IntegrationSettings = ({
  notionAuthUrl,
  handleDisconnectService,
}: {
  notionAuthUrl: string;
  handleDisconnectService: (service: SettingsService) => Promise<void>;
}) => {
  const appContext = useAppContext();

  const CONNECT_GOOGLE_BENEFITS = [
    "Get notified before your meetings so you can setup a meeting",
    "View all past and upcoming meetings in one place",
  ];
  const CONNECT_NOTION_BENEFITS = [
    "Access your meeting notes to provide more relevant responses",
    "Automatically save insights and action items from your meetings",
    "Brainstorm by asking MeetingBud to read your notes and give you ideas or more information",
  ];

  return (
    <form className="flex flex-col gap-4 mt-4 w-full max-w-lg">
      <div className="flex flex-col gap-3 w-fit">
        <span className="font-bold">Connect Google Calendar</span>
        <p className="text-base">Why should you do this?</p>
        <ul className="list-disc ml-4">
          {CONNECT_GOOGLE_BENEFITS.map((benefit) => (
            <li key={benefit} className="ml-4">
              {benefit}
            </li>
          ))}
        </ul>

        {appContext.appSettings?.googleAccessToken ? (
          <button
            className="flex bg-red-700 text-white rounded px-4 py-2 w-fit mt-2 text-center hover:bg-red-900 transition-colors"
            onClick={() => handleDisconnectService("googleAccessToken")}
          >
            Disconnect Google Calendar
          </button>
        ) : (
          <a
            href="/api/google-auth/authenticate"
            className="block border-slate-900 border text-slate-900 rounded px-4 py-2 w-fit mt-2 text-center hover:bg-slate-800 hover:text-white transition-colors"
          >
            Connect Google Calendar
          </a>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-bold">Connect Notion</span>
        <p className="text-base">
          <span>
            Connect your Notion account to Meet Copilot for even more insightful
            and useful responses. Why should you do this?
          </span>
        </p>
        <ul className="list-disc ml-4">
          {CONNECT_NOTION_BENEFITS.map((benefit) => (
            <li key={benefit} className="ml-4">
              {benefit}
            </li>
          ))}
        </ul>

        {appContext.appSettings?.notionAccessToken ? (
          <button
            className="bg-red-700 text-white rounded px-4 py-2 w-fit mt-2 text-center hover:bg-red-900 transition-colors"
            onClick={() => handleDisconnectService("notionAccessToken")}
          >
            Disconnect Notion
          </button>
        ) : (
          <a
            href={notionAuthUrl}
            className="border-slate-900 border text-slate-900 rounded px-4 py-2 w-fit mt-2 text-center hover:bg-slate-800 hover:text-white transition-colors"
          >
            Connect Notion
          </a>
        )}
      </div>
    </form>
  );
};
