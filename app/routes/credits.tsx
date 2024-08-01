import type { MetaFunction } from "@remix-run/node";
import { FC } from "react";
import PaymentButtons from "~/components/payment-buttons";
import { SocialLoginButton } from "~/components/social-login-button";
import { useSupabase } from "~/contexts/supabase-context";

import { createMeta } from "~/helpers/create-meta";

export const meta: MetaFunction = () =>
  createMeta("Purchase Credits | Meet Copilot", "Meet Copilot auth view");

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

      <PricingTable isAuthed={!!user} />

      {user ? (
        <>
          <AuthenticatedOrdersView />
          <AuthenticatedCreditsView />
        </>
      ) : (
        <UnauthenticatedCreditsView />
      )}
    </div>
  );
}

export const UnauthenticatedCreditsView = () => {
  return (
    <div className="flex flex-col gap-4 max-w-lg text-slate-50">
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

  return (
    <div className="flex flex-col gap-4 text-slate-50">
      <p>
        You are signed in as{" "}
        <span className="font-bold text-blue-200">{user?.email}</span>
      </p>

      <p>
        You have{" "}
        <span className="font-bold text-green-500">{credits ?? 0} credits</span>{" "}
        left
      </p>

      <p>
        <span className="font-bold text-green-500">
          This means {credits} chunks
        </span>{" "}
        of meeting transcription
      </p>

      <p>
        A chunk is a segment of transcription that is created when there's a
        pause in the conversation longer than 88 milliseconds or when there's
        speech for more than 0.5 seconds.
      </p>
    </div>
  );
};

const AuthenticatedOrdersView = () => {
  const { orders } = useSupabase();

  return (
    <div className="flex flex-col gap-4 text-slate-50">
      <h2 className="text-xl font-bold">Your Orders</h2>

      {orders?.map((order) => (
        <div key={order.id} className="flex gap-2">
          <p>
            <span className="font-bold">{order.product}</span> for{" "}
            <span className="font-bold">{order.credits} credits </span>
            <span className="text-sm">{`(${order.status})`}</span>
          </p>
          <p>
            <a
              href={`https://www.sandbox.paypal.com/checkoutnow?token=${order.order_id}`}
              target="_blank"
              rel="noreferrer"
            >
              View order
            </a>
          </p>
        </div>
      ))}

      {orders?.length === 0 && (
        <p className="text-slate-50">You have no orders yet</p>
      )}
    </div>
  );
};

const PricingTable: FC<{
  isAuthed?: boolean;
}> = ({ isAuthed = false }) => {
  const TIERS = [
    {
      id: "starter" as const,
      title: "Starter",
      price: "5",
      description: "For occasional users who need a few credits",
      credits: 100,
    },
    {
      id: "pro" as const,
      title: "Pro",
      price: "20",
      description: "For regular users who need more credits",
      credits: 500,
    },
    {
      id: "power" as const,
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

          {isAuthed ? (
            <div className="mt-4">
              <PaymentButtons order={tier} />
            </div>
          ) : (
            <button className="mt-4 w-full py-2 px-4 bg-slate-700 text-slate-50 rounded-[4px]">
              Sign in to purchase credits
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
