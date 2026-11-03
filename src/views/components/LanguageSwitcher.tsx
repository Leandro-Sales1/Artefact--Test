"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, localeLabels, locales, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeLocale(nextLocale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div role="group" aria-label={t.languageSwitcher.label} className="mb-6 flex justify-end gap-1">
      {locales.map((option) => {
        const isActive = option === locale;
        return (
          <button
            key={option}
            type="button"
            onClick={() => changeLocale(option)}
            disabled={isActive || isPending}
            aria-pressed={isActive}
            className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium disabled:cursor-default ${
              isActive ? "bg-gray-900 text-white" : "border border-gray-300 hover:bg-gray-100"
            }`}
          >
            {localeLabels[option]}
          </button>
        );
      })}
    </div>
  );
}
