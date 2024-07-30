import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { CiTrash } from "react-icons/ci";
import { IoMdSave, IoMdClose } from "react-icons/io";
import { PiEyedropperSampleLight } from "react-icons/pi";
import { useNavigate } from "@remix-run/react";
import { createToast } from "vercel-toast";

import FormInput from "~/components/form-input";
import { useAppContext } from "~/contexts/app-context";
import { useClientDatabaseContext } from "~/contexts/client-database-context";
import { ClientMeeting } from "~/types";

const ExampleResponses = ({
  type,
  onExampleClick,
}: {
  type: "meeting" | "action";
  onExampleClick: (example: string) => void;
}) => {
  const FREE_MODE_EXAMPLES = [
    {
      type: "meeting",
      title: "Speech coach",
      prompt: `Act as my language conversation partner. Converse with me about any topic I want and at the same time, analysing what I say and suggest alternatives to make me more legible and confident in my speech.`,
    },
    {
      type: "meeting",
      title: "Journal buddy",
      prompt: `Act as the world's best journal assistant and just listen to me talk. Be attentive, inviting, and acknowledge and probe into my words to help me see the bigger picture. In short, be a top class personal coach.`,
    },
    {
      type: "meeting",
      title: "Songwriting Assistant",
      prompt:
        "You are the most talented songwriter in the world. Complete the next 4 bars of my lyrics. Think Adele mixed with Jessie Reyez",
    },
    {
      type: "meeting",
      title: "Default",
      prompt: "",
    },
    {
      type: "action",
      title: "Language translator",
      prompt: "Translate my sentences to Dutch",
    },
    {
      type: "action",
      title: "Concept explainer",
      prompt: `Analyse the transcript and highlight any technical terms in my sentences and explain them. Your explanation should be clear, concise, and free of errors`,
    },
    {
      type: "action",
      title: "Default",
      prompt: "",
    },
  ];

  return (
    <div className="flex flex-col gap-2 py-1 w-full">
      <p className="text-sm leading-6 text-slate-600">
        Click on an example to use it as your meeting prompt, click save, and
        close this window to try it out.
      </p>

      <div className="flex flex-wrap gap-2 w-full">
        {FREE_MODE_EXAMPLES.filter((example) => example.type === type).map(
          (example) => (
            <button
              key={example.title}
              type="button"
              onClick={() => onExampleClick(example.prompt)}
              className="text-slate-900 p-2 flex items-center justify-center gap-2 w-fit rounded grow bg-slate-200 hover:bg-slate-300 transition-colors"
            >
              <span className="block">
                <PiEyedropperSampleLight className="text-base" />
              </span>
              <span className="text-xs leading-5">{example.title}</span>
            </button>
          ),
        )}
      </div>
    </div>
  );
};

