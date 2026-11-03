import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it } from "vitest";
import { TASK_PAGE_SIZE } from "@/models/task.schema";
import { createCallerFactory } from "@/trpc/init";
import { appRouter } from "@/trpc/router";
import { UNKNOWN_ID, resetTaskStore } from "../helpers/store";

const api = createCallerFactory(appRouter)({ locale: "pt-BR" });

async function expectTRPCError(promise: Promise<unknown>, code: TRPCError["code"]) {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(TRPCError);
  expect((error as TRPCError).code).toBe(code);
}

beforeEach(resetTaskStore);

describe("task controller", () => {
  it("faz o ciclo completo usando só o id", async () => {
    const created = await api.task.create({ title: "Estudar", description: "tRPC" });

    expect(await api.task.getById({ id: created.id })).toEqual(created);

    const updated = await api.task.update({ id: created.id, title: "Estudar mais" });
    expect(updated).toMatchObject({
      id: created.id,
      title: "Estudar mais",
      createdAt: created.createdAt,
    });

    expect(await api.task.delete({ id: created.id })).toEqual({ id: created.id });
    expect((await api.task.list()).items).toEqual([]);
  });

  it("não cria tarefa sem título", async () => {
    await expectTRPCError(api.task.create({ title: "  " }), "BAD_REQUEST");
    expect((await api.task.list()).items).toEqual([]);
  });

  it("retorna NOT_FOUND para id inexistente", async () => {
    await expectTRPCError(api.task.getById({ id: UNKNOWN_ID }), "NOT_FOUND");
    await expectTRPCError(api.task.update({ id: UNKNOWN_ID, title: "x" }), "NOT_FOUND");
    await expectTRPCError(api.task.setCompleted({ id: UNKNOWN_ID, completed: true }), "NOT_FOUND");
    await expectTRPCError(api.task.delete({ id: UNKNOWN_ID }), "NOT_FOUND");
  });

  it("conclui e reabre a tarefa", async () => {
    const created = await api.task.create({ title: "Estudar" });

    expect(await api.task.setCompleted({ id: created.id, completed: true })).toEqual({
      ...created,
      completed: true,
    });
    expect((await api.task.setCompleted({ id: created.id, completed: false })).completed).toBe(
      false,
    );
  });

  it("não edita tarefa concluída, mas permite reabrir e então editar", async () => {
    const created = await api.task.create({ title: "Original" });
    await api.task.setCompleted({ id: created.id, completed: true });

    await expectTRPCError(
      api.task.update({ id: created.id, title: "Alterada" }),
      "PRECONDITION_FAILED",
    );
    expect((await api.task.getById({ id: created.id })).title).toBe("Original");

    await api.task.setCompleted({ id: created.id, completed: false });
    expect((await api.task.update({ id: created.id, title: "Alterada" })).title).toBe("Alterada");
  });

  it("exige status de conclusão booleano", async () => {
    const created = await api.task.create({ title: "Estudar" });
    await expectTRPCError(
      api.task.setCompleted({ id: created.id, completed: "sim" } as unknown as Parameters<
        typeof api.task.setCompleted
      >[0]),
      "BAD_REQUEST",
    );
  });

  it("retorna BAD_REQUEST para id inválido", async () => {
    await expectTRPCError(api.task.getById({ id: "abc" }), "BAD_REQUEST");
    await expectTRPCError(api.task.update({ id: "abc", title: "x" }), "BAD_REQUEST");
    await expectTRPCError(api.task.delete({ id: "abc" }), "BAD_REQUEST");
  });

  it("não deixa o cliente trocar o id nem o createdAt", async () => {
    const created = await api.task.create({ title: "Original" });

    const updated = await api.task.update({
      id: created.id,
      title: "Alterada",
      createdAt: "2000-01-01T00:00:00.000Z",
    } as Parameters<typeof api.task.update>[0]);

    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toBe(created.createdAt);
  });

  it("com títulos repetidos, altera e exclui só a tarefa do id", async () => {
    const target = await api.task.create({ title: "Repetida" });
    const other = await api.task.create({ title: "Repetida" });

    await api.task.update({ id: target.id, title: "Alterada" });
    expect(await api.task.getById({ id: other.id })).toEqual(other);

    await api.task.delete({ id: target.id });
    expect((await api.task.list()).items.map((task) => task.id)).toEqual([other.id]);
  });

  it("lista em páginas de TASK_PAGE_SIZE por padrão, seguindo o cursor até o fim", async () => {
    const total = TASK_PAGE_SIZE * 2 + 3;
    for (let i = 0; i < total; i++) await api.task.create({ title: `Tarefa ${i}` });

    const pages = [await api.task.list()];
    while (pages.at(-1)!.nextCursor)
      pages.push(await api.task.list({ cursor: pages.at(-1)!.nextCursor }));

    expect(pages.map((page) => page.items.length)).toEqual([TASK_PAGE_SIZE, TASK_PAGE_SIZE, 3]);
    expect(pages[0].total).toBe(total);
    expect(new Set(pages.flatMap((page) => page.items.map((task) => task.id))).size).toBe(total);
  });

  it("rejeita tamanho de página inválido", async () => {
    await expectTRPCError(api.task.list({ limit: 0 }), "BAD_REQUEST");
    await expectTRPCError(api.task.list({ limit: 51 }), "BAD_REQUEST");
    await expectTRPCError(api.task.list({ limit: 2.5 }), "BAD_REQUEST");
  });

  it("não encontra a tarefa depois de excluída", async () => {
    const created = await api.task.create({ title: "Temporária" });
    await api.task.delete({ id: created.id });

    await expectTRPCError(api.task.getById({ id: created.id }), "NOT_FOUND");
    await expectTRPCError(api.task.delete({ id: created.id }), "NOT_FOUND");
  });
});
