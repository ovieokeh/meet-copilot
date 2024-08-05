import { LinksFunction } from "@remix-run/node";
import { useSupabase } from "~/contexts/supabase-context";

export const links: LinksFunction = () => {
  return [
    {
      href: "https://code.tidio.co/05oalilgkzbydhkehirqbisweeqbartp.js",
      rel: "preload",
      as: "script",
    },
  ];
};

export default function ContactPage() {
  const supabase = useSupabase();

  const hasUser = supabase.user;

  return (
    <div className="min-h-[85dvh]">
      <h1>Contact Us</h1>

      <p>Most questions can be answered by interacting with our chatbot.</p>

      {hasUser ? (
        <p>
          If you have any questions, please reach out to us at{" "}
          <a href="mailto:support@usecopilot.com">
            <strong>Support [at] UseCopilot [dot] com</strong>
          </a>
          .
        </p>
      ) : null}
    </div>
  );
}
