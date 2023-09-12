"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import LoginForm from "./SigninForm";
import useFeedback from "@/hooks/useFeedback";

export default function Signin() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const { loading, setLoading, error, setError } = useFeedback();

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
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
    <LoginForm
      error={error}
      loading={loading}
      handleSignIn={handleSignIn}
      handleGithub={handleGithub}
    />
  );
}
