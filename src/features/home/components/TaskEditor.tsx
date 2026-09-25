"use client";
import { FormEvent, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import { PROJECTS, Task, validDate } from "@/lib/tasks";
import { PiArrowRight, PiTrash } from "react-icons/pi";
export default function TaskEditor({
  task,
  busy,
  onSave,
  onDelete,
  onClose,
  projects,
}: {
  task: Task;
  busy: boolean;
  onSave: (t: Task) => Promise<boolean>;
  onDelete?: () => void;
  onClose: () => void;
  projects: string[];
}) {
  const [draft, setDraft] = useState(task);
  const [error, setError] = useState("");
  const change = (key: keyof Task, value: string) =>
    setDraft((old) => ({ ...old, [key]: value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      setError("Give your task a name.");
      return;
    }
    if (draft.due && !validDate(draft.due)) {
      setError("Choose a valid due date.");
      return;
    }
    setError("");
    if (
      await onSave({
        ...draft,
        title: draft.title.trim(),
        project: draft.project.trim() || "Personal",
      })
    )
      onClose();
    else
      setError(
        "The task could not be saved. Check your connection or available browser storage, then try again.",
      );
  };
  return (
    <Dialog
      title={onDelete ? "Task details" : "New task"}
      onClose={onClose}
      className="task-dialog"
    >
      <form onSubmit={submit}>
        <label className="sr-only" htmlFor="task-title">
          Task name
        </label>
        <textarea
          id="task-title"
          className="task-title-input"
          placeholder="What would you like to do?"
          maxLength={160}
          rows={2}
          required
          data-autofocus
          value={draft.title}
          onChange={(e) => change("title", e.target.value)}
        />
        <label className="field">
          <span>Notes</span>
          <textarea
            placeholder="A few details, an idea, a next step…"
            maxLength={4000}
            rows={4}
            value={draft.notes}
            onChange={(e) => change("notes", e.target.value)}
          />
        </label>
        <div className="form-grid">
          <label className="field">
            <span>Project</span>
            <input
              list="project-options"
              value={draft.project}
              maxLength={50}
              onChange={(e) => change("project", e.target.value)}
              required
            />
            <datalist id="project-options">
              {Array.from(new Set([...PROJECTS, ...projects])).map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span>Due date</span>
            <input
              type="date"
              value={draft.due}
              onChange={(e) => change("due", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Priority</span>
            <select
              value={draft.priority}
              onChange={(e) => change("priority", e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select
              value={draft.status}
              onChange={(e) => change("status", e.target.value)}
            >
              <option value="todo">To do</option>
              <option value="progress">In progress</option>
              <option value="done">Completed</option>
            </select>
          </label>
        </div>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        <footer className="dialog-footer">
          {onDelete ? (
            <button
              type="button"
              className="text-button danger"
              disabled={busy}
              onClick={onDelete}
            >
              <PiTrash />
              Delete task
            </button>
          ) : (
            <span className="quiet">Details can change as you go.</span>
          )}
          <button className="button primary" disabled={busy} type="submit">
            {busy ? "Saving…" : "Save task"}
            <PiArrowRight />
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
