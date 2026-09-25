import Brand from "@/components/ui/Brand";
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="account-page">
      <Brand />
      {children}
    </main>
  );
}
