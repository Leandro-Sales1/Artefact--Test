import type { Task, TaskInput } from "./task.schema";

// Em globalThis para sobreviver ao hot-reload e ser compartilhado entre o route handler e o SSR.
const globalForTasks = globalThis as typeof globalThis & {
  __tasks?: Map<string, Task>;
};

const tasks = (globalForTasks.__tasks ??= new Map<string, Task>());

export const taskModel = {
  findAll(): Task[] {
    return [...tasks.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  findById(id: string): Task | null {
    return tasks.get(id) ?? null;
  },

  create(input: TaskInput): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description || undefined,
      createdAt: new Date().toISOString(),
    };
    tasks.set(task.id, task);
    return task;
  },

  update(id: string, input: TaskInput): Task | null {
    const current = tasks.get(id);
    if (!current) return null;

    const updated: Task = {
      ...current,
      title: input.title,
      description: input.description || undefined,
    };
    tasks.set(id, updated);
    return updated;
  },

  remove(id: string): boolean {
    return tasks.delete(id);
  },
};
