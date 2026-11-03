import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export default async function NotFound() {
  const t = getDictionary(await getLocale());

  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-bold">{t.notFound.heading}</h1>
      <p className="text-gray-600">{t.notFound.message}</p>
      <Link href="/" className="inline-block text-blue-600 hover:underline">
        {t.notFound.back}
      </Link>
    </div>
  );
}
