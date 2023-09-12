"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import SignupForm from "./SignupForm";
import useFeedback from "@/hooks/useFeedback";

export default function Signup() {
  const supabase = createClientComponentClient<Database>();
  const { error, loading, setError, setLoading, setSuccess, success } =
    useFeedback();

  const handleSignUp = async (email: string, password: string) => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(
      "If you haven't registered with this email address before, you will receive an activation link for your account shortly.",
    );
  };

  const handleGithub = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <SignupForm
      loading={loading}
      error={error}
      success={success}
      handleGithub={handleGithub}
      handleSignUp={handleSignUp}
    />
  );
}
