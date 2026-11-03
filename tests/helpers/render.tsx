import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { httpBatchLink } from "@trpc/client";
import type { ReactElement } from "react";
import { GET, POST } from "@/app/api/trpc/[trpc]/route";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { I18nProvider } from "@/i18n/provider";
import { trpc } from "@/trpc/client";
import { ToastProvider } from "@/views/components/Toast";

// Simula a rede: com `offline`, as requisições falham antes de chegar ao servidor.
export const network = { offline: false };

export function renderWithProviders(ui: ReactElement, locale: Locale = "pt-BR") {
  // O cliente tRPC chama o route handler direto: os componentes usam a API real, sem servidor.
  async function callApi(input: RequestInfo | URL, init?: RequestInit) {
    if (network.offline) throw new TypeError("Failed to fetch");

    const headers = new Headers(init?.headers);
    headers.set("cookie", `${LOCALE_COOKIE}=${locale}`);
    const request = new Request(new URL(String(input), "http://localhost"), {
      method: init?.method,
      body: init?.body,
      headers,
    });
    return request.method === "GET" ? GET(request) : POST(request);
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  });
  const trpcClient = trpc.createClient({
    links: [httpBatchLink({ url: "/api/trpc", fetch: callApi })],
  });

  return render(
    <I18nProvider locale={locale}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{ui}</ToastProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </I18nProvider>,
  );
}
