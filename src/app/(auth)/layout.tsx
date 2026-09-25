import Brand from "@/components/ui/Brand";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Brand />
        <div className="auth-story-copy">
          <span className="eyebrow">[ your everyday workspace ]</span>
          <h1>
            Less busywork.
            <br />
            More progress.
          </h1>
          <p>
            Your tasks, projects, and next steps. A clear space to bring it all
            together.
          </p>
        </div>
        <span className="auth-story-foot">
          DAYMARK / BUILT FOR THE WAY YOU WORK
        </span>
      </section>
      <section className="auth-main">{children}</section>
    </main>
  );
}
