export const PROJECTS = [
  "Website refresh",
  "Product design",
  "Personal",
] as const;
export const STATUSES = ["todo", "progress", "done"] as const;
export type Status = (typeof STATUSES)[number];
export type Priority = "high" | "medium" | "low";
export type Task = {
  id: string;
  title: string;
  notes: string;
  project: string;
  priority: Priority;
  status: Status;
  due: string;
  createdAt: string;
};
export type View =
  | "today"
  | "upcoming"
  | "all"
  | "completed"
  | `project:${string}`;
export const STORAGE_KEY = "daymark.tasks.v1";
export function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dateOffset(days: number, from = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && dateKey(date) === value;
}
export function parseTasks(raw: string): Task[] {
  const tasks: unknown = JSON.parse(raw);
  if (
    !Array.isArray(tasks) ||
    tasks.some(
      (t) =>
        !t ||
        typeof t.id !== "string" ||
        !t.id ||
        typeof t.title !== "string" ||
        !t.title.trim() ||
        t.title.length > 160 ||
        typeof t.notes !== "string" ||
        typeof t.project !== "string" ||
        !["high", "medium", "low"].includes(t.priority) ||
        !STATUSES.includes(t.status) ||
        typeof t.due !== "string" ||
        (t.due && !validDate(t.due)) ||
        typeof t.createdAt !== "string" ||
        Number.isNaN(Date.parse(t.createdAt)),
    )
  ) {
    throw new Error(
      "Saved tasks could not be read. Your stored data has not been changed.",
    );
  }
  if (new Set(tasks.map((t) => t.id)).size !== tasks.length)
    throw new Error(
      "Saved tasks contain duplicate IDs. Your stored data has not been changed.",
    );
  return tasks;
}
export function inView(task: Task, view: View, today = dateKey()): boolean {
  if (view === "completed") return task.status === "done";
  if (view === "today")
    return Boolean(
      task.due &&
        (task.status === "done" ? task.due === today : task.due <= today),
    );
  if (view === "upcoming")
    return Boolean(task.due && task.due > today && task.status !== "done");
  if (view.startsWith("project:")) return task.project === view.slice(8);
  return true;
}
export function selectTasks(
  tasks: Task[],
  view: View,
  query = "",
  priority = "all",
  sort = "due",
  today = dateKey(),
): Task[] {
  const rank = { high: 0, medium: 1, low: 2 };
  const term = query.trim().toLowerCase();
  return tasks
    .filter(
      (t) =>
        inView(t, view, today) &&
        (!term ||
          `${t.title} ${t.notes} ${t.project}`.toLowerCase().includes(term)) &&
        (priority === "all" || t.priority === priority),
    )
    .sort((a, b) =>
      sort === "priority"
        ? rank[a.priority] - rank[b.priority] || a.title.localeCompare(b.title)
        : sort === "newest"
        ? b.createdAt.localeCompare(a.createdAt)
        : (a.due || "9999").localeCompare(b.due || "9999") ||
          rank[a.priority] - rank[b.priority],
    );
}
export function dueLabel(due: string, today = dateKey()): string {
  if (!due) return "No date";
  if (due === today) return "Today";
  if (due === dateOffset(1, new Date(`${today}T12:00:00`))) return "Tomorrow";
  return new Date(`${due}T12:00:00`).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    ...(due.slice(0, 4) !== today.slice(0, 4)
      ? { year: "numeric" as const }
      : {}),
  });
}
export function makeDemoTasks(now = new Date()): Task[] {
  const rows: [string, string, Priority, Status, number, string][] = [
    [
      "Refine the homepage direction",
      "Website refresh",
      "high",
      "progress",
      0,
      "Explore a quieter composition, with more room for the typography. Bring two directions to the next review.",
    ],
    [
      "Map out the onboarding flow",
      "Product design",
      "high",
      "todo",
      0,
      "Sketch the first three steps and the empty states. Keep the first useful action close.",
    ],
    [
      "Collect references for the new identity",
      "Website refresh",
      "medium",
      "todo",
      0,
      "Look at editorial layouts, material textures, and a warmer palette.",
    ],
    [
      "Make time for a long walk",
      "Personal",
      "low",
      "todo",
      0,
      "A little space away from the screen.",
    ],
    [
      "Review the current website",
      "Website refresh",
      "medium",
      "done",
      0,
      "Navigation, mobile behavior, typography, and the content hierarchy.",
    ],
    [
      "Write the project brief",
      "Product design",
      "high",
      "done",
      0,
      "One page on the problem, the people, and what a good outcome looks like.",
    ],
    [
      "Explore the component library",
      "Product design",
      "medium",
      "progress",
      1,
      "Start with inputs, buttons, and useful feedback states.",
    ],
    [
      "Plan next week’s priorities",
      "Personal",
      "low",
      "todo",
      2,
      "Leave some breathing room between the bigger pieces of work.",
    ],
    [
      "Build the responsive navigation",
      "Website refresh",
      "high",
      "todo",
      3,
      "Use the same destinations on desktop and mobile. Check keyboard behavior.",
    ],
    [
      "Prepare the design handoff",
      "Product design",
      "medium",
      "todo",
      5,
      "Include the less visible states: empty, loading, error, and success.",
    ],
    [
      "Save a few ideas for later",
      "Personal",
      "low",
      "todo",
      14,
      "A place for ideas that do not need attention today.",
    ],
  ];
  return rows.map(([title, project, priority, status, days, notes], i) => ({
    id: `demo-${i + 1}`,
    title,
    project,
    priority,
    status,
    notes,
    due: dateOffset(days, now),
    createdAt: new Date(now.getTime() - i * 60000).toISOString(),
  }));
}
