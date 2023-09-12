import Navbar from "@/components/layout/Navbar/Navbar";
import { Card } from "@/components/ui";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="max-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 pb-10">
        <Card>{children}</Card>
      </div>
    </section>
  );
}
