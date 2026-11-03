import type { Task, TaskCursor, TaskInput, TaskPage } from "./task.schema";

// Mais recentes primeiro; o id desempata tarefas criadas no mesmo instante.
function compareTasks(a: TaskCursor, b: TaskCursor): number {
  return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
}

// Em globalThis para sobreviver ao hot-reload e ser compartilhado entre o route handler e o SSR.
const globalForTasks = globalThis as typeof globalThis & {
  __tasks?: Map<string, Task>;
};

const tasks = (globalForTasks.__tasks ??= new Map<string, Task>());

export const taskModel = {
  findAll(): Task[] {
    return [...tasks.values()].sort(compareTasks);
  },

  findPage(limit: number, cursor?: TaskCursor | null): TaskPage {
    const all = this.findAll();
    const remaining = cursor ? all.filter((task) => compareTasks(task, cursor) > 0) : all;
    const items = remaining.slice(0, limit);
    const last = items.at(-1);
    const nextCursor =
      remaining.length > limit && last ? { id: last.id, createdAt: last.createdAt } : null;

    return { items, nextCursor, total: all.length };
  },

  findById(id: string): Task | null {
    return tasks.get(id) ?? null;
  },

  create(input: TaskInput): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.set(task.id, task);
    return task;
  },

  update(id: string, input: TaskInput): Task | null {
    const current = tasks.get(id);
    if (!current) return null;

    // Descrição ausente na requisição mantém a atual; string vazia remove a descrição.
    const description =
      input.description === undefined ? current.description : input.description || undefined;

    const updated: Task = { ...current, title: input.title, description };
    tasks.set(id, updated);
    return updated;
  },

  setCompleted(id: string, completed: boolean): Task | null {
    const current = tasks.get(id);
    if (!current) return null;

    const updated: Task = { ...current, completed };
    tasks.set(id, updated);
    return updated;
  },

  remove(id: string): boolean {
    return tasks.delete(id);
  },
};
