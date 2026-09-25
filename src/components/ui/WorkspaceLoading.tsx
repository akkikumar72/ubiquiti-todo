export default function WorkspaceLoading() {
  return (
    <div className="error-page" role="status" aria-label="Loading workspace">
      <div className="eyebrow">DAYMARK</div>
      <div className="task-skeleton">
        <div />
        <div />
        <div />
      </div>
      <span className="sr-only">Loading your workspace</span>
    </div>
  );
}
