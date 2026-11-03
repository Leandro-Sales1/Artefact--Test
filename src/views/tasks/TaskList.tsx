"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import type { Task } from "@/models/task.schema";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
};

export function TaskList({ tasks }: TaskListProps) {
  const { t } = useI18n();

  return (
    <section>
      <header className="flex items-end justify-between gap-4 border-b-2 border-ink pb-5">
        <div>
          <h1 className="font-serif text-3xl leading-tight font-medium">{t.taskList.heading}</h1>
          <p className="mt-2 text-xs text-muted">{t.taskList.count(tasks.length)}</p>
        </div>
        <Link
          href="/tasks/new"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-accent-hover"
        >
          {t.taskList.newTask}
        </Link>
      </header>

      {tasks.length === 0 ? (
        <p className="mt-8 py-12 text-center text-muted">{t.taskList.empty}</p>
      ) : (
        <ul className="flex flex-col gap-4 pt-8">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}
