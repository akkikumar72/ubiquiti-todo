import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dateKey,
  dateOffset,
  validDate,
  makeDemoTasks,
  parseTasks,
  inView,
  selectTasks,
  dueLabel,
} from "../src/lib/tasks.ts";
const now = new Date("2026-09-25T12:00:00");
const today = "2026-09-25";
const tasks = makeDemoTasks(now);
test("today includes overdue open tasks but not historical completed work", () => {
  const overdue = { ...tasks[0], due: "2026-09-24" };
  assert.equal(inView(overdue, "today", today), true);
  assert.equal(inView({ ...overdue, status: "done" }, "today", today), false);
  assert.equal(inView({ ...overdue, due: "" }, "today", today), false);
  assert.equal(selectTasks(tasks, "today", "", "all", "due", today).length, 6);
});
test("upcoming excludes completed future tasks and unscheduled work", () => {
  assert.equal(
    selectTasks(tasks, "upcoming", "", "all", "due", today).length,
    5,
  );
  assert.equal(
    inView(
      { ...tasks[0], due: "2026-09-26", status: "done" },
      "upcoming",
      today,
    ),
    false,
  );
  assert.equal(inView({ ...tasks[0], due: "" }, "upcoming", today), false);
});
test("project, search and priority filters combine without changing source data", () => {
  const snapshot = JSON.stringify(tasks);
  const results = selectTasks(
    tasks,
    "project:Website refresh",
    "navigation",
    "high",
    "priority",
    today,
  );
  assert.equal(results.length, 1);
  assert.equal(results[0].title, "Build the responsive navigation");
  assert.equal(selectTasks(tasks, "all", "first three steps").length, 1);
  assert.equal(JSON.stringify(tasks), snapshot);
});
test("sort puts unscheduled work last and high priority first", () => {
  const input = [
    { ...tasks[0], id: "a", due: "", priority: "low" },
    { ...tasks[1], id: "b", due: "2026-09-27", priority: "high" },
  ];
  assert.equal(selectTasks(input, "all")[0].id, "b");
  assert.equal(selectTasks(input, "all", "", "all", "priority")[0].id, "b");
});
test("local data round trips including empty workspaces", () => {
  assert.deepEqual(parseTasks(JSON.stringify(tasks)), tasks);
  assert.deepEqual(parseTasks("[]"), []);
});
test("corrupt storage and duplicate IDs are rejected without silently reseeding", () => {
  for (const raw of [
    "null",
    "{}",
    "broken",
    JSON.stringify([{ ...tasks[0], status: "unknown" }]),
    JSON.stringify([{ ...tasks[0], due: "2026-02-30" }]),
    JSON.stringify([tasks[0], tasks[0]]),
  ])
    assert.throws(() => parseTasks(raw));
});
test("calendar helpers use local calendar days across month and DST changes", () => {
  assert.equal(dateKey(now), today);
  assert.equal(dateOffset(1, new Date("2026-01-31T12:00:00")), "2026-02-01");
  assert.equal(dateOffset(1, new Date("2026-03-28T12:00:00")), "2026-03-29");
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2026-02-29"), false);
  assert.equal(dueLabel("2026-09-26", today), "Tomorrow");
  assert.equal(dueLabel("", today), "No date");
});
test("completion and reopening move tasks in and out of completed view", () => {
  const task = { ...tasks[0], status: "done" };
  assert.equal(inView(task, "completed", today), true);
  assert.equal(inView({ ...task, status: "todo" }, "completed", today), false);
});
