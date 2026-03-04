const baseUrl = "/api/tasks";
const authUrl = "/api/auth";
const notificationUrl = "/api/notifications";
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function setTokens(accessToken, refreshToken) {
  if (accessToken) {
    localStorage.setItem(ACCESS_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function request(url, options = {}) {
  const token = getAccessToken();
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || res.statusText);
  }
  if (!text) {
    return null;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return JSON.parse(text);
  }
  return text;
}

export async function login(username, password) {
  const data = await request(`${authUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  return query.toString();
}

export async function getTasks(params = {}) {
  const query = buildQuery(params);
  const url = query ? `${baseUrl}?${query}` : baseUrl;
  const data = await request(url);
  if (Array.isArray(data)) {
    return { content: data, totalPages: 1, totalElements: data.length, number: 0, size: data.length };
  }
  return data;
}

export async function createTask(task) {
  return request(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task)
  });
}

export async function updateTask(id, task) {
  return request(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task)
  });
}

export async function deleteTask(id) {
  return request(`${baseUrl}/${id}`, { method: "DELETE" });
}

export async function getComments(taskId) {
  return request(`${baseUrl}/${taskId}/comments`);
}

export async function addComment(taskId, author, content) {
  return request(`${baseUrl}/${taskId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, content })
  });
}

export async function getAttachments(taskId) {
  return request(`${baseUrl}/${taskId}/attachments`);
}

export async function uploadAttachment(taskId, file) {
  const formData = new FormData();
  formData.append("file", file);
  return request(`${baseUrl}/${taskId}/attachments`, {
    method: "POST",
    body: formData
  });
}

export function attachmentDownloadUrl(taskId, attachmentId) {
  return `${baseUrl}/${taskId}/attachments/${attachmentId}`;
}

export async function getNotifications() {
  return request(notificationUrl);
}

export async function markNotificationRead(id) {
  return request(`${notificationUrl}/${id}/read`, { method: "PATCH" });
}

export function exportCsvUrl() {
  return "/api/tasks/export/csv";
}

export function exportPdfUrl() {
  return "/api/tasks/export/pdf";
}
