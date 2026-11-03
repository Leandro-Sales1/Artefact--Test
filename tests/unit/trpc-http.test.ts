import { beforeEach, describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/trpc/[trpc]/route";
import type { Task } from "@/models/task.schema";
import { UNKNOWN_ID, resetTaskStore } from "../helpers/store";

type TRPCResponse<T> = { result?: { data: T }; error?: { message: string; data: { code: string } } };

const url = (procedure: string) => `http://localhost/api/trpc/${procedure}`;
const cookieHeader = (locale?: string): Record<string, string> =>
  locale ? { cookie: `locale=${locale}` } : {};

async function query<T>(procedure: string, input?: unknown, locale?: string) {
  const search = input === undefined ? "" : `?input=${encodeURIComponent(JSON.stringify(input))}`;
  const response = await GET(new Request(url(procedure) + search, { headers: cookieHeader(locale) }));
  return { status: response.status, body: (await response.json()) as TRPCResponse<T> };
}

async function mutation<T>(procedure: string, input: unknown, locale?: string) {
  const response = await POST(
    new Request(url(procedure), {
      method: "POST",
      headers: { "content-type": "application/json", ...cookieHeader(locale) },
      body: JSON.stringify(input),
    }),
  );
  return { status: response.status, body: (await response.json()) as TRPCResponse<T> };
}

beforeEach(resetTaskStore);

describe("API HTTP /api/trpc", () => {
  it("faz o CRUD completo identificando a tarefa pelo id", async () => {
    const created = await mutation<Task>("task.create", { title: "Via HTTP" });
    expect(created.status).toBe(200);
    const id = created.body.result!.data.id;

    expect((await query<Task>("task.getById", { id })).body.result!.data.title).toBe("Via HTTP");

    const updated = await mutation<Task>("task.update", { id, title: "Alterada" });
    expect(updated.body.result!.data).toMatchObject({ id, title: "Alterada" });

    expect((await mutation("task.delete", { id })).status).toBe(200);
    expect((await query<Task[]>("task.list")).body.result!.data).toEqual([]);
  });

  it.each([
    [undefined, "O título é obrigatório"],
    ["pt-BR", "O título é obrigatório"],
    ["en", "Title is required"],
    ["fr", "O título é obrigatório"],
  ])("título vazio → 400 com mensagem traduzida (cookie %s)", async (locale, message) => {
    const { status, body } = await mutation("task.create", { title: "" }, locale);
    expect(status).toBe(400);
    expect(body.error).toMatchObject({ message, data: { code: "BAD_REQUEST" } });
  });

  it.each([
    ["pt-BR", "Tarefa não encontrada. Ela pode ter sido excluída."],
    ["en", "Task not found. It may have been deleted."],
  ])("id inexistente → 404 com mensagem traduzida (%s)", async (locale, message) => {
    for (const procedure of ["task.update", "task.delete"]) {
      const { status, body } = await mutation(procedure, { id: UNKNOWN_ID, title: "x" }, locale);
      expect(status).toBe(404);
      expect(body.error).toMatchObject({ message, data: { code: "NOT_FOUND" } });
    }
    const { status } = await query("task.getById", { id: UNKNOWN_ID }, locale);
    expect(status).toBe(404);
  });

  it("id ausente ou inválido → 400", async () => {
    const missing = await mutation("task.update", { title: "x" }, "en");
    expect(missing.status).toBe(400);
    expect(missing.body.error!.message).toBe("Invalid task ID");

    const invalid = await mutation("task.delete", { id: "abc" });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error!.message).toBe("ID de tarefa inválido");
  });
});
