import React, { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  login,
  getAccessToken,
  clearTokens
} from "./api.js";

const emptyForm = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: ""
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [auth, setAuth] = useState({
    username: "admin",
    password: "admin"
  });
  const [isAuthed, setIsAuthed] = useState(Boolean(getAccessToken()));
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    sortBy: "createdAt",
    direction: "desc"
  });

  async function load(nextFilters = filters) {
    try {
      const data = await getTasks(nextFilters);
      setTasks(data);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    }
  }

  useEffect(() => {
    if (isAuthed) {
      load();
    }
  }, [isAuthed]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleAuthChange(e) {
    const { name, value } = e.target;
    setAuth({ ...auth, [name]: value });
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;
    const next = { ...filters, [name]: value };
    setFilters(next);
    if (isAuthed) {
      load(next);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      await login(auth.username, auth.password);
      setIsAuthed(true);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  function handleLogout() {
    clearTokens();
    setIsAuthed(false);
    setTasks([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await createTask({
        ...form,
        dueDate: form.dueDate || null
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message || "Failed to create task");
    }
  }

  async function toggleDone(task) {
    const nextStatus = task.status === "DONE" ? "TODO" : "DONE";
    setError("");
    try {
      await updateTask(task.id, { ...task, status: nextStatus });
      load();
    } catch (err) {
      setError(err.message || "Failed to update task");
    }
  }

  async function removeTask(id) {
    setError("");
    try {
      await deleteTask(id);
      load();
    } catch (err) {
      setError(err.message || "Failed to delete task");
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Task Manager</h1>
        <p>Simple CRUD demo with Spring Boot + React</p>
        <div className="auth-bar">
          {isAuthed ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <span>Login required</span>
          )}
        </div>
      </header>

      {!isAuthed && (
        <section className="card">
          <h2>Login</h2>
          <form onSubmit={handleLogin} className="form">
            <input
              name="username"
              placeholder="Username"
              value={auth.username}
              onChange={handleAuthChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={auth.password}
              onChange={handleAuthChange}
              required
            />
            <button type="submit">Login</button>
          </form>
        </section>
      )}

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Create Task</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
          />
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="card">
        <h2>Tasks</h2>
        <div className="filters">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
            <option value="createdAt">Created</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>
          <select name="direction" value={filters.direction} onChange={handleFilterChange}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
        <div className="list">
          {tasks.map((task) => (
            <div key={task.id} className={`task ${task.status === "DONE" ? "done" : ""}`}>
              <div>
                <strong>{task.title}</strong>
                <div className="meta">
                  <span>{task.status}</span>
                  <span>{task.priority}</span>
                  {task.dueDate && <span>Due: {task.dueDate}</span>}
                </div>
                {task.description && <p>{task.description}</p>}
              </div>
              <div className="actions">
                <button onClick={() => toggleDone(task)}>
                  {task.status === "DONE" ? "Undo" : "Done"}
                </button>
                <button className="danger" onClick={() => removeTask(task.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className="empty">No tasks yet</p>}
        </div>
      </section>
    </div>
  );
}
