import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getDictionary } from "@/i18n/dictionaries";
import { I18nProvider } from "@/i18n/provider";
import { getLocale } from "@/i18n/server";
import { TRPCProvider } from "@/trpc/provider";
import { LanguageSwitcher } from "@/views/components/LanguageSwitcher";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return getDictionary(await getLocale()).metadata;
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <I18nProvider locale={locale}>
          <TRPCProvider>
            <main className="mx-auto max-w-2xl px-4 py-10">
              <LanguageSwitcher />
              {children}
            </main>
          </TRPCProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
