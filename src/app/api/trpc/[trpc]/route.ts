import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { getLocaleFromCookieHeader } from "@/i18n/config";
import { appRouter } from "@/trpc/router";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({ locale: getLocaleFromCookieHeader(req.headers.get("cookie")) }),
    onError: ({ error, path }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") console.error(`[tRPC] ${path}:`, error);
    },
  });
}

export { handler as GET, handler as POST };
