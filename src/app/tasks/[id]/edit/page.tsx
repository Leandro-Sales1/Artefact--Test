import { TRPCError } from "@trpc/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { getServerApi } from "@/trpc/server";
import { TaskForm } from "@/views/tasks/TaskForm";

type EditTaskPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;
  const api = await getServerApi();

  const task = await api.task.getById({ id }).catch((error: unknown) => {
    if (
      error instanceof TRPCError &&
      (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")
    ) {
      notFound();
    }
    throw error;
  });

  if (task.completed) {
    const t = getDictionary(await getLocale());
    return (
      <div className="space-y-6">
        <h1 className="border-b-2 border-ink pb-5 font-serif text-3xl leading-tight font-medium">
          {t.taskForm.editHeading}
        </h1>
        <p className="text-muted">{t.errors.taskCompleted}</p>
        <Link
          href="/"
          className="inline-block text-sm text-accent underline underline-offset-4 hover:text-accent-hover"
        >
          {t.notFound.back}
        </Link>
      </div>
    );
  }

  return <TaskForm task={task} />;
}
