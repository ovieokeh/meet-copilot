import type { MetaFunction } from "@remix-run/node";
import { FC } from "react";
import { SocialLoginButton } from "~/components/social-login-button";
import { useSupabase } from "~/contexts/supabase-context";

import { createMeta } from "~/helpers/create-meta";

export const meta: MetaFunction = () =>
  createMeta(
    "Purchase Credits | Meet Copilot",
    "Meet Copilot auth view",
  );

export default function CreditsPage() {
  const supabase = useSupabase();

  const user = supabase.user;

  return (
    <div className="flex flex-col gap-8 min-h-[85dvh] text-slate-50  px-4 py-12">
      <h1 className="text-3xl font-bold">Purchase Credits</h1>

      <div className="flex flex-col gap-4">
        <p className="">
          To use MeetingCopilot, you either need to purchase credits or have an
          OpenAI API key.
        </p>
        <p className="">Purchasing credits will allow you to -</p>

        <ul className="list-disc list-inside">
          <li>Use MeetingCopilot without needing an OpenAI API key</li>
          <li>Sync your data across devices</li>
          <li>Access to upcoming features</li>
        </ul>
      </div>

      {user ? <AuthenticatedCreditsView /> : <UnauthenticatedCreditsView />}

      <PricingTable isAuthed={!!user} />
    </div>
  );
}

export const UnauthenticatedCreditsView = () => {
  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <p className="">
        Sign in using your Google account to get 120 free credits (1 credit = 1
        chunk of transcription)
      </p>

      <p className="text-sm max-w-sm">
        We store only your email address to identify you and manage your
        credits.
      </p>

      <SocialLoginButton className="border-slate-50 bg-slate-100" />
    </div>
  );
};

const AuthenticatedCreditsView = () => {
  const { user, credits } = useSupabase();

  const creditsToMinutes = (credits?: number) => {
    if (!credits) return 0;
    // 1 credit = 1 minute
    return credits;
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

      <p className="text-slate-900">
        <span className="font-bold text-slate-900">
          This means {creditsToMinutes(credits)} minutes
        </span>{" "}
        of meeting transcription
      </p>
    </div>
  );
};

const PricingTable: FC<{
  isAuthed?: boolean;
}> = ({ isAuthed = false }) => {
  const TIERS = [
    {
      id: "starter",
      title: "Starter",
      price: "5",
      description: "For occasional users who need a few credits",
      credits: 100,
    },
    {
      id: "pro",
      title: "Pro",
      price: "20",
      description: "For regular users who need more credits",
      credits: 500,
    },
    {
      id: "power",
      title: "Power",
      price: "50",
      description: "For power users who need a lot of credits",
      credits: 2000,
    },
  ];

  return (
    <div className="flex flex-wrap gap-6">
      {TIERS.map((tier) => (
        <div
          key={tier.id}
          className="bg-slate-800 p-4 rounded-[8px] border border-slate-700"
        >
          <h2 className="text-xl font-bold text-slate-50">{tier.title}</h2>
          <p className="text-slate-50 mt-2">{tier.description}</p>
          <p className="text-slate-50 mt-2">
            <span className="text-xl font-bold">${tier.price}</span> for{" "}
            <span className="font-bold">{tier.credits} credits</span>
          </p>
          <button
            className="mt-4 w-full py-2 px-4 bg-slate-700 text-slate-50 rounded-[4px]"
            disabled={!isAuthed}
          >
            {isAuthed ? "Purchase" : "Sign in to purchase credits"}
          </button>
        </div>
      ))}
    </div>
  );
};
