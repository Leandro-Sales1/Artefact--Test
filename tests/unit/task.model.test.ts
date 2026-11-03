import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { taskModel } from "@/models/task.model";
import { taskSchema } from "@/models/task.schema";
import { UNKNOWN_ID, resetTaskStore } from "../helpers/store";

beforeEach(resetTaskStore);
afterEach(() => vi.useRealTimers());

describe("taskModel", () => {
  it("cria a tarefa com id UUID e createdAt gerados, ainda não concluída", () => {
    const task = taskModel.create({ title: "Estudar" });

    expect(task.completed).toBe(false);
    expect(taskSchema.safeParse(task).success).toBe(true);
    expect(taskModel.findById(task.id)).toEqual(task);
  });

  it("gera ids diferentes para tarefas com os mesmos dados", () => {
    const a = taskModel.create({ title: "Igual", description: "Igual" });
    const b = taskModel.create({ title: "Igual", description: "Igual" });

    expect(a.id).not.toBe(b.id);
    expect(taskModel.findAll()).toHaveLength(2);
  });

  it("guarda descrição vazia como ausente", () => {
    const task = taskModel.create({ title: "Sem descrição", description: "" });
    expect(task.description).toBeUndefined();
  });

  it("lista da mais recente para a mais antiga", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
    const older = taskModel.create({ title: "Antiga" });
    vi.setSystemTime(new Date("2026-01-01T11:00:00Z"));
    const newer = taskModel.create({ title: "Nova" });

    expect(taskModel.findAll().map((task) => task.id)).toEqual([newer.id, older.id]);
  });

  it("atualiza apenas a tarefa do id informado, mantendo id e createdAt", () => {
    const target = taskModel.create({ title: "Igual" });
    const other = taskModel.create({ title: "Igual" });

    const updated = taskModel.update(target.id, { title: "Alterada", description: "Nova" });

    expect(updated).toEqual({ ...target, title: "Alterada", description: "Nova" });
    expect(taskModel.findById(other.id)).toEqual(other);
  });

  it("marca e desmarca a conclusão só da tarefa do id informado", () => {
    const target = taskModel.create({ title: "Igual" });
    const other = taskModel.create({ title: "Igual" });

    expect(taskModel.setCompleted(target.id, true)).toEqual({ ...target, completed: true });
    expect(taskModel.findById(other.id)).toEqual(other);
    expect(taskModel.setCompleted(target.id, false)?.completed).toBe(false);
  });

  it("remove apenas a tarefa do id informado", () => {
    const target = taskModel.create({ title: "Igual" });
    const other = taskModel.create({ title: "Igual" });

    expect(taskModel.remove(target.id)).toBe(true);
    expect(taskModel.findById(target.id)).toBeNull();
    expect(taskModel.findById(other.id)).toEqual(other);
  });

  it("sinaliza id inexistente sem lançar erro", () => {
    expect(taskModel.findById(UNKNOWN_ID)).toBeNull();
    expect(taskModel.update(UNKNOWN_ID, { title: "x" })).toBeNull();
    expect(taskModel.setCompleted(UNKNOWN_ID, true)).toBeNull();
    expect(taskModel.remove(UNKNOWN_ID)).toBe(false);
  });
});
