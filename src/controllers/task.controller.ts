import { TRPCError } from "@trpc/server";
import type { ErrorKey } from "@/i18n/dictionaries";
import { taskModel } from "@/models/task.model";
import {
  listTasksSchema,
  setCompletedSchema,
  taskIdSchema,
  taskInputSchema,
  updateTaskSchema,
} from "@/models/task.schema";
import { publicProcedure, router } from "@/trpc/init";

function taskNotFound(): never {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "taskNotFound" satisfies ErrorKey,
  });
}

function taskCompleted(): never {
  throw new TRPCError({
    code: "PRECONDITION_FAILED",
    message: "taskCompleted" satisfies ErrorKey,
  });
}

export const taskController = router({
  list: publicProcedure
    .input(listTasksSchema)
    .query(({ input }) => taskModel.findPage(input.limit, input.cursor)),

  getById: publicProcedure
    .input(taskIdSchema)
    .query(({ input }) => taskModel.findById(input.id) ?? taskNotFound()),

  create: publicProcedure.input(taskInputSchema).mutation(({ input }) => taskModel.create(input)),

  update: publicProcedure.input(updateTaskSchema).mutation(({ input: { id, ...data } }) => {
    if (taskModel.findById(id)?.completed) taskCompleted();
    return taskModel.update(id, data) ?? taskNotFound();
  }),

  setCompleted: publicProcedure
    .input(setCompletedSchema)
    .mutation(({ input }) => taskModel.setCompleted(input.id, input.completed) ?? taskNotFound()),

  delete: publicProcedure.input(taskIdSchema).mutation(({ input }) => {
    if (!taskModel.remove(input.id)) taskNotFound();
    return { id: input.id };
  }),
});
