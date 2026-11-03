"use client";

import { useEffect } from "react";
import { useI18n } from "@/i18n/provider";
import { Feedback } from "@/views/components/Feedback";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4">
      <Feedback type="error" message={t.errorPage.message} />
      <button
        type="button"
        onClick={reset}
        className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        {t.errorPage.retry}
      </button>
    </div>
  );
}
