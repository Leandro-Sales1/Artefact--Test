import { z } from "zod";
import type { ErrorKey } from "@/i18n/dictionaries";

const error = (key: ErrorKey) => key;

export const TASK_PAGE_SIZE = 5;

export const taskSchema = z.object({
  id: z.uuid(error("invalidId")),
  title: z
    .string(error("titleRequired"))
    .trim()
    .min(1, error("titleRequired"))
    .max(100, error("titleTooLong")),
  description: z
    .string(error("descriptionInvalid"))
    .trim()
    .max(500, error("descriptionTooLong"))
    .optional(),
  completed: z.boolean(error("completedInvalid")),
  createdAt: z.iso.datetime(),
});

export const taskInputSchema = taskSchema.pick({ title: true, description: true });

export const taskIdSchema = taskSchema.pick({ id: true });

export const updateTaskSchema = taskInputSchema.extend(taskIdSchema.shape);

export const setCompletedSchema = taskSchema.pick({ id: true, completed: true });

// Cursor = última tarefa recebida: a próxima página começa logo depois dela na ordenação.
export const taskCursorSchema = z.object(
  {
    id: z.uuid(error("invalidCursor")),
    createdAt: z.iso.datetime(error("invalidCursor")),
  },
  error("invalidCursor"),
);

export const listTasksSchema = z
  .object({
    limit: z
      .number(error("invalidLimit"))
      .int(error("invalidLimit"))
      .min(1, error("invalidLimit"))
      .max(50, error("invalidLimit"))
      .default(TASK_PAGE_SIZE),
    cursor: taskCursorSchema.nullish(),
  })
  .prefault({});

export type Task = z.infer<typeof taskSchema>;
export type TaskInput = z.infer<typeof taskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type SetCompletedInput = z.infer<typeof setCompletedSchema>;
export type TaskCursor = z.infer<typeof taskCursorSchema>;

export type TaskPage = {
  items: Task[];
  nextCursor: TaskCursor | null;
  total: number;
};
