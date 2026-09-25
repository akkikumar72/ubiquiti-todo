import { dateKey } from "@/lib/tasks";
import Home from "@/features/home/components/Home";
import { cloudConfigured } from "@/lib/config";
import { DatabaseClient } from "@/util/databaseClient";
import { cookies } from "next/headers";
export default async function Page({
  searchParams,
}: {
  searchParams: { demo?: string };
}) {
  if (!cloudConfigured || searchParams.demo === "1")
    return <Home initialToday={dateKey()} cloud={false} />;
  const database = new DatabaseClient({ type: "serverComponent", cookies });
  const {
    data: { user },
  } = await database.getAuthUser();
  return (
    <Home
      initialToday={dateKey()}
      cloud={Boolean(user)}
      userId={user?.id}
      userName={user?.user_metadata?.name || user?.email?.split("@")[0]}
    />
  );
}
