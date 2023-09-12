import { cookies } from "next/headers";
import { DatabaseClient } from "@/util/databaseClient";
import Home from "@/features/home/components/Home";
import { redirect } from "next/navigation";
import { routes } from "@/constants";

const HomePage = async () => {
  const database = new DatabaseClient({ type: "serverComponent", cookies });
  const {
    data: { user },
  } = await database.getAuthUser();

  const { data } = await database.tweets.getAll();

  if (!user || !data) {
    redirect(routes.auth.signin);
  }

  return <Home Todo={data || []} />;
};

export default HomePage;
