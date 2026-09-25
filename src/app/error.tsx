"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="error-page">
      <div className="eyebrow">A MOMENT TO REGROUP</div>
      <h1>We couldn’t open this space.</h1>
      <p>
        Try again, or return to the local workspace. If cloud sync is enabled,
        check your Supabase configuration.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <Link className="button secondary" href="/?demo=1">
        Open local demo
      </Link>
    </main>
  );
}