export const MeetingSettingsView = () => {
  const navigate = useNavigate();
  const { database: clientDatabase } = useClientDatabaseContext();
  const appContext = useAppContext();
  const meeting = appContext.selectedMeeting;
  const [meetingState, setMeetingState] = useState<ClientMeeting>(
    () =>
      meeting ?? {
        id: "",
        userId: "",
        title: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        meetingPrompt: "",
        actionsPrompt: "",
        summary: "",
        context: "",
        mode: "default",
      },
  );
  const [uiState, setUiState] = useState<"idle" | "loading">("idle");
  const isFormDirty = useMemo(() => {
    return Object.keys(meetingState).some(
      (key) =>
        meetingState[key as keyof ClientMeeting] !==
        meeting?.[key as keyof ClientMeeting],
    );
  }, [meetingState, meeting]);

  useEffect(() => {
    if (meeting) {
      setMeetingState(meeting);
    }
  }, [meeting]);

  const deleteMeeting = async () => {
    if (!clientDatabase || uiState === "loading") return;

    setUiState("loading");

    try {
      await appContext.deleteMeeting(meetingState.id);
      navigate("/app/meetings");
    } catch (error) {
      console.error("Failed to delete Meeting", error);
      createToast("Failed to delete Meeting", {
        type: "error",
        timeout: 3000,
      });
    } finally {
      setUiState("idle");
    }
  };

  const handleFormChange = (field: keyof ClientMeeting, value: string) => {
    const fieldType = typeof meetingState[field];
    if (fieldType === "string" && (meetingState[field] as string).length > 2000)
      return;
    setMeetingState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!appContext.updateMeeting) return;
    await appContext.updateMeeting(meetingState, true);
  };

  return (
    <Transition as={Fragment} appear show>
      <Dialog as="div" className="relative z-20" onClose={() => {}}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0">
          <div className="flex items-center justify-center p-4 text-center min-h-full">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-screen-sm transform overflow-hidden rounded-2xl bg-white p-4 text-left align-middle shadow-xl transition-all">
                <div className="flex flex-col gap-4 pb-4">
                  <div className="flex justify-between items-start">
                    <DialogTitle className="text-lg font-bold">
                      Configure settings for this interview
                    </DialogTitle>

                    <button
                      type="button"
                      className="text-slate-950 hover:text-slate-700"
                      title="Delete meeting"
                      onClick={() => navigate(-1)}
                    >
                      <IoMdClose className="text-xl " />
                    </button>
                  </div>

                  <Description>
                    The changes you make here will be applied to this meeting
                    only
                  </Description>
                </div>

                <form
                  className={`relative flex flex-col gap-6 overflow-y-scroll no-scrollbar h-[calc(100dvh-234px)]`}
                  onSubmit={handleSubmit}
                >
                  <div className="flex flex-col gap-8">
                    <FormInput
                      id="meeting-title"
                      label="Meeting title"
                      labelDescription=""
                      placeholder="e.g. Dutch Translation"
                      type="text"
                      value={meetingState.title}
                      onChange={(value) => handleFormChange("title", value)}
                    />

                    <FormInput
                      id="meeting-context"
                      label="Meeting context"
                      labelDescription="Paste in meeting notes, technical facts, or any other context that will help the AI understand your meeting better. Limit is 2000 characters."
                      placeholder="e.g. Paste in meeting notes, technical facts, or any other context that will help the AI understand your meeting better"
                      type="markdown"
                      value={meetingState.context}
                      onChange={(value) => handleFormChange("context", value)}
                    />

                    <FormInput
                      id="meeting-action-prompt"
                      className="!min-h-24"
                      label="Action Instructions"
                      labelDescription="This will configure how the AI responds when you click on the action button on any message. Try out different prompts to see how the AI responds"
                      placeholder="Look up any technical terms and search my Notion workspace for related notes"
                      type="textarea"
                      value={meetingState.actionsPrompt}
                      beforeInputRender={
                        <ExampleResponses
                          type="action"
                          onExampleClick={(example) => {
                            setMeetingState({
                              ...meetingState,
                              actionsPrompt: example,
                            });
                          }}
                        />
                      }
                      onChange={(value) =>
                        handleFormChange("actionsPrompt", value)
                      }
                    />

                    <button
                      type="button"
                      className="flex items-center gap-2 text-red-700 hover:text-red-500"
                      title="Delete meeting"
                      onClick={() => deleteMeeting()}
                    >
                      <CiTrash className="text-xl" />
                      <span className="text-sm">Delete Meeting</span>
                    </button>
                  </div>

                  <div
                    className={`flex gap-6 font-bold w-full p-2 justify-between mt-auto`}
                  >
                    <button
                      type="button"
                      className="self-end flex items-center gap-2 text-red-700 hover:text-red-500"
                      title="Close settings"
                      onClick={() => navigate(-1)}
                    >
                      <IoMdClose className="text-xl " />
                      <span className="text-sm">Close</span>
                    </button>

                    <button
                      type="submit"
                      className="self-end flex items-center gap-2 text-green-700 hover:text-green-500 disabled:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                      title="Save changes"
                      disabled={!isFormDirty || uiState === "loading"}
                    >
                      <IoMdSave className="text-xl " />
                      <span className="text-sm">Save Settings</span>
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
