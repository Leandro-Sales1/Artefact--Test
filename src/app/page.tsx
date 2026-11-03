import { getServerApi } from "@/trpc/server";
import { TaskList } from "@/views/tasks/TaskList";

// A lista vive em memória: renderiza a cada requisição, nunca no build.
export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ feedback?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const api = await getServerApi();
  const [{ feedback }, tasks] = await Promise.all([searchParams, api.task.list()]);

  return <TaskList tasks={tasks} feedbackKey={feedback} />;
}
