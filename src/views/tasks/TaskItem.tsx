"use client";

import Link from "next/link";
import { useId, useMemo } from "react";
import { useI18n } from "@/i18n/provider";
import type { Task } from "@/models/task.schema";
import { trpc } from "@/trpc/client";
import { useToast } from "@/views/components/Toast";
import { getErrorMessage } from "@/views/utils/errors";

type TaskItemProps = {
  task: Task;
};

export function TaskItem({ task }: TaskItemProps) {
  const { locale, t } = useI18n();
  const utils = trpc.useUtils();
  const showToast = useToast();
  // Liga Editar/Excluir/Concluída ao título, para leitores de tela saberem de qual tarefa se trata.
  const titleId = useId();

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

  // Rebusca as páginas já carregadas; a mutação só termina depois disso.
  const refreshList = () => utils.task.list.invalidate();

  function handleError(error: Parameters<typeof getErrorMessage>[0]) {
    showToast({ type: "error", message: getErrorMessage(error, t) });
    if (error.data?.code === "NOT_FOUND") return refreshList();
  }

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      showToast({ type: "success", message: t.taskItem.deleted(task.title) });
      return refreshList();
    },
    onError: handleError,
  });

  const setCompleted = trpc.task.setCompleted.useMutation({
    onSuccess: (saved) => {
      const message = saved.completed
        ? t.taskItem.markedCompleted(saved.title)
        : t.taskItem.reopened(saved.title);
      showToast({ type: "success", message });
      return refreshList();
    },
    onError: handleError,
  });

  const isDeleting = deleteTask.isPending || deleteTask.isSuccess;
  const isBusy = isDeleting || setCompleted.isPending;

  function handleDelete() {
    if (!window.confirm(t.taskItem.confirmDelete(task.title))) return;
    deleteTask.mutate({ id: task.id });
  }

  return (
    <li
      className={`flex items-start justify-between gap-4 rounded-md border border-line p-5 transition-opacity ${
        task.completed ? "bg-accent/10" : ""
      } ${isDeleting ? "opacity-50" : ""}`}
    >
      <div className="min-w-0">
        <h2 id={titleId} className="font-semibold break-words">
          {task.title}
        </h2>
        {task.description && (
          <p className="mt-2 text-sm whitespace-pre-line break-words text-muted">
            {task.description}
          </p>
        )}
        <p className="mt-3 text-xs text-subtle">
          {t.taskItem.createdAt(dateFormatter.format(new Date(task.createdAt)))}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-4">
        <div className="flex gap-4 text-sm">
          {!task.completed && (
            <Link
              href={`/tasks/${task.id}/edit`}
              aria-describedby={titleId}
              className="text-muted underline decoration-line underline-offset-4 hover:text-ink hover:decoration-current"
            >
              {t.taskItem.edit}
            </Link>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isBusy}
            aria-describedby={titleId}
            className="cursor-pointer text-danger underline decoration-line underline-offset-4 hover:decoration-current disabled:cursor-not-allowed"
          >
            {isDeleting ? t.taskItem.deleting : t.taskItem.delete}
          </button>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={task.completed}
          aria-describedby={titleId}
          onClick={() => setCompleted.mutate({ id: task.id, completed: !task.completed })}
          disabled={isBusy}
          className="flex cursor-pointer items-center gap-2 text-sm text-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            className={`relative h-5 w-9 rounded-full transition-colors ${
              task.completed ? "bg-accent" : "bg-field"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform ${
                task.completed ? "translate-x-4" : ""
              }`}
            />
          </span>
          {t.taskItem.completed}
        </button>
      </div>
    </li>
  );
}
