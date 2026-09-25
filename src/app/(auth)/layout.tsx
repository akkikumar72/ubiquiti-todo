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
        <h1>
          Good days start
          <br />
          with a little
          <br />
          clarity.
        </h1>
        <p>
          A home for your ideas, your plans, and the little things that make a
          difference.
        </p>
      </section>
      <section className="auth-main">{children}</section>
    </main>
  );
}
