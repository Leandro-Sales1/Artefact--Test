import { describe, expect, it } from "vitest";
import { defaultLocale, getLocaleFromCookieHeader, locales, resolveLocale } from "@/i18n/config";
import { getDictionary, translateError } from "@/i18n/dictionaries";

function shape(value: unknown, path = ""): string[] {
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => shape(child, path ? `${path}.${key}` : key));
  }
  return [`${path}:${typeof value}`];
}

describe("dicionários", () => {
  it("todos os idiomas têm as mesmas chaves e tipos do pt-BR", () => {
    const reference = shape(getDictionary("pt-BR")).sort();
    for (const locale of locales) {
      expect(shape(getDictionary(locale)).sort(), locale).toEqual(reference);
    }
  });

  it("nenhum texto está vazio", () => {
    for (const locale of locales) {
      const texts = Object.values(getDictionary(locale)).flatMap((section) => Object.values(section));
      for (const text of texts) {
        const value = typeof text === "function" ? text("x") : text;
        expect(value.trim().length, locale).toBeGreaterThan(0);
      }
    }
  });

  it("interpola os textos com variáveis", () => {
    expect(getDictionary("pt-BR").taskItem.deleted("Estudar")).toBe('Tarefa "Estudar" excluída com sucesso!');
    expect(getDictionary("en").taskItem.deleted("Study")).toBe('Task "Study" deleted successfully!');
  });
});

describe("translateError", () => {
  it("traduz chaves conhecidas", () => {
    expect(translateError(getDictionary("en"), "titleRequired")).toBe("Title is required");
    expect(translateError(getDictionary("pt-BR"), "taskNotFound")).toBe(
      "Tarefa não encontrada. Ela pode ter sido excluída.",
    );
  });

  it("devolve mensagens desconhecidas sem alteração", () => {
    expect(translateError(getDictionary("en"), "Algo deu errado")).toBe("Algo deu errado");
    expect(translateError(getDictionary("en"), "toString")).toBe("toString");
  });
});

describe("resolução do idioma", () => {
  it.each([
    ["pt-BR", "pt-BR"],
    ["en", "en"],
    ["fr", defaultLocale],
    [undefined, defaultLocale],
  ])("resolveLocale(%s) → %s", (input, expected) => {
    expect(resolveLocale(input)).toBe(expected);
  });

  it.each([
    [null, defaultLocale],
    ["locale=en", "en"],
    ["theme=dark; locale=en; other=1", "en"],
    ["mylocale=en", defaultLocale],
    ["locale=xx", defaultLocale],
  ])("cookie %s → %s", (header, expected) => {
    expect(getLocaleFromCookieHeader(header)).toBe(expected);
  });
});
