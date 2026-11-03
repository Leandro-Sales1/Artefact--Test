import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { describe, expect, it } from "vitest";
import type { Locale } from "@/i18n/config";
import { publicProcedure, router } from "@/trpc/init";

const testRouter = router({
  crash: publicProcedure.query(() => {
    throw new Error("connection refused at 10.0.0.5:5432");
  }),
});

async function callCrash(locale: Locale) {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: new Request("http://localhost/api/trpc/crash"),
    router: testRouter,
    createContext: () => ({ locale }),
  });
  return { status: response.status, body: await response.json() };
}

describe("formatação de erros do tRPC", () => {
  it.each([
    ["pt-BR", "Ocorreu um erro inesperado no servidor. Tente novamente em instantes."],
    ["en", "An unexpected server error occurred. Please try again shortly."],
  ] as const)(
    "erro inesperado → 500 com mensagem genérica, sem detalhes internos (%s)",
    async (locale, message) => {
      const { status, body } = await callCrash(locale);
      expect(status).toBe(500);
      expect(body.error).toMatchObject({ message, data: { code: "INTERNAL_SERVER_ERROR" } });
      expect(JSON.stringify(body)).not.toContain("10.0.0.5");
    },
  );
});
