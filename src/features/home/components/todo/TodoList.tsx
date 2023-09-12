"use client";

import { experimental_useOptimistic as useOptimistic, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import TodoSingle from "./TodoSingle";

const TodoList = ({ tweets }: { tweets: TweetType[] }) => {
  const [optimisticState, addOptimisticState] = useOptimistic<
    TweetType[],
    TweetType
  >(tweets, (currentOptimisticTweets, newTweets) => {
    const newOptimisticTweet = [...currentOptimisticTweets];
    const index = newOptimisticTweet.findIndex(
      (tweet) => tweet.id === newTweets.id
    );
    newOptimisticTweet[index] = newTweets;
    return newOptimisticTweet;
  });

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("realTime tweet")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tweets",
        },
        (payload) => {
          router.refresh();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  return <TodoSingle tweets={tweets}></TodoSingle>;
};
export default TodoList;
