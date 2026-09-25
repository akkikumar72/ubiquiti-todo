import Link from "next/link";
export default function NotFound() {
  return (
    <main className="error-page">
      <div className="eyebrow">404 · A SMALL DETOUR</div>
      <h1>This page has wandered off.</h1>
      <p>Your tasks are right where you left them.</p>
      <Link className="button primary" href="/">
        Back to your workspace
      </Link>
    </main>
  );
}
