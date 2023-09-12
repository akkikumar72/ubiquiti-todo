import { DatabaseClient } from "@/util/databaseClient";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useMemo, useState } from "react";

const useUserClient = () => {
  const database = useMemo(
    () => new DatabaseClient({ type: "clientComponent" }),
    []
  );

  const [userData, setUserData] =
    useState<Database["public"]["Tables"]["profile"]["Row"]>();
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const user = await database.currentUser.profile();
      if (user.error) {
        setLoading(false);
        setIsLogged(false);
        return;
      }

      setLoading(false);
      setIsLogged(true);
      setUserData(user.data);
    };

    getUser();
  }, [database]);

  const shorthands = {
    username: userData?.name,
    id: userData?.id,
  };

  return {
    userData,
    loading,
    isLogged,
    ...shorthands,
  };
};

export default useUserClient;
