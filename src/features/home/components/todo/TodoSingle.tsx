import { Button, Card, Divider, ErrorBlock, Transition } from "@/components/ui";
import { twMerge } from "tailwind-merge";
import {
  RxCrossCircled,
  RxCheckCircled,
  RxExclamationTriangle,
} from "react-icons/rx";
import EmptyTodo from "@/features/home/components/todo/EmptyTodo";
import { DatabaseClient } from "@/util/databaseClient";
import useFeedback from "@/hooks/useFeedback";

const TodoSingle = ({ tweets }: { tweets: TweetType[] }) => {
  const database = new DatabaseClient({ type: "clientComponent" });
  const { error, setError } = useFeedback();
  const { update, remove } = database.tweets;

  const handleMarkAsComplete = async (userId: string) => {
    const { data, error } = await update(userId, { is_completed: true });
    if (error) {
      setError(error?.message);
    }
  };
  const handleMarkAsNotComplete = async (userId: string) => {
    const { data, error } = await update(userId, { is_completed: false });
    if (error) {
      setError(error?.message);
    }
  };

  const handleDeleteTodo = async (titleId: string) => {
    const { data, error } = await remove(titleId);
    if (error) {
      setError(error?.message);
    }
  };
  if (!tweets || !tweets.length) {
    return <EmptyTodo />;
  }
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-3 py-8 md:py-12">
      {error && <ErrorBlock>{error}</ErrorBlock>}
      <Card className="gap-0">
        {tweets?.map((tweet, index) => (
          <Transition state={!error ? true : false} key={tweet?.id}>
            <div className="flex items-center ">
              <span
                className={twMerge(
                  "text-grey-darkest line-clamp-2 w-full overflow-hidden truncate text-clip font-semibold",
                  tweet.is_completed && "text-green-700 line-through",
                )}
              >
                {tweet?.title}
              </span>
              {tweet.is_completed ? (
                <Button
                  variant="white"
                  icon={<RxExclamationTriangle />}
                  onClick={() => handleMarkAsNotComplete(tweet.id)}
                  className="flex-no-shrink ml-2 border-2 p-2"
                >
                  Not Done
                </Button>
              ) : (
                <Button
                  variant="primary"
                  icon={<RxCheckCircled />}
                  onClick={() => handleMarkAsComplete(tweet.id)}
                  className="flex-no-shrink ml-2 border-2 p-2"
                >
                  Done
                </Button>
              )}

              <Button
                variant="danger"
                icon={<RxCrossCircled />}
                onClick={() => handleDeleteTodo(tweet.id)}
                className="flex-no-shrink ml-2 border-2 p-2"
              >
                Remove
              </Button>
            </div>
            {index !== tweets?.length - 1 && <Divider />}
          </Transition>
        ))}
      </Card>
    </div>
  );
};

export default TodoSingle;
