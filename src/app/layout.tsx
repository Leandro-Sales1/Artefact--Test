import type { Metadata } from "next";
import { Newsreader, Public_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { getDictionary } from "@/i18n/dictionaries";
import { I18nProvider } from "@/i18n/provider";
import { getLocale } from "@/i18n/server";
import { TRPCProvider } from "@/trpc/provider";
import { LanguageSwitcher } from "@/views/components/LanguageSwitcher";
import { ToastProvider } from "@/views/components/Toast";
import "./globals.css";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public-sans" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" });

export async function generateMetadata(): Promise<Metadata> {
  return getDictionary(await getLocale()).metadata;
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${publicSans.variable} ${newsreader.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <I18nProvider locale={locale}>
          <TRPCProvider>
            <ToastProvider>
              <main className="mx-auto max-w-2xl px-4 py-14">
                <LanguageSwitcher />
                {children}
              </main>
            </ToastProvider>
          </TRPCProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
