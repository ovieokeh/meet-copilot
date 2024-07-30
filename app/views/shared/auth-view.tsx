import { useState } from "react";
import FormInput from "~/components/form-input";
import { useSupabase } from "~/contexts/supabase-context";

export const AuthView = ({}: {}) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { supabaseClient: supabase } = useSupabase();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // implement email/password auth
  };

  const socialLogin = async () => {
    const redirectToHost = window.location.origin;
    const redirectTo = `${redirectToHost}/app/meetings`;
    supabase?.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-12">
      {mode === "signin" ? (
        <h3>Sign in to your account</h3>
      ) : (
        <h3>Create an account</h3>
      )}

      <button onClick={socialLogin}>Sign in with Google</button>

      <form
        className="flex flex-col gap-4 min-h-[600px] max-w-[400px] w-full"
        onSubmit={handleSubmit}
      >
        {mode === "signup" ? (
          <FormInput
            id="name"
            label="Name"
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(value) => setForm({ ...form, name: value })}
          />
        ) : null}

        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(value) => setForm({ ...form, email: value })}
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(value) => setForm({ ...form, password: value })}
        />

        <p className="text-sm text-slate-600">
          <a href="#" className="text-blue-600">
            Forgot your password?
          </a>
        </p>

        <p className="text-sm text-slate-200">
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                className="text-blue-600"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-blue-600"
                onClick={() => setMode("signin")}
              >
                Sign in
              </button>
            </>
          )}
        </p>

        <button
          type="submit"
          className="bg-blue-600 text-white rounded-md py-2"
        >
          {mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>
    </div>
  );
};
