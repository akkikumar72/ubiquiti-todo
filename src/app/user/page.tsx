import { cloudConfigured } from "@/lib/config";
import { DatabaseClient } from "@/util/databaseClient";
import { cookies } from "next/headers";
import UserProfile from "@/features/user/components/UserProfile";
export default async function UserPage() {
  if (!cloudConfigured) return <UserProfile />;
  const database = new DatabaseClient({ type: "serverComponent", cookies });
  const {
    data: { user },
  } = await database.getAuthUser();
  if (!user) return <UserProfile />;
  const profile = await database.users.getProfile(user.id);
  return (
    <UserProfile
      user={
        profile.data || {
          id: user.id,
          name:
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Your account",
          username: null,
          avatar_url: null,
        }
      }
      authProfile
    />
  );
}
