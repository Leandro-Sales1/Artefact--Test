"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { translateError } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { taskInputSchema, type Task, type TaskInput } from "@/models/task.schema";
import { trpc } from "@/trpc/client";
import { useToast } from "@/views/components/Toast";
import { getErrorMessage } from "@/views/utils/errors";

type FieldErrors = Partial<Record<keyof TaskInput, string>>;

type TaskFormProps = {
  task?: Task;
};

const labelClass = "block text-xs tracking-wider text-muted uppercase";

const inputClass =
  "w-full border-0 border-b border-field bg-transparent py-2 focus:border-accent focus:outline-none disabled:text-subtle aria-invalid:border-danger";

export function TaskForm({ task }: TaskFormProps) {
  const isEditing = task !== undefined;
  const { t } = useI18n();
  const router = useRouter();
  const showToast = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});

  // Descarta a lista em cache: ela recomeça com a primeira página que o servidor renderizar.
  function backToList() {
    queryClient.removeQueries({ queryKey: getQueryKey(trpc.task.list) });
    router.push("/");
  }

  const mutationOptions = {
    onSuccess: (saved: Task) => {
      const message = isEditing ? t.taskForm.updated(saved.title) : t.taskForm.created(saved.title);
      showToast({ type: "success", message });
      backToList();
    },
    onError: (error: Parameters<typeof getErrorMessage>[0]) => {
      showToast({ type: "error", message: getErrorMessage(error, t) });
      // A tarefa foi excluída ou concluída enquanto era editada: volta para a lista atualizada.
      const code = error.data?.code;
      if (code === "NOT_FOUND" || code === "PRECONDITION_FAILED") backToList();
    },
  };
  const createTask = trpc.task.create.useMutation(mutationOptions);
  const updateTask = trpc.task.update.useMutation(mutationOptions);
  const mutation = isEditing ? updateTask : createTask;

  const isSaving = mutation.isPending || mutation.isSuccess;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = taskInputSchema.safeParse({ title, description });
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({ title: fieldErrors.title?.[0], description: fieldErrors.description?.[0] });
      return;
    }

    setErrors({});
    if (isEditing) {
      updateTask.mutate({ id: task.id, ...result.data });
    } else {
      createTask.mutate(result.data);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <h1 className="border-b-2 border-ink pb-5 font-serif text-3xl leading-tight font-medium">
        {isEditing ? t.taskForm.editHeading : t.taskForm.createHeading}
      </h1>

      <div className="space-y-2">
        <label htmlFor="title" className={labelClass}>
          {t.taskForm.title} *
        </label>
        <input
          id="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setErrors((current) => ({ ...current, title: undefined }));
          }}
          disabled={isSaving}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
          placeholder={t.taskForm.titlePlaceholder}
          className={inputClass}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-danger">
            {translateError(t, errors.title)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className={labelClass}>
          {t.taskForm.description} {t.taskForm.optional}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setErrors((current) => ({ ...current, description: undefined }));
          }}
          disabled={isSaving}
          rows={4}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-error" : undefined}
          className={`${inputClass} resize-y`}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-danger">
            {translateError(t, errors.description)}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-5 pt-2">
        <Link
          href="/"
          className="text-sm text-muted underline decoration-line underline-offset-4 hover:text-ink hover:decoration-current"
        >
          {t.taskForm.cancel}
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="cursor-pointer rounded-full bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? t.taskForm.saving : isEditing ? t.taskForm.save : t.taskForm.create}
        </button>
      </div>
    </form>
  );
}
