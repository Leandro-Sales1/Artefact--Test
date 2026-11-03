import type { TRPCClientErrorLike } from "@trpc/client";
import type { Dictionary } from "@/i18n/dictionaries";
import type { AppRouter } from "@/trpc/router";

export function getErrorMessage(error: TRPCClientErrorLike<AppRouter>, t: Dictionary): string {
  // Sem `data`, a requisição nem chegou ao servidor.
  if (!error.data) return t.errors.network;
  return error.message;
}
