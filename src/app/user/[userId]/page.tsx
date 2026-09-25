import { cloudConfigured } from "@/lib/config";
import { DatabaseClient } from "@/util/databaseClient";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import UserProfile from "@/features/user/components/UserProfile";
export default async function UserByIdPage({
  params,
}: {
  params: { userId: string };
}) {
  if (!cloudConfigured || !/^[0-9a-f-]{36}$/i.test(params.userId)) notFound();
  const database = new DatabaseClient({ type: "serverComponent", cookies });
  const {
    data: { user },
  } = await database.getAuthUser();
  if (!user) redirect("/signin");
  const profile = await database.users.getProfile(params.userId);
  if (!profile.data) notFound();
  return (
    <UserProfile
      user={profile.data}
      authProfile={user.id === profile.data.id}
    />
  );
}
