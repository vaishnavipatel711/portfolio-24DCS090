import { useState } from 'react';

function TaskForm({ onCreate, busy }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  async function handleSubmit(e) {
    e.preventDefault();
    // Only clear the form if the server accepted the task.
    const ok = await onCreate({ title, description, priority });
    if (ok) {
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title (required)"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit" disabled={busy}>
        {busy ? 'Adding...' : 'Add task'}
      </button>
    </form>
  );
}

export default TaskForm;
