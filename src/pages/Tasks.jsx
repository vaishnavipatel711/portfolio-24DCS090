import { useCallback, useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import Toast from '../components/Toast';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // initial load
  const [error, setError] = useState(null); // load error
  const [creating, setCreating] = useState(false); // POST in progress
  const [busyId, setBusyId] = useState(null); // PUT/DELETE in progress (task id)
  const [toast, setToast] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTasks();
        if (!cancelled) setTasks(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // State is updated from the SERVER response, never assumed.
  async function handleCreate(task) {
    setCreating(true);
    try {
      const created = await createTask(task);
      setTasks((prev) => [created, ...prev]);
      setToast({ type: 'success', message: 'Task created' });
      return true;
    } catch (err) {
      setToast({ type: 'error', message: err.message });
      return false;
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id, changes, successMessage) {
    setBusyId(id);
    try {
      const updated = await updateTask(id, changes);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      setToast({ type: 'success', message: successMessage });
      return true;
    } catch (err) {
      setToast({ type: 'error', message: err.message });
      return false;
    } finally {
      setBusyId(null);
    }
  }

  const handleToggle = (task) =>
    handleUpdate(task._id, { completed: !task.completed }, 'Task updated');

  const handleRename = (id, title) => handleUpdate(id, { title }, 'Title updated');

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setBusyId(task._id);
    try {
      await deleteTask(task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      setToast({ type: 'success', message: 'Task deleted' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="section">
      <h2>Task Manager</h2>
      <p className="muted">Full-stack demo: React + Express + MongoDB</p>

      <TaskForm onCreate={handleCreate} busy={creating} />

      {loading && <Spinner label="Loading tasks..." />}
      {!loading && error && (
        <ErrorMessage message={error} onRetry={() => setAttempt((a) => a + 1)} />
      )}
      {!loading && !error && tasks.length === 0 && <p>No tasks yet. Add one above.</p>}
      {!loading && !error && tasks.length > 0 && (
        <ul className="task-list">
          {tasks.map((t) => (
            <TaskItem
              key={t._id}
              task={t}
              busy={busyId === t._id}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      <Toast toast={toast} onClose={closeToast} />
    </section>
  );
}

export default Tasks;
