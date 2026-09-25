"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  PiSun,
  PiCalendarBlank,
  PiStack,
  PiCheckCircle,
  PiMagnifyingGlass,
  PiPlus,
  PiList,
  PiSquaresFour,
  PiSlidersHorizontal,
  PiArrowUpRight,
  PiArrowRight,
  PiCaretRight,
  PiGearSix,
  PiQuestion,
  PiFlag,
  PiCheck,
  PiDownloadSimple,
  PiArrowCounterClockwise,
  PiX,
} from "react-icons/pi";
import Brand from "@/components/ui/Brand";
import Dialog from "@/components/ui/Dialog";
import TaskEditor from "./TaskEditor";
import { useTasks } from "@/hooks/useTasks";
import {
  dateKey,
  dateOffset,
  dueLabel,
  inView,
  PROJECTS,
  selectTasks,
  STORAGE_KEY,
  Task,
  View,
} from "@/lib/tasks";
import { cloudConfigured } from "@/lib/config";

const navItems = [
  { id: "today", label: "My day", icon: PiSun },
  { id: "upcoming", label: "Upcoming", icon: PiCalendarBlank },
  { id: "all", label: "All tasks", icon: PiStack },
  { id: "completed", label: "Completed", icon: PiCheckCircle },
] as const;
const titles: Record<string, string> = {
  today: "My day",
  upcoming: "A clear view of what’s next.",
  all: "Everything, in one place.",
  completed: "Good work. All accounted for.",
};
const descriptions: Record<string, string> = {
  today: "Turn the things on your mind into a plan for your day.",
  upcoming:
    "Plan ahead, set your priorities, and keep your next steps in sight.",
  all: "The big ideas and the small steps that get you there.",
  completed: "Small steps add up. Here’s what you’ve finished.",
};
export default function Home({
  cloud,
  userId,
  userName,
  initialToday,
}: {
  cloud: boolean;
  userId?: string;
  userName?: string;
  initialToday: string;
}) {
  const { tasks, ready, busy, error, live, save, reset } = useTasks(
    cloud,
    userId,
  );
  const params = useSearchParams();
  const raw = params.get("view") || "today";
  const view: View =
    ["today", "upcoming", "all", "completed"].includes(raw) ||
    raw.startsWith("project:")
      ? (raw as View)
      : "today";
  const [today, setToday] = useState(initialToday);
  const [query, setQuery] = useState("");
  const [capture, setCapture] = useState("");
  const [priority, setPriority] = useState("all");
  const [sort, setSort] = useState("due");
  const [layout, setLayout] = useState<"list" | "board">("list");
  const [editor, setEditor] = useState<Task | null>(null);
  const [modal, setModal] = useState<"settings" | "help" | "project" | null>(
    null,
  );
  const [menu, setMenu] = useState(false);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [undo, setUndo] = useState<Task | null>(null);
  const [toast, setToast] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectError, setProjectError] = useState("");
  const [extraProjects, setExtraProjects] = useState<string[]>([]);
  const [resetConfirm, setResetConfirm] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const projects = Array.from(
    new Set([...PROJECTS, ...tasks.map((t) => t.project), ...extraProjects]),
  );
  const filtered = useMemo(
    () => selectTasks(tasks, view, query, priority, sort, today),
    [tasks, view, query, priority, sort, today],
  );
  const openTasks = tasks.filter((t) => t.status !== "done");
  const done = tasks.length - openTasks.length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const focusTask = selectTasks(
    openTasks,
    "today",
    "",
    "all",
    "priority",
    today,
  )[0];
  const editingExisting = editor
    ? tasks.some((t) => t.id === editor.id)
    : false;
  const newTask = (
    status: Task["status"] = "todo",
    project?: string,
    title = "",
  ) => {
    if (!ready) return;
    setEditor({
      id: crypto.randomUUID(),
      title,
      notes: "",
      priority: "medium",
      status,
      due: view === "upcoming" ? dateOffset(1) : today,
      project:
        project || (view.startsWith("project:") ? view.slice(8) : "Personal"),
      createdAt: new Date().toISOString(),
    });
  };
  useEffect(() => {
    setQuery("");
    setPriority("all");
    setMenu(false);
  }, [view]);
  useEffect(() => {
    setToday(dateKey());
    const timer = window.setInterval(() => setToday(dateKey()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || document.querySelector("dialog[open]")) return;
      const el = e.target as HTMLElement;
      const typing =
        ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) ||
        el.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (
        !typing &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        e.key.toLowerCase() === "n"
      ) {
        e.preventDefault();
        newTask();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const href = (next: string) =>
    `/?view=${encodeURIComponent(next)}${
      params.get("demo") === "1" ? "&demo=1" : ""
    }`;
  const nav = () => (
    <>
      <div className="sidebar-head">
        <Brand />
        <span className="workspace-label">
          [ {cloud ? "shared workspace" : "personal workspace"} ]
        </span>
      </div>
      <button
        className="add-task-side"
        onClick={() => {
          setMenu(false);
          newTask();
        }}
        disabled={!ready}
      >
        <PiPlus />
        Add a task<kbd>N</kbd>
      </button>
      <nav aria-label="Workspace navigation">
        <div className="nav-group">
          {navItems.map(({ id, label, icon: Icon }) => (
            <Link
              className={`nav-item ${view === id ? "active" : ""}`}
              key={id}
              href={href(id)}
              onClick={() => setMenu(false)}
              aria-current={view === id ? "page" : undefined}
            >
              <Icon />
              <span>{label}</span>
              <span className="nav-count">
                {ready
                  ? tasks.filter(
                      (t) =>
                        inView(t, id, today) &&
                        (id === "completed" || t.status !== "done"),
                    ).length
                  : ""}
              </span>
            </Link>
          ))}
        </div>
        <div className="project-heading">
          <span>[ projects ]</span>
          <button
            className="icon-button"
            aria-label="Create project"
            disabled={!ready}
            onClick={() => {
              setMenu(false);
              setProjectName("");
              setProjectError("");
              setModal("project");
            }}
          >
            <PiPlus />
          </button>
        </div>
        <div className="nav-group projects">
          {projects.map((p, i) => (
            <Link
              key={p}
              className={`nav-item ${view === `project:${p}` ? "active" : ""}`}
              href={href(`project:${p}`)}
              onClick={() => setMenu(false)}
              aria-current={view === `project:${p}` ? "page" : undefined}
            >
              <span className={`project-dot dot-${i % 3}`} />
              <span>{p}</span>
              <span className="nav-count">
                {ready
                  ? tasks.filter((t) => t.project === p && t.status !== "done")
                      .length
                  : ""}
              </span>
            </Link>
          ))}
        </div>
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <span className="pixel-spark" aria-hidden="true">
            ✦
          </span>
          <p>
            A clear plan.
            <br />
            <strong>Space to do your best work.</strong>
          </p>
        </div>
        <button
          className="nav-item"
          onClick={() => {
            setMenu(false);
            setModal("help");
          }}
        >
          <PiQuestion />
          <span>Help & shortcuts</span>
        </button>
        <button
          className="nav-item"
          onClick={() => {
            setMenu(false);
            setModal("settings");
          }}
        >
          <PiGearSix />
          <span>Settings</span>
        </button>
        <Link href="/user" className="profile-link">
          <span className="avatar">
            {(userName || "You").slice(0, 1).toUpperCase()}
          </span>
          <span>
            <strong>{userName || "Your workspace"}</strong>
            <small>{cloud ? "Shared cloud workspace" : "Local demo"}</small>
          </span>
          <PiCaretRight />
        </Link>
      </div>
    </>
  );
  const toggle = async (task: Task) => {
    if (
      await save({ ...task, status: task.status === "done" ? "todo" : "done" })
    )
      setToast(task.status === "done" ? "Task reopened" : "Task completed");
  };
  const row = (task: Task, board = false) => (
    <article
      className={`task-row ${task.status === "done" ? "is-done" : ""} ${
        board ? "board-card" : ""
      }`}
      key={task.id}
    >
      <button
        className={`task-check priority-${task.priority}`}
        aria-label={`${task.status === "done" ? "Reopen" : "Complete"} ${
          task.title
        }`}
        aria-pressed={task.status === "done"}
        disabled={busy}
        onClick={() => toggle(task)}
      >
        {task.status === "done" ? (
          <PiCheck />
        ) : task.status === "progress" ? (
          <span className="progress-dot" />
        ) : null}
      </button>
      <button
        className="task-open"
        onClick={() => setEditor(task)}
        aria-label={`Edit ${task.title}`}
      >
        <span className="task-name">{task.title}</span>
        {board && task.notes && (
          <span className="task-notes">{task.notes}</span>
        )}
        <span className="task-meta">
          <span
            className={`project-dot dot-${
              Math.max(0, projects.indexOf(task.project)) % 3
            }`}
          />
          {task.project}
          {!board && task.status === "progress" && (
            <span className="status-label">In progress</span>
          )}
        </span>
        {board && (
          <span
            className={`due ${
              task.due && task.due < today && task.status !== "done"
                ? "overdue"
                : ""
            }`}
          >
            <PiCalendarBlank />
            {dueLabel(task.due, today)}
          </span>
        )}
      </button>
      {!board && (
        <>
          <span
            className={`due ${
              task.due && task.due < today && task.status !== "done"
                ? "overdue"
                : ""
            }`}
          >
            {dueLabel(task.due, today)}
          </span>
          <span
            title={`${task.priority} priority`}
            className={`priority-flag priority-${task.priority}`}
          >
            <PiFlag />
            <span className="sr-only">{task.priority} priority</span>
          </span>
        </>
      )}
    </article>
  );
  const exportTasks = () => {
    try {
      const data = !cloud
        ? localStorage.getItem(STORAGE_KEY) || JSON.stringify(tasks)
        : JSON.stringify(tasks);
      const url = URL.createObjectURL(
        new Blob([data], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "daymark-tasks.json";
      link.click();
      URL.revokeObjectURL(url);
      setToast("Task backup downloaded");
    } catch {
      setToast(
        "Export is unavailable. Check your browser storage permissions.",
      );
    }
  };
  const title = view.startsWith("project:") ? view.slice(8) : titles[view];
  return (
    <div className="workspace">
      <a href="#main" className="skip-link">
        Skip to tasks
      </a>
      <aside className="sidebar">{nav()}</aside>
      <div className="workspace-body">
        <header className="topbar">
          <button
            className="icon-button mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setMenu(true)}
          >
            <PiList />
          </button>
          <div className="breadcrumbs">
            <span>{cloud ? "Shared workspace" : "Personal workspace"}</span>
            <PiCaretRight />
            <strong>
              {view.startsWith("project:")
                ? view.slice(8)
                : navItems.find((n) => n.id === view)?.label}
            </strong>
          </div>
          <div className="topbar-actions">
            <div className="search-box">
              <PiMagnifyingGlass />
              <input
                ref={searchRef}
                aria-label="Search this view"
                placeholder="Search this view…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query ? (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <PiX />
                </button>
              ) : (
                <kbd>⌘ K</kbd>
              )}
            </div>
            <span className={`connection ${cloud && live ? "connected" : ""}`}>
              <i />
              {cloud ? (live ? "Live sync" : "Cloud workspace") : "Local demo"}
            </span>
          </div>
        </header>
        <main
          id="main"
          className={`main-content ${
            view === "today" && !query ? "today-view" : "compact-view"
          }`}
        >
          <section className="workspace-hero" aria-labelledby="workspace-title">
            <div className="hero-grid" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="page-heading">
              <span className="eyebrow">
                [{" "}
                {view.startsWith("project:")
                  ? "project workspace"
                  : navItems
                      .find((n) => n.id === view)
                      ?.label.toLowerCase()}{" "}
                ]
              </span>
              <h1 id="workspace-title">
                {view === "today" ? (
                  <>
                    Less busywork.
                    <br />
                    More progress.
                  </>
                ) : (
                  title
                )}
              </h1>
              <p>
                {view.startsWith("project:")
                  ? "Every task, deadline, and next step for this project."
                  : descriptions[view]}
              </p>
            </div>
            <form
              className="quick-capture"
              onSubmit={(event) => {
                event.preventDefault();
                if (capture.trim()) newTask("todo", undefined, capture.trim());
              }}
            >
              <div className="capture-input-row">
                <span className="pixel-spark" aria-hidden="true">
                  ✦
                </span>
                <input
                  aria-label="Capture a task"
                  placeholder="What do you want to get done?"
                  value={capture}
                  onChange={(event) => setCapture(event.target.value)}
                  maxLength={160}
                  required
                  disabled={!ready}
                />
                <button
                  className="capture-submit"
                  aria-label="Continue with task details"
                  disabled={!ready || !capture.trim()}
                >
                  <PiArrowRight />
                </button>
              </div>
              <div className="capture-bottom">
                <span>
                  <PiCheckCircle /> Task
                </span>
                <span>
                  <PiCalendarBlank />{" "}
                  {view === "upcoming" ? "Tomorrow" : "Today"}
                </span>
                <span className="capture-hint">
                  Add details <kbd>↵</kbd>
                </span>
              </div>
            </form>
          </section>
          <div className="workspace-context">
            <span>
              {new Date(`${today}T12:00:00`).toLocaleDateString("en", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
            {!cloud && (
              <p>
                Sample tasks · saved in this browser{" "}
                <Link href="/signin">
                  {cloudConfigured ? "Connect account" : "Cloud setup"}
                  <PiArrowUpRight />
                </Link>
              </p>
            )}
          </div>
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}
          <div className="workspace-grid">
            <div className="task-area">
              <div className="task-panel-heading">
                <div>
                  <span className="eyebrow">[ your workspace ]</span>
                  <h2>
                    {view.startsWith("project:")
                      ? view.slice(8)
                      : navItems.find((n) => n.id === view)?.label}
                    <span>{ready ? filtered.length : "…"}</span>
                  </h2>
                </div>
                <button
                  className="button primary"
                  onClick={() => newTask()}
                  disabled={!ready}
                >
                  <PiPlus />
                  New task
                </button>
              </div>
              <div className="tasks-toolbar">
                <div className="view-switch" aria-label="Task layout">
                  <button
                    className={layout === "list" ? "selected" : ""}
                    aria-pressed={layout === "list"}
                    onClick={() => setLayout("list")}
                  >
                    <PiList />
                    List
                  </button>
                  <button
                    className={layout === "board" ? "selected" : ""}
                    aria-pressed={layout === "board"}
                    onClick={() => setLayout("board")}
                  >
                    <PiSquaresFour />
                    Board
                  </button>
                </div>
                <div className="filter-controls">
                  <label>
                    <PiSlidersHorizontal />
                    <span className="sr-only">Filter priority</span>
                    <select
                      aria-label="Filter priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="all">All priorities</option>
                      <option value="high">High priority</option>
                      <option value="medium">Medium priority</option>
                      <option value="low">Low priority</option>
                    </select>
                  </label>
                  <select
                    aria-label="Sort tasks"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="due">Due date</option>
                    <option value="priority">Priority</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
              {!ready ? (
                <div
                  className="task-skeleton"
                  role="status"
                  aria-label="Loading tasks"
                >
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
              ) : filtered.length === 0 ? (
                <section className="empty-state">
                  <span className="empty-symbol">
                    <PiCheckCircle />
                  </span>
                  <h2>
                    {query || priority !== "all"
                      ? "No matching tasks."
                      : view === "completed"
                      ? "Your completed work goes here."
                      : "You’re all clear."}
                  </h2>
                  <p>
                    {query || priority !== "all"
                      ? "Try another search or a different priority."
                      : view === "completed"
                      ? "Your completed tasks will collect here."
                      : "No tasks in this view. Add an idea whenever you’re ready."}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => {
                      if (query || priority !== "all") {
                        setQuery("");
                        setPriority("all");
                      } else newTask();
                    }}
                  >
                    {query || priority !== "all"
                      ? "Clear filters"
                      : "Add your first task"}
                    <PiArrowRight />
                  </button>
                </section>
              ) : layout === "board" ? (
                <div className="task-board">
                  {(["todo", "progress", "done"] as const).map((status) => (
                    <section className="board-column" key={status}>
                      <div className="section-heading">
                        <h2>
                          <span className={`status-dot ${status}`} />
                          {status === "todo"
                            ? "To do"
                            : status === "progress"
                            ? "In progress"
                            : "Completed"}
                          <span>
                            {filtered.filter((t) => t.status === status).length}
                          </span>
                        </h2>
                        <button
                          aria-label={`Add ${status} task`}
                          className="icon-button"
                          onClick={() => newTask(status)}
                        >
                          <PiPlus />
                        </button>
                      </div>
                      {filtered
                        .filter((t) => t.status === status)
                        .map((task) => row(task, true))}
                      {!filtered.some((t) => t.status === status) && (
                        <p className="column-empty">Room for your next step.</p>
                      )}
                    </section>
                  ))}
                </div>
              ) : (
                <div className="task-list">
                  {[
                    {
                      label:
                        view === "upcoming" ? "On the horizon" : "To focus on",
                      items: filtered.filter((t) => t.status !== "done"),
                    },
                    {
                      label: "Completed",
                      items: filtered.filter((t) => t.status === "done"),
                    },
                  ]
                    .filter((group) => group.items.length)
                    .map((group) => (
                      <section className="task-section" key={group.label}>
                        <div className="section-heading">
                          <h2>
                            {group.label}
                            <span>{group.items.length}</span>
                          </h2>
                          {group.label === "Completed" && (
                            <PiCheckCircle className="completed-icon" />
                          )}
                        </div>
                        {group.items.map((task) => row(task))}
                      </section>
                    ))}
                </div>
              )}
              <button
                className="inline-add"
                disabled={!ready}
                onClick={() => newTask()}
              >
                <PiPlus />
                Add a task<span>Capture your next step.</span>
              </button>
              <p className="list-footer">
                <span>
                  {filtered.length} {filtered.length === 1 ? "task" : "tasks"}{" "}
                  in this view
                </span>
                <span>
                  {cloud
                    ? "Shared with signed-in workspace members"
                    : "Only on this browser"}
                </span>
              </p>
            </div>
            <aside
              className="workspace-overview"
              aria-label="Workspace overview"
            >
              <section className="progress-card">
                <span className="eyebrow">[ workspace progress ]</span>
                <div className="progress-value">
                  <strong>
                    {ready ? progress : 0}
                    <small>%</small>
                  </strong>
                  <span>
                    {done} of {tasks.length}
                    <br />
                    tasks completed
                  </span>
                </div>
                <div
                  className="mini-progress"
                  role="progressbar"
                  aria-label="Workspace completion"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <i style={{ width: `${progress}%` }} />
                </div>
                <Link className="text-button" href={href("completed")}>
                  View completed
                  <PiArrowUpRight />
                </Link>
              </section>
              <section className="focus-card">
                <span className="eyebrow">[ next in focus ]</span>
                <h2>{focusTask ? focusTask.title : "Your day is clear."}</h2>
                <p className="focus-project">
                  {focusTask
                    ? focusTask.project
                    : "No unfinished tasks due today."}
                </p>
                <button
                  className="text-button"
                  onClick={() => (focusTask ? setEditor(focusTask) : newTask())}
                  disabled={!ready}
                >
                  {focusTask ? "Open task" : "Plan your next task"}
                  <PiArrowUpRight />
                </button>
              </section>
              <section className="project-overview">
                <h2 className="eyebrow">
                  [ project progress ]<span>{projects.length}</span>
                </h2>
                {projects.map((p, i) => {
                  const all = tasks.filter((t) => t.project === p);
                  const count = all.filter((t) => t.status === "done").length;
                  return (
                    <Link href={href(`project:${p}`)} key={p}>
                      <span>
                        <i className={`project-dot dot-${i % 3}`} />
                        {p}
                        <small>
                          {count}/{all.length}
                        </small>
                      </span>
                      <div className="mini-progress">
                        <i
                          style={{
                            width: `${
                              all.length ? (count / all.length) * 100 : 0
                            }%`,
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </section>
            </aside>
          </div>
        </main>
        <footer className="workspace-footer">
          <span>Less busywork. More progress.</span>
          <span>DAYMARK / YOUR EVERYDAY WORKSPACE</span>
        </footer>
      </div>
      {menu && (
        <Dialog
          title="Your workspace"
          onClose={() => setMenu(false)}
          className="mobile-navigation"
        >
          {nav()}
        </Dialog>
      )}
      {editor && (
        <TaskEditor
          key={editor.id}
          task={editor}
          busy={busy}
          projects={projects}
          onClose={() => setEditor(null)}
          onSave={async (task) => {
            const success = await save(task);
            if (success) {
              setToast(editingExisting ? "Task updated" : "Task created");
              setUndo(null);
              if (!editingExisting) setCapture("");
            }
            return success;
          }}
          onDelete={
            editingExisting
              ? () => {
                  setDeleteTask(editor);
                  setEditor(null);
                }
              : undefined
          }
        />
      )}{" "}
      {deleteTask && (
        <Dialog title="Delete this task?" onClose={() => setDeleteTask(null)}>
          <h2 className="modal-title">Delete task</h2>
          <p className="modal-copy">
            “{deleteTask.title}” will be removed. You can undo this until you
            leave or change a task.
          </p>
          <div className="dialog-footer">
            <button
              className="button secondary"
              onClick={() => setDeleteTask(null)}
            >
              Keep task
            </button>
            <button
              className="button primary"
              disabled={busy}
              onClick={async () => {
                if (await save(deleteTask, true)) {
                  setUndo(deleteTask);
                  setDeleteTask(null);
                  setToast("Task deleted");
                }
              }}
            >
              Delete task
            </button>
          </div>
        </Dialog>
      )}
      {modal === "project" && (
        <Dialog title="New project" onClose={() => setModal(null)}>
          <h2 className="modal-title">Create a project</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = projectName.trim();
              if (!name) {
                setProjectError("Enter a project name.");
                return;
              }
              if (
                projects.some((p) => p.toLowerCase() === name.toLowerCase())
              ) {
                setProjectError(
                  "That project already exists. Choose it in the sidebar.",
                );
                return;
              }
              setExtraProjects((old) => [...old, name]);
              setModal(null);
              newTask("todo", name);
            }}
          >
            <label className="field">
              <span>Project name</span>
              <input
                data-autofocus
                required
                maxLength={50}
                placeholder="Something you’re working on…"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </label>
            <p className="modal-copy">
              Start with its first task. Projects are saved with the tasks they
              contain.
            </p>
            {projectError && (
              <p role="alert" className="notice error">
                {projectError}
              </p>
            )}
            <div className="dialog-footer">
              <span />
              <button className="button primary">
                Add first task
                <PiArrowRight />
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {modal === "settings" && (
        <Dialog
          title="Workspace settings"
          onClose={() => {
            setModal(null);
            setResetConfirm(false);
          }}
        >
          <h2 className="modal-title">Workspace settings</h2>
          <p className="modal-copy">
            {cloud
              ? "You are using a shared Supabase workspace. Tasks are visible to other authenticated members."
              : "Demo tasks live in this browser’s local storage. They are not sent to a server. Export a backup before clearing site data."}
          </p>
          <div className="setting-row">
            <div>
              <strong>Task backup</strong>
              <p>Download the current data as JSON.</p>
            </div>
            <button className="button secondary" onClick={exportTasks}>
              <PiDownloadSimple />
              Export
            </button>
          </div>
          <div className="setting-row">
            <div>
              <strong>Account</strong>
              <p>
                {cloud
                  ? "Your profile and sign-out controls."
                  : "Use Supabase for a shared cloud workspace."}
              </p>
            </div>
            <Link className="text-button" href={cloud ? "/user" : "/signin"}>
              {cloud ? "Profile" : "Sign in"}
              <PiArrowUpRight />
            </Link>
          </div>
          {!cloud && (
            <div className="setting-row">
              <div>
                <strong>Start fresh</strong>
                <p>Replace local tasks with the sample set.</p>
              </div>
              <button
                className="text-button danger"
                onClick={() => setResetConfirm(true)}
              >
                <PiArrowCounterClockwise />
                Reset demo
              </button>
            </div>
          )}
          {resetConfirm && (
            <div className="reset-confirm">
              <p>
                This replaces your local tasks. Export a backup first if you
                want to keep them.
              </p>
              <button
                className="button secondary"
                onClick={() => setResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="button primary"
                onClick={() => {
                  if (reset()) {
                    setResetConfirm(false);
                    setExtraProjects([]);
                    setUndo(null);
                    setToast("Demo restored");
                  }
                }}
              >
                Replace local tasks
              </button>
            </div>
          )}
        </Dialog>
      )}
      {modal === "help" && (
        <Dialog title="Help & shortcuts" onClose={() => setModal(null)}>
          <h2 className="modal-title">
            Less figuring out.
            <br />
            More getting things done.
          </h2>
          <div className="help-item">
            <kbd>N</kbd>
            <div>
              <strong>Capture a task</strong>
              <p>Add a name, a project, and a date. The rest can come later.</p>
            </div>
          </div>
          <div className="help-item">
            <kbd>⌘ / Ctrl K</kbd>
            <div>
              <strong>Find your next step</strong>
              <p>Search task names, notes, and projects in the current view.</p>
            </div>
          </div>
          <div className="help-item">
            <kbd>↵</kbd>
            <div>
              <strong>Keep it moving</strong>
              <p>
                Open a task to edit its details or move it from To do to In
                progress. Check its box to complete it.
              </p>
            </div>
          </div>
          <div className="help-item">
            <kbd>Esc</kbd>
            <div>
              <strong>Back to your space</strong>
              <p>Close a dialog. Use Tab to move between controls.</p>
            </div>
          </div>
          <p className="modal-copy">
            My day includes unfinished tasks due today or earlier. Upcoming
            shows future tasks. Create a project by giving its first task a new
            project name.
          </p>
          <a
            className="text-button"
            href="https://github.com/akkikumar72/ubiquiti-todo"
            target="_blank"
            rel="noreferrer"
          >
            About this open-source project
            <PiArrowUpRight />
          </a>
        </Dialog>
      )}
      {(toast || undo) && (
        <div className="toast" role="status">
          <PiCheckCircle />
          {toast || (undo ? "Task deleted" : "")}
          {undo && (
            <button
              disabled={busy}
              onClick={async () => {
                if (await save(undo)) {
                  setUndo(null);
                  setToast("Task restored");
                }
              }}
            >
              Undo
            </button>
          )}
          <button
            aria-label="Dismiss notification"
            onClick={() => {
              setToast("");
              setUndo(null);
            }}
          >
            <PiX />
          </button>
        </div>
      )}
    </div>
  );
}
