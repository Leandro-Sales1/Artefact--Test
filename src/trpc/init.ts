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
    const message =
      error.cause instanceof ZodError
        ? error.cause.issues.map((issue) => translateError(dictionary, issue.message)).join("; ")
        : translateError(dictionary, shape.message);

    return { ...shape, message };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
