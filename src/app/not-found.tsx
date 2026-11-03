import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export default async function NotFound() {
  const t = getDictionary(await getLocale());

  return (
    <div className="space-y-6">
      <h1 className="border-b-2 border-ink pb-5 font-serif text-3xl leading-tight font-medium">
        {t.notFound.heading}
      </h1>
      <p className="text-muted">{t.notFound.message}</p>
      <Link
        href="/"
        className="inline-block text-sm text-accent underline underline-offset-4 hover:text-accent-hover"
      >
        {t.notFound.back}
      </Link>
    </div>
  );
}
