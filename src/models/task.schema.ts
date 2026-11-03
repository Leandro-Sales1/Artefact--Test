import { z } from "zod";
import type { ErrorKey } from "@/i18n/dictionaries";

const error = (key: ErrorKey) => key;

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
  createdAt: z.iso.datetime(),
});

export const taskInputSchema = taskSchema.pick({ title: true, description: true });

export const taskIdSchema = taskSchema.pick({ id: true });

export const updateTaskSchema = taskInputSchema.extend(taskIdSchema.shape);

export type Task = z.infer<typeof taskSchema>;
export type TaskInput = z.infer<typeof taskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
