import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  addComment,
  attachmentDownloadUrl,
  clearTokens,
  createTask,
  deleteTask,
  exportCsvUrl,
  exportPdfUrl,
  getAccessToken,
  getAttachments,
  getComments,
  getNotifications,
  getTasks,
  login,
  markNotificationRead,
  updateTask,
  uploadAttachment
} from "./api.js";

const statuses = ["TODO", "IN_PROGRESS", "DONE"];

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

function taskProgress(task) {
  if (!task.dueDate || !task.createdAt) {
    return null;
  }
  const start = new Date(task.createdAt).getTime();
  const end = new Date(task.dueDate).getTime();
  const now = Date.now();
  if (end <= start) {
    return null;
  }
  const raw = ((now - start) / (end - start)) * 100;
  return Math.max(0, Math.min(140, Math.round(raw)));
}

function isOverdue(task) {
  if (!task.dueDate || task.status === "DONE") {
    return false;
  }
  return new Date(task.dueDate).getTime() < Date.now();
}

function TaskModal({ title, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-3">{title}</h3>
        <form className="grid gap-2" onSubmit={handleSubmit}>
          <input className="input input-bordered" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
          <textarea className="textarea textarea-bordered" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <input className="input input-bordered" name="assignee" placeholder="Assignee" value={form.assignee} onChange={handleChange} />
          <input className="input input-bordered" name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange} />
          <input className="input input-bordered" type="number" min="0" name="estimateHours" placeholder="Estimate hours" value={form.estimateHours ?? ""} onChange={handleChange} />
          <select className="select select-bordered" name="status" value={form.status} onChange={handleChange}>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select select-bordered" name="priority" value={form.priority} onChange={handleChange}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          <input className="input input-bordered" type="date" name="dueDate" value={form.dueDate || ""} onChange={handleChange} />
          <label className="label cursor-pointer justify-start gap-2">
            <input className="checkbox" type="checkbox" checked={Boolean(form.archived)} onChange={(e) => setForm((prev) => ({ ...prev, archived: e.target.checked }))} />
            <span>Archived</span>
          </label>
          <div className="modal-action mt-2">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [auth, setAuth] = useState({ username: "admin", password: "admin" });
  const [isAuthed, setIsAuthed] = useState(Boolean(getAccessToken()));
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [attachments, setAttachments] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  async function loadTasks() {
    try {
      const data = await getTasks({ size: 200, archived: false, q: query || undefined, sortBy: "createdAt", direction: "desc" });
      setTasks(data.content || []);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    }
  }

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch {
      // Non-critical panel.
    }
  }

  useEffect(() => {
    if (!isAuthed) {
      return;
    }
    loadTasks();
    loadNotifications();
  }, [isAuthed]);

  async function loadTaskDetails(task) {
    setSelectedTask(task);
    try {
      const [c, a] = await Promise.all([getComments(task.id), getAttachments(task.id)]);
      setComments(c || []);
      setAttachments(a || []);
    } catch (err) {
      setError(err.message || "Failed to load task details");
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

  async function handleCreate(form) {
    try {
      await createTask({
        ...form,
        estimateHours: form.estimateHours === "" ? null : Number(form.estimateHours),
        dueDate: form.dueDate || null
      });
      setShowCreate(false);
      await loadTasks();
    } catch (err) {
      setError(err.message || "Failed to create task");
    }
  }

  async function handleEdit(form) {
    try {
      await updateTask(editingTask.id, {
        ...editingTask,
        ...form,
        estimateHours: form.estimateHours === "" ? null : Number(form.estimateHours),
        dueDate: form.dueDate || null
      });
      setEditingTask(null);
      await loadTasks();
    } catch (err) {
      setError(err.message || "Failed to update task");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTask(id);
      await loadTasks();
      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }
    } catch (err) {
      setError(err.message || "Failed to delete task");
    }
  }

  async function onDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const task = tasks.find((t) => String(t.id) === draggableId);
    if (!task) {
      return;
    }

    try {
      await updateTask(task.id, { ...task, status: destination.droppableId });
      await loadTasks();
    } catch (err) {
      setError(err.message || "Failed to move task");
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!selectedTask || !commentText.trim()) {
      return;
    }
    try {
      await addComment(selectedTask.id, auth.username, commentText.trim());
      setCommentText("");
      await loadTaskDetails(selectedTask);
      await loadNotifications();
    } catch (err) {
      setError(err.message || "Failed to add comment");
    }
  }

  async function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) {
      return;
    }
    try {
      await uploadAttachment(selectedTask.id, file);
      await loadTaskDetails(selectedTask);
    } catch (err) {
      setError(err.message || "Failed to upload file");
    }
  }

  async function markRead(id) {
    try {
      await markNotificationRead(id);
      await loadNotifications();
    } catch {
      // Non-critical action.
    }
  }

  async function downloadExport(kind) {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Please login first");
      }
      const url = kind === "csv" ? exportCsvUrl() : exportPdfUrl();
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = kind === "csv" ? "tasks.csv" : "tasks.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err.message || "Export failed");
    }
  }
  const grouped = useMemo(() => {
    const result = { TODO: [], IN_PROGRESS: [], DONE: [] };
    tasks.forEach((t) => {
      result[t.status]?.push(t);
    });
    return result;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-4">
      <div className="max-w-7xl mx-auto">
        <div className="navbar bg-base-100 rounded-box shadow mb-4">
          <div className="flex-1">
            <span className="text-xl font-bold">Task Manager</span>
          </div>
          <div className="flex-none gap-2">
            <button className="btn btn-sm" onClick={() => setDark((v) => !v)}>{dark ? "Light" : "Dark"}</button>
            {isAuthed && <button className="btn btn-sm" onClick={() => setShowCreate(true)}>Create</button>}
            <button className="btn btn-sm" onClick={() => downloadExport("csv")}>CSV</button>
            <button className="btn btn-sm" onClick={() => downloadExport("pdf")}>PDF</button>
            {isAuthed ? <button className="btn btn-sm btn-error" onClick={handleLogout}>Logout</button> : null}
          </div>
        </div>

        {!isAuthed && (
          <div className="card bg-base-100 shadow mb-4">
            <div className="card-body">
              <h2 className="card-title">Login</h2>
              <form className="grid sm:grid-cols-3 gap-2" onSubmit={handleLogin}>
                <input className="input input-bordered" value={auth.username} onChange={(e) => setAuth((p) => ({ ...p, username: e.target.value }))} placeholder="Username" />
                <input className="input input-bordered" type="password" value={auth.password} onChange={(e) => setAuth((p) => ({ ...p, password: e.target.value }))} placeholder="Password" />
                <button className="btn btn-primary" type="submit">Login</button>
              </form>
            </div>
          </div>
        )}

        {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="mb-3">
              <input
                className="input input-bordered w-full"
                placeholder="Search tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadTasks()}
              />
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid md:grid-cols-3 gap-3">
                {statuses.map((status) => (
                  <Droppable droppableId={status} key={status}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="card bg-base-100 shadow min-h-[420px]">
                        <div className="card-body p-3">
                          <h3 className="font-semibold">{status.replace("_", " ")}</h3>
                          <div className="space-y-2">
                            {grouped[status].map((task, index) => {
                              const progress = taskProgress(task);
                              const overdue = isOverdue(task);
                              return (
                                <Draggable draggableId={String(task.id)} index={index} key={task.id}>
                                  {(dragProvided) => (
                                    <div
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      className="border border-base-300 rounded-lg p-3 bg-base-100"
                                    >
                                      <div className="flex justify-between items-start gap-2">
                                        <button className="font-medium text-left" onClick={() => loadTaskDetails(task)}>{task.title}</button>
                                        <span className="badge badge-outline">{task.priority}</span>
                                      </div>
                                      <p className="text-sm opacity-80 mt-1">{task.description || "No description"}</p>
                                      <div className="text-xs mt-2 opacity-70">{task.assignee || "unassigned"}</div>
                                      {progress !== null && (
                                        <div className="mt-2">
                                          <progress className={`progress w-full ${overdue ? "progress-error" : "progress-primary"}`} value={Math.min(progress, 100)} max="100" />
                                          <div className="text-[11px] mt-1">
                                            {overdue ? `Overdue (${progress}%)` : `Progress ${progress}%`}
                                          </div>
                                        </div>
                                      )}
                                      <div className="flex gap-2 mt-3">
                                        <button className="btn btn-xs" onClick={() => setEditingTask(task)}>Edit</button>
                                        <button className="btn btn-xs btn-error" onClick={() => handleDelete(task.id)}>Delete</button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          </div>

          <div className="space-y-4">
            <div className="card bg-base-100 shadow">
              <div className="card-body p-3">
                <h3 className="font-semibold">Notifications</h3>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {notifications.length === 0 && <p className="text-sm opacity-60">No notifications</p>}
                  {notifications.map((n) => (
                    <div key={n.id} className="border rounded p-2 text-sm">
                      <div className="font-medium">{n.type}</div>
                      <div>{n.message}</div>
                      {!n.readFlag && <button className="btn btn-xs mt-2" onClick={() => markRead(n.id)}>Mark read</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow">
              <div className="card-body p-3">
                <h3 className="font-semibold">Task details</h3>
                {!selectedTask && <p className="text-sm opacity-60">Pick a task</p>}
                {selectedTask && (
                  <>
                    <div className="text-sm font-medium">{selectedTask.title}</div>
                    <form className="mt-2" onSubmit={submitComment}>
                      <textarea
                        className="textarea textarea-bordered w-full"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Comment with @mentions"
                      />
                      <button className="btn btn-sm mt-2" type="submit">Add comment</button>
                    </form>
                    <input className="file-input file-input-bordered file-input-sm w-full mt-3" type="file" onChange={onFileChange} />

                    <div className="mt-3">
                      <div className="text-xs uppercase opacity-60 mb-1">Comments</div>
                      <div className="space-y-2 max-h-32 overflow-auto">
                        {comments.map((c) => (
                          <div key={c.id} className="text-xs border rounded p-2">
                            <div className="font-medium">{c.author}</div>
                            <div>{c.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-xs uppercase opacity-60 mb-1">Attachments</div>
                      <div className="space-y-2 max-h-24 overflow-auto">
                        {attachments.map((a) => (
                          <a className="link text-xs block" key={a.id} href={attachmentDownloadUrl(selectedTask.id, a.id)}>{a.fileName}</a>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {showCreate && (
          <TaskModal
            title="Create task"
            initial={emptyForm}
            onClose={() => setShowCreate(false)}
            onSubmit={handleCreate}
          />
        )}

        {editingTask && (
          <TaskModal
            title="Edit task"
            initial={{ ...editingTask, estimateHours: editingTask.estimateHours ?? "", dueDate: editingTask.dueDate ?? "" }}
            onClose={() => setEditingTask(null)}
            onSubmit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}


