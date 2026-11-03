"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { useI18n } from "@/i18n/provider";
import type { Task } from "@/models/task.schema";
import { trpc } from "@/trpc/client";
import type { FeedbackMessage } from "@/views/components/Feedback";
import { getErrorMessage } from "@/views/utils/errors";

type TaskItemProps = {
  task: Task;
  onFeedback: (feedback: FeedbackMessage) => void;
};

export function TaskItem({ task, onFeedback }: TaskItemProps) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  // Fuso fixo para servidor e navegador formatarem igual (evita erro de hidratação).
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
      }),
    [locale],
  );

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      onFeedback({ type: "success", message: t.taskItem.deleted(task.title) });
      startTransition(() => router.refresh());
    },
    onError: (error) => {
      onFeedback({ type: "error", message: getErrorMessage(error, t) });
      if (error.data?.code === "NOT_FOUND") startTransition(() => router.refresh());
    },
  });

  const isDeleting = deleteTask.isPending || isRefreshing;

  function handleDelete() {
    if (!window.confirm(t.taskItem.confirmDelete(task.title))) return;
    deleteTask.mutate({ id: task.id });
  }

  return (
    <li
      className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-opacity ${
        isDeleting ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-semibold break-words">{task.title}</h2>
          {task.description && (
            <p className="mt-1 text-sm whitespace-pre-line break-words text-gray-600">
              {task.description}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            {t.taskItem.createdAt(dateFormatter.format(new Date(task.createdAt)))}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Link
            href={`/tasks/${task.id}/edit`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            {t.taskItem.edit}
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="cursor-pointer rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? t.taskItem.deleting : t.taskItem.delete}
          </button>
        </div>
      </div>
    </li>
  );
}
