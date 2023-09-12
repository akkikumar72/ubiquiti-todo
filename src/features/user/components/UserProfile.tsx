"use client";

import {
  BackButton,
  Button,
  CardFooter,
  ErrorBlock,
  Label,
  SubHeading,
} from "@/components/ui";
import { routes } from "@/constants";
import useFeedback from "@/hooks/useFeedback";
import { useRouter } from "next/navigation";
import { RxExit } from "react-icons/rx";
import { DatabaseClient } from "@/util/databaseClient";

interface Props {
  user: Database["public"]["Tables"]["profile"]["Row"];
  authProfile?: boolean;
}

const UserProfile = ({ user, authProfile }: Props) => {
  const { loading, setLoading, error, setError } = useFeedback();
  const { replace } = useRouter();

  const database = new DatabaseClient({ type: "clientComponent" });

  const signOut = async () => {
    setLoading(true);
    const { error } = await database.signOutUser();
    if (error) {
      setError(error.message);
      return;
    }
    replace(routes.auth.signin);
  };

  return (
    <>
      <div className="flex justify-between">
        <BackButton href={routes.home}>Back to todo</BackButton>
        {authProfile && <div>Hey 👋🏻</div>}
      </div>
      {error && <ErrorBlock>{error}</ErrorBlock>}
      <div className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-zinc-800 to-zinc-800/30 p-4">
        <div className="flex h-full flex-col justify-between">
          <Label className="leading-none">user profile</Label>
          <SubHeading className="leading-none mt-4">{user.name}</SubHeading>
        </div>
      </div>
      <CardFooter>
        <Button
          loading={loading}
          onClick={signOut}
          variant="danger"
          size="small"
          icon={<RxExit />}
        >
          Sign out
        </Button>
      </CardFooter>
    </>
  );
};

export default UserProfile;
