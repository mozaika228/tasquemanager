import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

jest.mock("react-beautiful-dnd", () => ({
  DragDropContext: ({ children }) => <div>{children}</div>,
  Droppable: ({ children, droppableId }) => children({
    droppableProps: {},
    innerRef: () => {},
    placeholder: <div data-testid={`placeholder-${droppableId}`} />
  }),
  Draggable: ({ children, draggableId }) => children({
    draggableProps: { "data-draggable": draggableId },
    dragHandleProps: {},
    innerRef: () => {}
  })
}));

jest.mock("./api.js", () => ({
  login: jest.fn(),
  getAccessToken: jest.fn(),
  clearTokens: jest.fn(),
  getTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  getComments: jest.fn(),
  addComment: jest.fn(),
  getAttachments: jest.fn(),
  uploadAttachment: jest.fn(),
  getNotifications: jest.fn(),
  markNotificationRead: jest.fn(),
  exportCsvUrl: jest.fn(() => "/api/tasks/export/csv"),
  exportPdfUrl: jest.fn(() => "/api/tasks/export/pdf"),
  attachmentDownloadUrl: jest.fn(() => "/file")
}));

const api = require("./api.js");

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getTasks.mockResolvedValue({ content: [] });
    api.getNotifications.mockResolvedValue([]);
    api.getComments.mockResolvedValue([]);
    api.getAttachments.mockResolvedValue([]);
  });

  test("renders login when token is absent", () => {
    api.getAccessToken.mockReturnValue(null);
    render(<App />);
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  test("calls login on submit", async () => {
    api.getAccessToken.mockReturnValue(null);
    api.login.mockResolvedValue({ accessToken: "a", refreshToken: "r" });

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "admin" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "admin" } });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith("admin", "admin");
    });
  });

  test("shows create button when token exists", async () => {
    api.getAccessToken.mockReturnValue("token");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
    });
  });
});


