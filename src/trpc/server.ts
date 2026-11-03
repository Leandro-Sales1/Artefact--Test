import { getLocale } from "@/i18n/server";
import { createCallerFactory } from "./init";
import { appRouter } from "./router";

const createCaller = createCallerFactory(appRouter);

export async function getServerApi() {
  return createCaller({ locale: await getLocale() });
}
