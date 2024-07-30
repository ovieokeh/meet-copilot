import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface DisplayText {
  text: string;
  className?: string;
}
export const TextSwitcher = ({ texts }: { texts: DisplayText[] }) => {
  const [index, setIndex] = useState(0); // Which text we're on
  const [currentText, setCurrentText] = useState(""); // Current display text
  const [phase, setPhase] = useState("typing"); // "typing", "waiting", or "deleting"

  useEffect(() => {
    const currentTargetText = texts[index].text;

    // Determine the action based on the phase
    switch (phase) {
      case "typing": {
        if (currentText !== currentTargetText) {
          // If not fully typed, add the next character
          const nextCharIndex = currentText.length;
          const nextChar = currentTargetText.charAt(nextCharIndex);
          setTimeout(() => setCurrentText(currentText + nextChar), 100);
        } else {
          // Once fully typed, wait before deleting
          setTimeout(() => setPhase("waiting"), 2000); // Wait for 2 seconds
        }
        break;
      }
      case "waiting": {
        setTimeout(() => setPhase("deleting"), 500); // Short pause before deletion starts
        break;
      }
      case "deleting": {
        if (currentText !== "") {
          // If not fully deleted, remove the last character
          setTimeout(
            () => setCurrentText((currentText) => currentText.slice(0, -1)),
            100,
          );
        } else {
          // Once fully deleted, move to the next text and start typing again
          setIndex((prevIndex) => (prevIndex + 1) % texts.length);
          setPhase("typing");
        }
        break;
      }
      default: {
        console.error("Unrecognized phase");
        break;
      }
    }
  }, [currentText, phase, index, texts]);

  const currentClassName = texts[index].className || "";

  return (
    <div className={twMerge("sm:inline min-h-[32px]", currentClassName)}>
      <span className="transition-all">{currentText}</span>
    </div>
  );
};
