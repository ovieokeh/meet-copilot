import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { FaCompressArrowsAlt, FaQuestion } from "react-icons/fa";
import { IoChevronForwardOutline } from "react-icons/io5";
import { SiAnswer } from "react-icons/si";
import { MarkdownText } from "~/components/markdown-text";
import Skeleton, { SkeletonGroup } from "~/components/skeleton";
import { useMeetingContext } from "~/contexts/meeting-context";

export const MeetingInsightsEmptyView = ({ text }: { text: string }) => (
  <div className="flex flex-col gap-2 animate-fadeIn text-slate-500 italic leading-6 py-2">
    <p className="text-sm">{text}</p>
  </div>
);

/**
 * Implement
 * - Show original message snippet in case of ACTION_RESPONSE
 * - - Scroll and show full message on click
 * - - Maybe implement highlighting of the original message snippet on hover of the response
 *
 * - Automatic question responses
 * - Faster response times
 
 * - More efficient message loading
 * - Summarise messages in chunks of 50 messages and pass along previous summary with each chunk
 */
export const MeetingInsightsView = () => {
  const { uiState, messages } = useMeetingContext();

  const systemMessages = (
    messages.filter((message) => message.sender === "system") || []
  ).sort((b, a) => a.createdAt.getTime() - b.createdAt.getTime());

  if (!systemMessages.length && uiState === "idle")
    return (
      <MeetingInsightsEmptyView text="No insights available. Once you have transcripts ready, click on one of the action buttons below" />
    );

  const MESSAGE_TYPE_ICON_MAP: {
    [key: string]: any;
  } = {
    ACTION_RESPONSE: <SiAnswer className="size-3" />,
    ACTION_QUESTION: <FaQuestion className="size-3" />,
    ACTION_SUMMARY: <FaCompressArrowsAlt className="size-3" />,
  };

  const isLoadingInsights = uiState === "loading-insights";

  return (
    <div className="flex flex-col gap-4 animate-fadeIn w-full">
      {isLoadingInsights && (
        <div className="flex flex-col gap-8 animate-fadeIn w-full">
          {[3].map((i) => (
            <SkeletonGroup key={i}>
              {new Array(i).fill(1).map((_i, i) => (
                <Skeleton
                  className="bg-slate-300"
                  key={i}
                  width={i % 2 === 0 ? "100%" : "80%"}
                  height={16}
                />
              ))}
            </SkeletonGroup>
          ))}
        </div>
      )}

      {systemMessages.map((message, index) => (
        <Disclosure
          as="div"
          className="p-2 bg-slate-200 rounded"
          key={message.id}
          defaultOpen={!isLoadingInsights && index === 0}
        >
          {({ open }) => (
            <>
              <DisclosureButton className="group flex w-full items-center">
                <div className="flex gap-2 items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {MESSAGE_TYPE_ICON_MAP[message.type] && (
                      <span className="p-1 bg-blue-200">
                        {MESSAGE_TYPE_ICON_MAP[message.type]}
                      </span>
                    )}
                    <MarkdownText
                      childrenClassName={{
                        base: "text-sm",
                      }}
                      text={`### ${
                        message.type === "ACTION_SUMMARY"
                          ? "Summary"
                          : message.type === "ACTION_QUESTION"
                            ? "Question"
                            : message.type === "ACTION_RESPONSE"
                              ? "Answer"
                              : ""
                      }: ${message.text.substring(0, 10) + "..."}
                    `}
                    />
                  </div>

                  <IoChevronForwardOutline
                    className={`ml-auto transition-transform transform ${
                      open ? "rotate-90" : "rotate-0"
                    }`}
                  />
                </div>
              </DisclosureButton>
              <DisclosurePanel className="mt-2">
                <MarkdownText text={message.text} />
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
};
