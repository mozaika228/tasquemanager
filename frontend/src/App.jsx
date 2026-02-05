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
  assignee: "",
  tags: "",
  estimateHours: "",
  archived: false,
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
    archived: "false",
    q: "",
    dueDateFrom: "",
    dueDateTo: "",
    sortBy: "createdAt",
    direction: "desc"
  });
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 1,
    totalElements: 0
  });

  async function load(nextFilters = filters, nextPage = pageInfo.page) {
    try {
      const data = await getTasks({
        ...nextFilters,
        page: nextPage,
        size: pageInfo.size
      });
      setTasks(data.content || []);
      setPageInfo((prev) => ({
        ...prev,
        page: data.number ?? nextPage,
        totalPages: data.totalPages ?? 1,
        totalElements: data.totalElements ?? 0
      }));
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
      load(next, 0);
    }
  }
  function handleSearchChange(e) {
    const { value } = e.target;
    const next = { ...filters, q: value };
    setFilters(next);
    if (isAuthed) {
      load(next, 0);
    }
  }
  function handleDateFilterChange(e) {
    const { name, value } = e.target;
    const next = { ...filters, [name]: value };
    setFilters(next);
    if (isAuthed) {
      load(next, 0);
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
        estimateHours: form.estimateHours ? Number(form.estimateHours) : null,
        dueDate: form.dueDate || null
      });
      setForm(emptyForm);
      load(filters, 0);
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
      load(filters, 0);
    } catch (err) {
      setError(err.message || "Failed to delete task");
    }
  }

  async function toggleArchive(task) {
    setError("");
    try {
      await updateTask(task.id, { ...task, archived: !task.archived });
      load(filters, pageInfo.page);
    } catch (err) {
      setError(err.message || "Failed to update task");
    }
  }

  function nextPage() {
    const next = Math.min(pageInfo.page + 1, pageInfo.totalPages - 1);
    if (next !== pageInfo.page) {
      load(filters, next);
    }
  }

  function prevPage() {
    const next = Math.max(pageInfo.page - 1, 0);
    if (next !== pageInfo.page) {
      load(filters, next);
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
          <input
            name="assignee"
            placeholder="Assignee"
            value={form.assignee}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <input
            name="tags"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={handleChange}
          />
          <input
            type="number"
            min="0"
            name="estimateHours"
            placeholder="Estimate hours"
            value={form.estimateHours}
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
          <label className="checkbox">
            <input
              type="checkbox"
              name="archived"
              checked={form.archived}
              onChange={(e) => setForm({ ...form, archived: e.target.checked })}
            />
            Archived
          </label>
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="card">
        <h2>Tasks</h2>
        <div className="filters">
          <input
            name="q"
            placeholder="Search..."
            value={filters.q}
            onChange={handleSearchChange}
          />
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
          <select name="archived" value={filters.archived} onChange={handleFilterChange}>
            <option value="false">Active</option>
            <option value="true">Archived</option>
          </select>
          <input
            type="date"
            name="dueDateFrom"
            value={filters.dueDateFrom}
            onChange={handleDateFilterChange}
          />
          <input
            type="date"
            name="dueDateTo"
            value={filters.dueDateTo}
            onChange={handleDateFilterChange}
          />
          <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
            <option value="createdAt">Created</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
            <option value="assignee">Assignee</option>
          </select>
          <select name="direction" value={filters.direction} onChange={handleFilterChange}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
        <div className="pager">
          <button onClick={prevPage} disabled={pageInfo.page === 0}>Prev</button>
          <span>
            Page {pageInfo.page + 1} / {pageInfo.totalPages} · {pageInfo.totalElements} tasks
          </span>
          <button onClick={nextPage} disabled={pageInfo.page >= pageInfo.totalPages - 1}>Next</button>
        </div>
        <div className="list">
          {tasks.map((task) => (
            <div key={task.id} className={`task ${task.status === "DONE" ? "done" : ""}`}>
              <div>
                <strong>{task.title}</strong>
                <div className="meta">
                  <span>{task.status}</span>
                  <span>{task.priority}</span>
                  {task.assignee && <span>Assignee: {task.assignee}</span>}
                  {task.estimateHours != null && <span>{task.estimateHours}h</span>}
                  {task.dueDate && <span>Due: {task.dueDate}</span>}
                </div>
                {task.description && <p>{task.description}</p>}
                {task.tags && <p className="tags">Tags: {task.tags}</p>}
              </div>
              <div className="actions">
                <button onClick={() => toggleDone(task)}>
                  {task.status === "DONE" ? "Undo" : "Done"}
                </button>
                <button onClick={() => toggleArchive(task)}>
                  {task.archived ? "Unarchive" : "Archive"}
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
