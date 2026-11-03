"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { translateError } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { taskInputSchema, type Task, type TaskInput } from "@/models/task.schema";
import { trpc } from "@/trpc/client";
import { Feedback } from "@/views/components/Feedback";
import { getErrorMessage } from "@/views/utils/errors";

type FieldErrors = Partial<Record<keyof TaskInput, string>>;

type TaskFormProps = {
  task?: Task;
};

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 aria-invalid:border-red-500";

export function TaskForm({ task }: TaskFormProps) {
  const isEditing = task !== undefined;
  const { t } = useI18n();
  const router = useRouter();

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});

  const onSuccess = () => router.push(`/?feedback=${isEditing ? "updated" : "created"}`);
  const createTask = trpc.task.create.useMutation({ onSuccess });
  const updateTask = trpc.task.update.useMutation({ onSuccess });
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
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h1 className="text-2xl font-bold">
        {isEditing ? t.taskForm.editHeading : t.taskForm.createHeading}
      </h1>

      {mutation.error && <Feedback type="error" message={getErrorMessage(mutation.error, t)} />}

      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium">
          {t.taskForm.title} <span className="text-red-600">*</span>
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
          <p id="title-error" className="text-sm text-red-600">
            {translateError(t, errors.title)}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium">
          {t.taskForm.description}{" "}
          <span className="font-normal text-gray-500">{t.taskForm.optional}</span>
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
          className={inputClass}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-red-600">
            {translateError(t, errors.description)}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Link
          href="/"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
        >
          {t.taskForm.cancel}
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? t.taskForm.saving : isEditing ? t.taskForm.save : t.taskForm.create}
        </button>
      </div>
    </form>
  );
}
