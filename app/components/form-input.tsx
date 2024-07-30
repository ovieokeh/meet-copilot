import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

import MarkdownEditor from "./markdown-editor.client";

const FormInput = ({
  id,
  label,
  labelDescription,
  placeholder,
  type,
  value,
  beforeInputRender,
  afterInputRender,
  containerClassName,
  className,
  onChange,
  shouldFocusInput,
}: {
  id: string;
  label?: string;
  labelDescription?: string;
  placeholder: string;
  type: "text" | "textarea" | "markdown" | "email" | "password";
  value: string;
  beforeInputRender?: React.ReactNode;
  afterInputRender?: React.ReactNode;
  containerClassName?: string;
  className?: string;
  onChange: (value: string) => void;
  shouldFocusInput?: boolean;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current || type !== "textarea") return;
    const textarea = textareaRef.current;

    // scroll textarea to view
    if (!shouldFocusInput) return;
    textarea.scrollIntoView({ behavior: "smooth" });
  }, [value, shouldFocusInput, type]);

  return (
    <label
      className={twMerge("flex flex-col gap-2 w-full", containerClassName)}
      htmlFor={id}
    >
      {label ? (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold">{label}</span>
          {labelDescription ? (
            <span className="text-sm text-slate-600 leading-6">
              {labelDescription}
            </span>
          ) : null}
        </div>
      ) : null}

      {beforeInputRender ? beforeInputRender : null}

      {type === "text" ? (
        <input
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          className={`border border-slate-300 text-slate-800 rounded font-normal font-sans p-2 w-full bg-white leading-6 text-sm`}
          placeholder={placeholder}
        />
      ) : type === "textarea" ? (
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          className={twMerge(
            `border border-slate-300 text-slate-800 rounded font-normal font-sans w-full min-h-12 max-h-12 focus:min-h-28 active:min-h-28 focus:max-h-28 active:max-h-28  bg-white p-2 leading-6 text-sm transition-all
            sm:min-h-12 sm:max-h-12 sm:focus:min-h-48 sm:active:min-h-48 sm:focus:max-h-48 sm:active:max-h-48
            `,
            className,
          )}
          placeholder={placeholder}
        />
      ) : type === "markdown" ? (
        <MarkdownEditor
          id={id}
          value={value}
          onChange={(value) => onChange(value)}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          className={`border border-slate-300 text-slate-800 rounded font-normal font-sans p-2 w-full bg-white leading-6 text-sm`}
          placeholder={placeholder}
        />
      )}

      {afterInputRender ? afterInputRender : null}
    </label>
  );
};

export default FormInput;
