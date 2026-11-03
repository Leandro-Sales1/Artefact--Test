"use client";

import { useEffect } from "react";
import { useI18n } from "@/i18n/provider";

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
    <div role="alert" className="space-y-6">
      <h1 className="border-b-2 border-ink pb-5 font-serif text-3xl leading-tight font-medium">
        {t.errorPage.heading}
      </h1>
      <p className="text-danger">{t.errorPage.message}</p>
      <button
        type="button"
        onClick={reset}
        className="cursor-pointer rounded-full bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover"
      >
        {t.errorPage.retry}
      </button>
    </div>
  );
}
