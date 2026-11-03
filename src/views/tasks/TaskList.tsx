"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n/provider";
import { TASK_PAGE_SIZE, type TaskPage } from "@/models/task.schema";
import { trpc } from "@/trpc/client";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  firstPage: TaskPage;
};

export function TaskList({ firstPage }: TaskListProps) {
  const { t } = useI18n();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    trpc.task.list.useInfiniteQuery(
      { limit: TASK_PAGE_SIZE },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        // Só é usada quando a lista ainda não está no cache: trocar de idioma
        // renderiza a página de novo, mas mantém as páginas já carregadas.
        initialData: { pages: [firstPage], pageParams: [null] },
      },
    );

  const tasks = data.pages.flatMap((page) => page.items);
  const total = data.pages[0]?.total ?? 0;
  const canLoadMore = hasNextPage && !isFetchingNextPage && !isFetchNextPageError;

  // Busca a próxima página quando o fim da lista se aproxima da área visível.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !canLoadMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoadMore, fetchNextPage]);

  return (
    <section>
      <header className="flex items-end justify-between gap-4 border-b-2 border-ink pb-5">
        <div>
          <h1 className="font-serif text-3xl leading-tight font-medium">{t.taskList.heading}</h1>
          <p className="mt-2 text-xs text-muted">{t.taskList.count(total)}</p>
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

      <div ref={sentinelRef} className="py-8 text-center text-sm text-muted">
        {isFetchingNextPage && <p role="status">{t.taskList.loadingMore}</p>}

        {isFetchNextPageError && (
          <div role="alert" className="space-y-3">
            <p className="text-danger">{t.taskList.loadMoreFailed}</p>
            <button
              type="button"
              onClick={() => fetchNextPage()}
              className="cursor-pointer text-accent underline underline-offset-4 hover:text-accent-hover"
            >
              {t.taskList.retry}
            </button>
          </div>
        )}

        {!hasNextPage && tasks.length > TASK_PAGE_SIZE && <p>{t.taskList.allLoaded}</p>}
      </div>
    </section>
  );
}
