import { getServerApi } from "@/trpc/server";
import { TaskList } from "@/views/tasks/TaskList";

// A lista vive em memória: renderiza a cada requisição, nunca no build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const api = await getServerApi();
  const tasks = await api.task.list();

  return <TaskList tasks={tasks} />;
}
