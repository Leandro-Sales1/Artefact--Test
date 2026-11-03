import { TRPCError } from "@trpc/server";
import type { ErrorKey } from "@/i18n/dictionaries";
import { taskModel } from "@/models/task.model";
import { taskIdSchema, taskInputSchema, updateTaskSchema } from "@/models/task.schema";
import { publicProcedure, router } from "@/trpc/init";

function taskNotFound(): never {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "taskNotFound" satisfies ErrorKey,
  });
}

export const taskController = router({
  list: publicProcedure.query(() => taskModel.findAll()),

  getById: publicProcedure
    .input(taskIdSchema)
    .query(({ input }) => taskModel.findById(input.id) ?? taskNotFound()),

  create: publicProcedure
    .input(taskInputSchema)
    .mutation(({ input }) => taskModel.create(input)),

  update: publicProcedure
    .input(updateTaskSchema)
    .mutation(({ input: { id, ...data } }) => taskModel.update(id, data) ?? taskNotFound()),

  delete: publicProcedure.input(taskIdSchema).mutation(({ input }) => {
    if (!taskModel.remove(input.id)) taskNotFound();
    return { id: input.id };
  }),
});
