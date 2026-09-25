"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DatabaseClient } from "@/util/databaseClient";
import { makeDemoTasks, parseTasks, STORAGE_KEY, Task } from "@/lib/tasks";

type Row = Database["public"]["Tables"]["tweets"]["Row"];
const fromRow = (row: Row): Task => ({
  id: row.id,
  title: row.title,
  notes: row.notes || "",
  project: row.project || "Personal",
  priority: row.priority || "medium",
  status: row.is_completed ? "done" : row.status || "todo",
  due: row.due_date || "",
  createdAt: row.created_at,
});
const toRow = (task: Task) => ({
  title: task.title,
  notes: task.notes,
  project: task.project,
  priority: task.priority,
  status: task.status,
  is_completed: task.status === "done",
  due_date: task.due || null,
});
export function useTasks(cloud: boolean, userId?: string) {
  const database = useMemo(
    () => (cloud ? new DatabaseClient({ type: "clientComponent" }) : null),
    [cloud],
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);
  const current = useRef<Task[]>([]);
  const locked = useRef(false);
  const writable = useRef(true);
  const revision = useRef(0);
  const apply = useCallback((items: Task[]) => {
    current.current = items;
    setTasks(items);
  }, []);
  useEffect(() => {
    let active = true;
    if (!database) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const items = raw === null ? makeDemoTasks() : parseTasks(raw);
        apply(items);
        if (raw === null)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        writable.current = false;
        setError(
          err instanceof Error
            ? err.message
            : "Browser storage is unavailable.",
        );
      }
      setReady(true);
      const sync = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            apply(parseTasks(event.newValue));
          } catch {
            writable.current = false;
            setError(
              "Another tab saved unreadable data. Reload after checking your storage.",
            );
          }
        }
      };
      window.addEventListener("storage", sync);
      return () => window.removeEventListener("storage", sync);
    }
    const refresh = async () => {
      const request = ++revision.current;
      try {
        const { data, error } = await database.tweets.getAll();
        if (!active || request !== revision.current) return;
        if (error) throw error;
        apply((data || []).map(fromRow));
        setError("");
      } catch {
        if (active && request === revision.current)
          setError(
            "Could not load cloud tasks. Check the Supabase connection and the schema in the README.",
          );
      } finally {
        if (active && request === revision.current) setReady(true);
      }
    };
    void refresh();
    const channel = database.instance
      .channel("daymark-tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tweets" },
        () => {
          void refresh();
        },
      )
      .subscribe((status) => {
        if (active) setLive(status === "SUBSCRIBED");
      });
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      void database.instance.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [database, apply]);
  const save = async (task: Task, remove = false): Promise<boolean> => {
    if (!ready || locked.current) return false;
    if (!database && !writable.current) {
      setError(
        "Storage is unavailable or unreadable. Export a backup, then reset the demo in Settings.",
      );
      return false;
    }
    locked.current = true;
    setBusy(true);
    setError("");
    ++revision.current;
    try {
      let result = task;
      if (database) {
        if (remove) {
          const { error } = await database.tweets.remove(task.id);
          if (error) throw error;
        } else if (current.current.some((t) => t.id === task.id)) {
          const { data, error } = await database.tweets.update(
            task.id,
            toRow(task),
          );
          if (error) throw error;
          result = fromRow(data);
        } else {
          if (!userId) throw new Error("Sign in again to save this task.");
          const { data, error } = await database.tweets.insert({
            ...toRow(task),
            id: task.id,
            created_at: task.createdAt,
            user_id: userId,
          });
          if (error) throw error;
          result = fromRow(data);
        }
      }
      const next = remove
        ? current.current.filter((t) => t.id !== task.id)
        : current.current.some((t) => t.id === task.id)
        ? current.current.map((t) => (t.id === task.id ? result : t))
        : [result, ...current.current];
      if (!database) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      apply(next);
      return true;
    } catch (err) {
      setError(
        database
          ? "Could not save the task. Check your connection and run the Daymark schema migration if this is an older database."
          : "Could not save to browser storage. Your previous data is unchanged. Export a backup in Settings.",
      );
      return false;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  const reset = () => {
    try {
      const items = makeDemoTasks();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      apply(items);
      writable.current = true;
      setError("");
      return true;
    } catch {
      setError(
        "Browser storage is unavailable. Enable site storage to use the local demo.",
      );
      return false;
    }
  };
  return { tasks, ready, busy, error, live, save, reset };
}
