import { taskController } from "@/controllers/task.controller";
import { router } from "./init";

export const appRouter = router({
  task: taskController,
});

export type AppRouter = typeof appRouter;
