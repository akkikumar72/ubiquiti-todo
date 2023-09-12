import Navbar from "@/components/layout/Navbar/Navbar";

export default function IndexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="sticky top-0 z-50 mx-auto max-w-screen-xl bg-gradient-to-b from-zinc-950 via-zinc-950/75 to-transparent">
        <Navbar />
      </div>
      <div className="z-0">{children}</div>
    </div>
  );
}
