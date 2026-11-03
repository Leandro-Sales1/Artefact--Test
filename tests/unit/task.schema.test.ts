import { describe, expect, it } from "vitest";
import { taskIdSchema, taskInputSchema, taskSchema, updateTaskSchema } from "@/models/task.schema";

const VALID_ID = "7d1f58f1-94d0-4853-9b2b-43677ccff4d5";

function firstIssue(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0]?.message;
}

describe("taskSchema", () => {
  it("exige o id", () => {
    const result = taskSchema.safeParse({ title: "Tarefa", createdAt: new Date().toISOString() });
    expect(result.success).toBe(false);
    expect(firstIssue(result)).toBe("invalidId");
  });

  it("aceita uma tarefa completa", () => {
    const result = taskSchema.safeParse({
      id: VALID_ID,
      title: "Tarefa",
      description: "Descrição",
      completed: true,
      createdAt: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });
});

describe("taskIdSchema", () => {
  it.each([
    ["ausente", {}],
    ["vazio", { id: "" }],
    ["fora do formato UUID", { id: "123" }],
    ["de outro tipo", { id: 123 }],
  ])("rejeita id %s", (_, input) => {
    const result = taskIdSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(firstIssue(result)).toBe("invalidId");
  });

  it("aceita um UUID", () => {
    expect(taskIdSchema.safeParse({ id: VALID_ID }).success).toBe(true);
  });

  it("descarta qualquer prop além do id", () => {
    const result = taskIdSchema.parse({ id: VALID_ID, title: "Outra prop" });
    expect(result).toEqual({ id: VALID_ID });
  });
});

describe("taskInputSchema", () => {
  it.each([
    ["ausente", {}],
    ["vazio", { title: "" }],
    ["só com espaços", { title: "   " }],
  ])("rejeita título %s", (_, input) => {
    const result = taskInputSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(firstIssue(result)).toBe("titleRequired");
  });

  it("remove espaços do título e da descrição", () => {
    expect(taskInputSchema.parse({ title: "  Estudar  ", description: "  tRPC  " })).toEqual({
      title: "Estudar",
      description: "tRPC",
    });
  });

  it("limita o título a 100 caracteres", () => {
    expect(taskInputSchema.safeParse({ title: "a".repeat(100) }).success).toBe(true);
    expect(firstIssue(taskInputSchema.safeParse({ title: "a".repeat(101) }))).toBe("titleTooLong");
  });

  it("limita a descrição a 500 caracteres", () => {
    const result = taskInputSchema.safeParse({ title: "ok", description: "a".repeat(501) });
    expect(firstIssue(result)).toBe("descriptionTooLong");
  });

  it("não aceita id nem createdAt vindos do cliente", () => {
    const result = taskInputSchema.parse({
      title: "ok",
      id: VALID_ID,
      createdAt: "2020-01-01T00:00:00Z",
    });
    expect(result).toEqual({ title: "ok" });
  });
});

describe("updateTaskSchema", () => {
  it("exige o id", () => {
    const result = updateTaskSchema.safeParse({ title: "Sem id" });
    expect(result.success).toBe(false);
    expect(firstIssue(result)).toBe("invalidId");
  });

  it("aceita id + campos editáveis e descarta o resto", () => {
    const result = updateTaskSchema.parse({ id: VALID_ID, title: "Novo", createdAt: "x" });
    expect(result).toEqual({ id: VALID_ID, title: "Novo" });
  });
});
