import { useState } from 'react';

function TaskItem({ task, busy, onToggle, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  async function save() {
    const ok = await onRename(task._id, draft);
    if (ok) setEditing(false);
  }

  return (
    <li className={`task ${task.completed ? 'done' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        disabled={busy}
        onChange={() => onToggle(task)}
      />

      {editing ? (
        <>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button type="button" disabled={busy} onClick={save}>Save</button>
          <button type="button" onClick={() => { setEditing(false); setDraft(task.title); }}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="task-title">
            {task.title}
            {task.description && <small className="muted"> - {task.description}</small>}
          </span>
          <span className={`badge ${task.priority}`}>{task.priority}</span>
          <button type="button" disabled={busy} onClick={() => setEditing(true)}>Edit</button>
          <button type="button" className="danger" disabled={busy} onClick={() => onDelete(task)}>
            Delete
          </button>
        </>
      )}
    </li>
  );
}

export default TaskItem;
