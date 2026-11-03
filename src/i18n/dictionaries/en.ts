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
    empty: "No tasks yet. How about creating the first one?",
    created: "Task created successfully!",
    updated: "Task updated successfully!",
  },
  taskItem: {
    createdAt: (date: string) => `Created on ${date}`,
    edit: "Edit",
    delete: "Delete",
    deleting: "Deleting...",
    confirmDelete: (title: string) => `Delete the task "${title}"?`,
    deleted: (title: string) => `Task "${title}" deleted successfully!`,
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
  },
  feedback: {
    close: "Close message",
  },
  notFound: {
    heading: "Not found",
    message: "The task or page you are looking for does not exist.",
    back: "Back to the task list",
  },
  errorPage: {
    message: "An unexpected error occurred while loading this page.",
    retry: "Try again",
  },
  errors: {
    titleRequired: "Title is required",
    titleTooLong: "Title must be at most 100 characters",
    descriptionInvalid: "Description must be text",
    descriptionTooLong: "Description must be at most 500 characters",
    invalidId: "Invalid task ID",
    taskNotFound: "Task not found. It may have been deleted.",
    network: "Could not reach the server. Check your connection and try again.",
  },
};
