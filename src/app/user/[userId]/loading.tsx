import { CardFooter, Skeleton } from "@/components/ui";

const UserLoading = async () => {
  return (
    <>
      <div className="flex justify-between">
        <Skeleton className="w-1/5" />
      </div>
      <Skeleton className="h-24 w-full" />
      <CardFooter>
        <Skeleton className="h-8 w-32" />
      </CardFooter>
    </>
  );
};

export default UserLoading;
