import { twMerge } from "tailwind-merge";
import { useSupabase } from "~/contexts/supabase-context";

export const SocialLoginButton = ({ className }: { className?: string }) => {
  const { supabaseClient } = useSupabase();
  const socialLogin = async () => {
    const redirectToHost = window.location.origin;
    const redirectTo = `${redirectToHost}/app/settings`;
    supabaseClient?.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  };
  return (
    <button
      className={twMerge(
        "w-56 py-2 px-4 border-slate-800 border text-slate-900 rounded-[4px]",
        className,
      )}
      onClick={socialLogin}
    >
      Sign in with Google
    </button>
  );
};
