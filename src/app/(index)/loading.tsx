import { CardFooter, Skeleton } from "@/components/ui";

const UserLoading = async () => {
    return (
        <div  className="mx-auto max-w-5xl flex flex-col gap-12 px-3 py-8 md:py-12">
            <div className="flex justify-between">
                <Skeleton className="w-1/5" />
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 gap-5">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
};

export default UserLoading;
