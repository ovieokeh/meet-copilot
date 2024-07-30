import { HTMLProps } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { twMerge } from "tailwind-merge";

export const MarkdownText = ({
  className,
  childrenClassName,
  text,
}: {
  className?: string;
  childrenClassName?: {
    [key: string]: string;
  };
  text: string;
}) => {
  return (
    <Markdown
      className={twMerge("leading-10", className)}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        pre: ({ children }) => (
          <pre
            className={twMerge(
              "text-slate-900 py-2 text-pretty text-base whitespace-normal",
              childrenClassName?.base,
              childrenClassName?.pre,
            )}
          >
            {children}
          </pre>
        ),
        code: ({ className, children, ...props }: HTMLProps<HTMLElement>) => {
          const match = /language-(\w+)/.exec(className || "");
          const isMultiline = children?.toString().includes("\n");

          return isMultiline ? (
            // @ts-expect-error - `style` is not in the types
            <SyntaxHighlighter
              PreTag="div"
              language={match?.[1] || ""}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              className={twMerge(
                childrenClassName?.base,
                childrenClassName?.code,
              )}
              {...props}
            >
              {children}
            </code>
          );
        },
        li: ({ children }) => (
          <li
            className={twMerge(
              "text-inherit text-base leading-7 ml-4 list-disc",
              childrenClassName?.base,
              childrenClassName?.li,
            )}
          >
            {children}
          </li>
        ),
        p: ({ children }) => (
          <p
            className={twMerge(
              "text-inherit text-base leading-7",
              childrenClassName?.base,
              childrenClassName?.p,
            )}
          >
            {children}
          </p>
        ),
        h2: ({ children }) => (
          <h2
            className={twMerge(
              "text-inherit text-xl font-bold leading-7",
              childrenClassName?.base,
              childrenClassName?.h2,
            )}
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3
            className={twMerge(
              "text-inherit text-lg font-bold leading-7",
              childrenClassName?.base,
              childrenClassName?.h3,
            )}
          >
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4
            className={twMerge(
              "text-inherit text-base font-bold leading-7",
              childrenClassName?.base,
              childrenClassName?.h4,
            )}
          >
            {children}
          </h4>
        ),
        a: ({ children, href }) => (
          <a
            className={twMerge(
              "text-blue-600 hover:underline",
              childrenClassName?.base,
              childrenClassName?.a,
            )}
            href={href as string}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {text || ""}
    </Markdown>
  );
};
