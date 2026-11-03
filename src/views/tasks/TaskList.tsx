"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import type { Task } from "@/models/task.schema";
import { Feedback, type FeedbackMessage } from "@/views/components/Feedback";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
  feedbackKey?: string;
};

function getInitialFeedback(t: Dictionary, feedbackKey?: string): FeedbackMessage | null {
  if (feedbackKey === "created") return { type: "success", message: t.taskList.created };
  if (feedbackKey === "updated") return { type: "success", message: t.taskList.updated };
  return null;
}

export function TaskList({ tasks, feedbackKey }: TaskListProps) {
  const { t } = useI18n();
  const [feedback, setFeedback] = useState(() => getInitialFeedback(t, feedbackKey));

  // Tira o ?feedback= da URL para a mensagem não reaparecer ao recarregar.
  useEffect(() => {
    if (feedbackKey) window.history.replaceState(null, "", window.location.pathname);
  }, [feedbackKey]);

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t.taskList.heading}</h1>
        <Link
          href="/tasks/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {t.taskList.newTask}
        </Link>
      </header>

      {feedback && (
        <Feedback {...feedback} onClose={() => setFeedback(null)} closeLabel={t.feedback.close} />
      )}

      {tasks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          {t.taskList.empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onFeedback={setFeedback} />
          ))}
        </ul>
      )}
    </section>
  );
}
