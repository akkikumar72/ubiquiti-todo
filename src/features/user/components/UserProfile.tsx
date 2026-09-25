"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DatabaseClient } from "@/util/databaseClient";
import { PiArrowLeft, PiArrowRight, PiSignOut } from "react-icons/pi";
export default function UserProfile({
  user,
  authProfile = false,
}: {
  user?: Database["public"]["Tables"]["profile"]["Row"];
  authProfile?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const signout = async () => {
    setBusy(true);
    setError("");
    try {
      const { error } = await new DatabaseClient({
        type: "clientComponent",
      }).signOutUser();
      if (error) throw error;
      router.replace("/?demo=1");
      router.refresh();
    } catch {
      setError("Could not sign out. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="account-card">
      <Link className="auth-back" href="/">
        <PiArrowLeft />
        Back to your workspace
      </Link>
      <span className="avatar">
        {(user?.name || "You").slice(0, 1).toUpperCase()}
      </span>
      <div className="eyebrow">{user ? "CLOUD ACCOUNT" : "LOCAL DEMO"}</div>
      <h1>{user?.name || "A space of your own."}</h1>
      <p>
        {user
          ? "You’re part of a shared workspace. Tasks sync through Supabase and are visible to other authenticated members."
          : "No account needed to get started. Your sample tasks and changes stay in this browser. Connect Supabase to sign in and use the shared cloud workspace."}
      </p>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {authProfile ? (
        <button className="button secondary" disabled={busy} onClick={signout}>
          <PiSignOut />
          {busy ? "Signing out…" : "Sign out"}
        </button>
      ) : !user ? (
        <Link href="/signin" className="button primary">
          Cloud account
          <PiArrowRight />
        </Link>
      ) : null}
      <Link href="/" className="button secondary">
        Back to tasks
      </Link>
    </section>
  );
}
