import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import type { MetaFunction } from "@remix-run/node";
import { BiChevronDown } from "react-icons/bi";

import { createMeta } from "~/helpers/create-meta";

export const meta: MetaFunction = () =>
  createMeta("FAQ | Meet Copilot", "Meet Copilot faq view");

export default function CreditsPage() {
  return (
    <div className="flex flex-col gap-8 min-h-[85dvh] text-slate-50  px-4 py-12 items-center">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>

      <FAQView />
    </div>
  );
}

export const FAQView = () => {
  const FAQs = [
    {
      question: "What is Meet Copilot?",
      answer:
        "Meet Copilot is your AI-powered assistant to help you ace your interviews and meetings",
    },
    {
      question: "How does Meet Copilot work?",
      answer: `Meet Copilot uses accesses your tab audio as well as your mic audio and streams to the OpenAI Whisper Model to get transcripts.
        These transcripts can then be supercharged with relevant info from the GPT-4 AI and your context`,
    },
    {
      question: "How can I get started with Meet Copilot?",
      answer:
        "Getting started with Meet Copilot is easy. Just sign up and start using the app",
    },
    {
      question: "Do you store my data?",
      answer: `We save your email address to help manage your account and to identify you across devices.
        We do not store any of your meeting data. Your meetings and transcripts are all saved securely on your device`,
    },
    {
      question: "Who can read my meeting transcripts?",
      answer: `All audio transcription is done using OpenAI's Whisper model. Your transcripts are not stored on our servers and are only accessible to you and OpenAI`,
    },
    {
      question: "Why do I need to purchase credits?",
      answer: `To use MeetingCopilot, you either need to purchase credits or have an OpenAI API key.
        Purchasing credits will allow you to use MeetingCopilot without needing an OpenAI API key, sync your data across devices, and access upcoming features.`,
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-2xl w-full">
      {FAQs.map((faq) => (
        <Disclosure key={faq.question} as="div" className="flex flex-col gap-4">
          {({ open }) => (
            <>
              <DisclosureButton className="flex justify-between items-center">
                <span>{faq.question}</span>
                <BiChevronDown
                  className={`transform ${open ? "rotate-180" : ""}`}
                />
              </DisclosureButton>

              <DisclosurePanel className="text-slate-300">
                {faq.answer}
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
};
