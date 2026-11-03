import type { Task } from "@/models/task.schema";

export const UNKNOWN_ID = "00000000-0000-4000-8000-000000000000";

export function resetTaskStore() {
  (globalThis as typeof globalThis & { __tasks?: Map<string, Task> }).__tasks?.clear();
}
