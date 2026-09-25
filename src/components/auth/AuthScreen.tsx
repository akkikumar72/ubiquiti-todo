"use client";
import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PiArrowLeft, PiArrowRight, PiGithubLogo } from "react-icons/pi";
import { cloudConfigured } from "@/lib/config";
export default function AuthScreen({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const client = useMemo(
    () => (cloudConfigured ? createClientComponentClient<Database>() : null),
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    params.has("error")
      ? "The sign-in link could not be verified. Request a new link or sign in again."
      : "",
  );
  const [success, setSuccess] = useState("");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!client) return;
    const data = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const credentials = {
        email: String(data.get("email")),
        password: String(data.get("password")),
      };
      if (signup) {
        const { data, error } = await client.auth.signUp({
          ...credentials,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/");
          router.refresh();
        } else
          setSuccess(
            "Check your inbox. If this email can be registered, you’ll receive an activation link.",
          );
      } else {
        const { error } = await client.auth.signInWithPassword(credentials);
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign-in failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const github = async () => {
    if (!client) return;
    setLoading(true);
    setError("");
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "GitHub sign-in is unavailable.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-card">
      <div className="eyebrow">YOUR NEXT SMALL STEP</div>
      <h1>{signup ? "Make yourself at home." : "Welcome to your space."}</h1>
      <p>
        {signup
          ? "Create an account for the shared cloud workspace."
          : "Sign in to the shared cloud workspace, or explore the local demo."}
      </p>
      {!client ? (
        <>
          <div className="notice">
            <strong>Cloud sync is not configured yet.</strong>
            <p className="modal-copy">
              You can use every task view in the local demo. To enable email or
              GitHub sign-in, connect Supabase using the setup guide in the
              README.
            </p>
          </div>
          <Link className="button primary" href="/?demo=1">
            Explore the demo
            <PiArrowRight />
          </Link>
          <a
            className="button secondary"
            href="https://github.com/akkikumar72/ubiquiti-todo#cloud-setup"
            target="_blank"
            rel="noreferrer"
          >
            Cloud setup guide
            <PiArrowRight />
          </a>
        </>
      ) : (
        <>
          <form onSubmit={submit}>
            {error && (
              <p className="notice error" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="notice success" role="status">
                {success}
              </p>
            )}
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete={signup ? "new-password" : "current-password"}
                placeholder="At least 6 characters"
              />
            </label>
            <button className="button primary" disabled={loading}>
              {loading ? "One moment…" : signup ? "Create account" : "Sign in"}
              <PiArrowRight />
            </button>
          </form>
          <div className="auth-divider">or continue with</div>
          <button
            type="button"
            disabled={loading}
            className="button secondary"
            onClick={github}
          >
            <PiGithubLogo />
            GitHub
          </button>
          <p className="auth-switch">
            {signup ? "Already have an account?" : "New here?"}{" "}
            <Link href={signup ? "/signin" : "/signup"}>
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="modal-copy">
            This is a shared workspace. Authenticated members can see and edit
            its tasks.
          </p>
        </>
      )}
      <Link className="auth-back" href="/?demo=1">
        <PiArrowLeft />
        Back to the local workspace
      </Link>
    </div>
  );
}
