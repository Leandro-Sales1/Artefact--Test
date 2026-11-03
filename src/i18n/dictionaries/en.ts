import type { Dictionary } from "./pt-BR";

export const en: Dictionary = {
  metadata: {
    title: "Task Manager",
    description: "Task management with Next.js 15 and tRPC",
  },
  languageSwitcher: {
    label: "Language",
  },
  taskList: {
    heading: "Tasks",
    newTask: "New task",
    count: (total: number) => (total === 1 ? "1 task" : `${total} tasks`),
    empty: "No tasks yet. How about creating the first one?",
  },
  taskItem: {
    createdAt: (date: string) => `Created on ${date}`,
    edit: "Edit",
    delete: "Delete",
    deleting: "Deleting...",
    confirmDelete: (title: string) => `Delete the task "${title}"?`,
    deleted: (title: string) => `Task "${title}" deleted successfully!`,
    completed: "Completed",
    markedCompleted: (title: string) => `Task "${title}" marked as completed!`,
    reopened: (title: string) => `Task "${title}" reopened!`,
  },
  taskForm: {
    createHeading: "New task",
    editHeading: "Edit task",
    title: "Title",
    titlePlaceholder: "E.g.: Study tRPC",
    description: "Description",
    optional: "(optional)",
    cancel: "Cancel",
    create: "Create task",
    save: "Save changes",
    saving: "Saving...",
    created: (title: string) => `Task "${title}" created successfully!`,
    updated: (title: string) => `Task "${title}" updated successfully!`,
  },
  toast: {
    close: "Close message",
  },
  notFound: {
    heading: "Not found",
    message: "The task or page you are looking for does not exist.",
    back: "Back to the task list",
  },
  errorPage: {
    heading: "Something went wrong",
    message: "An unexpected error occurred while loading this page.",
    retry: "Try again",
  },
  errors: {
    titleRequired: "Title is required",
    titleTooLong: "Title must be at most 100 characters",
    descriptionInvalid: "Description must be text",
    descriptionTooLong: "Description must be at most 500 characters",
    invalidId: "Invalid task ID",
    completedInvalid: "Completion status must be true or false",
    taskCompleted: "Completed tasks cannot be edited. Reopen the task to edit it.",
    taskNotFound: "Task not found. It may have been deleted.",
    unexpected: "An unexpected server error occurred. Please try again shortly.",
    network: "Could not reach the server. Check your connection and try again.",
  },
};
