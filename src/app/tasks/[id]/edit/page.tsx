import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { getServerApi } from "@/trpc/server";
import { TaskForm } from "@/views/tasks/TaskForm";

type EditTaskPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;
  const api = await getServerApi();

  const task = await api.task.getById({ id }).catch((error: unknown) => {
    if (error instanceof TRPCError && (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")) {
      notFound();
    }
    throw error;
  });

  return <TaskForm task={task} />;
}
