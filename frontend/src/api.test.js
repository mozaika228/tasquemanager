import {
  clearTokens,
  createTask,
  deleteTask,
  getAccessToken,
  getTasks,
  login,
  markNotificationRead,
  setTokens,
  updateTask,
  uploadAttachment
} from "./api";

describe("api", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  test("stores and reads tokens", () => {
    setTokens("a", "b");
    expect(getAccessToken()).toBe("a");
    clearTokens();
    expect(getAccessToken()).toBeNull();
  });

  test("login sends request and persists tokens", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ accessToken: "aa", refreshToken: "rr" }),
      headers: { get: () => "application/json" }
    });

    const data = await login("admin", "admin");

    expect(data.accessToken).toBe("aa");
    expect(localStorage.getItem("accessToken")).toBe("aa");
    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("getTasks normalizes array response", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify([{ id: 1, title: "T1" }]),
      headers: { get: () => "application/json" }
    });

    const page = await getTasks();
    expect(page.content).toHaveLength(1);
    expect(page.totalElements).toBe(1);
  });

  test("sends bearer token for protected calls", async () => {
    localStorage.setItem("accessToken", "TOKEN");
    fetch.mockResolvedValue({
      ok: true,
      text: async () => "",
      headers: { get: () => "" }
    });

    await createTask({ title: "A", status: "TODO", priority: "MEDIUM" });
    await updateTask(1, { title: "B", status: "DONE", priority: "HIGH" });
    await deleteTask(1);
    await markNotificationRead(4);

    expect(fetch).toHaveBeenCalled();
    for (const call of fetch.mock.calls) {
      expect(call[1].headers.Authorization).toBe("Bearer TOKEN");
    }
  });

  test("uploadAttachment uses FormData", async () => {
    localStorage.setItem("accessToken", "TOKEN");
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ id: 1 }),
      headers: { get: () => "application/json" }
    });

    const file = new File(["x"], "x.txt", { type: "text/plain" });
    await uploadAttachment(3, file);

    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.body instanceof FormData).toBe(true);
  });
});