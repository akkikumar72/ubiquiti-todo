"use client";

import useFeedback from "@/hooks/useFeedback";
import { DatabaseClient } from "@/util/databaseClient";
import { Card, ErrorBlock, Input } from "@/components/ui";
import { FcTodoList } from "react-icons/fc";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
export const dynamic = "force-dynamic";

const schema = z.object({
  title: z.string().min(3, "Minimum 3 characters"),
});

type FormData = z.infer<typeof schema>;

export default function NewTodo() {
  const { setError, error, setLoading, loading, success } = useFeedback();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const addTodo = async (formData: FormData) => {
    setLoading(true);
    const { title } = formData;
    const database = new DatabaseClient({ type: "clientComponent" });
    const {
      data: { user },
    } = await database.getAuthUser();
    const { insert } = database.tweets;

    if (user && title) {
      const { data, error } = await insert({ title, user_id: user.id });
      setLoading(false);
      reset();

      if (error) {
        setError(error.message);
        return;
      }
    }
  };
  return (
    <section className="max-h-screen">
      <div className="mx-auto max-w-4xl px-4 pb-10">
        {errors?.title && <ErrorBlock>{errors?.title?.message}</ErrorBlock>}
        <Card>
          <form onSubmit={handleSubmit(addTodo)}>
            <Input
              title={"title"}
              label={"Start typing something"}
              placeholder="Create a new todo..."
              icon={<FcTodoList />}
              loading={loading}
              error={error || undefined}
              {...register("title")}
            />
          </form>
        </Card>
      </div>
    </section>
  );
}
