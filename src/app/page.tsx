import { TASK_PAGE_SIZE } from "@/models/task.schema";
import { getServerApi } from "@/trpc/server";
import { TaskList } from "@/views/tasks/TaskList";

// A lista vive em memória: renderiza a cada requisição, nunca no build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const api = await getServerApi();
  // Primeira página renderizada no servidor; as próximas são buscadas pelo navegador.
  const firstPage = await api.task.list({ limit: TASK_PAGE_SIZE });

  return <TaskList firstPage={firstPage} />;
}
