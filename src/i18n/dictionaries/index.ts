import type { Locale } from "@/i18n/config";
import { en } from "./en";
import { ptBR, type Dictionary } from "./pt-BR";

export type { Dictionary };

export type ErrorKey = keyof Dictionary["errors"];

const dictionaries: Record<Locale, Dictionary> = {
  "pt-BR": ptBR,
  en,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function translateError(dictionary: Dictionary, message: string): string {
  return Object.hasOwn(dictionary.errors, message)
    ? dictionary.errors[message as ErrorKey]
    : message;
}
