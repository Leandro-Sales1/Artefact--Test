import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import { defaultLocale, type Locale } from "@/i18n/config";
import { getDictionary, translateError } from "@/i18n/dictionaries";

export type Context = {
  locale: Locale;
};

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error, ctx }) {
    const dictionary = getDictionary(ctx?.locale ?? defaultLocale);
    // Erros inesperados não expõem detalhes internos ao usuário.
    const message =
      error.code === "INTERNAL_SERVER_ERROR"
        ? dictionary.errors.unexpected
        : error.cause instanceof ZodError
          ? error.cause.issues.map((issue) => translateError(dictionary, issue.message)).join("; ")
          : translateError(dictionary, shape.message);

    // O stack fica só no log do servidor (onError da rota), nunca na resposta.
    return { ...shape, message, data: { ...shape.data, stack: undefined } };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
