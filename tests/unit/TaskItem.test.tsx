// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { taskModel } from "@/models/task.model";
import type { Task } from "@/models/task.schema";
import { TaskItem } from "@/views/tasks/TaskItem";
import { renderWithProviders } from "../helpers/render";
import { resetTaskStore } from "../helpers/store";

function renderItem(task: Task) {
  return renderWithProviders(
    <ul>
      <TaskItem task={task} />
    </ul>,
  );
}

beforeEach(() => {
  resetTaskStore();
  vi.restoreAllMocks();
});
afterEach(cleanup);

describe("TaskItem", () => {
  it("mostra título, descrição, data e as ações ligadas ao título", () => {
    const task = taskModel.create({ title: "Estudar", description: "tRPC" });
    renderItem(task);

    const title = screen.getByRole("heading", { name: "Estudar" });
    expect(screen.getByText("tRPC")).not.toBeNull();
    expect(screen.getByText(/^Criada em/)).not.toBeNull();

    const edit = screen.getByRole("link", { name: "Editar" });
    expect(edit.getAttribute("href")).toBe(`/tasks/${task.id}/edit`);
    for (const control of [
      edit,
      screen.getByRole("button", { name: "Excluir" }),
      screen.getByRole("switch"),
    ]) {
      expect(control.getAttribute("aria-describedby")).toBe(title.id);
    }
  });

  it("tarefa concluída fica com fundo verde e sem o link de edição", () => {
    const task = taskModel.setCompleted(taskModel.create({ title: "Feita" }).id, true)!;
    renderItem(task);

    expect(screen.queryByRole("link", { name: "Editar" })).toBeNull();
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("listitem").className).toContain("bg-accent/10");
  });

  it("marca como concluída pelo toggle e avisa com toast", async () => {
    const task = taskModel.create({ title: "Estudar" });
    renderItem(task);

    fireEvent.click(screen.getByRole("switch"));

    expect(await screen.findByText('Tarefa "Estudar" marcada como concluída!')).not.toBeNull();
    expect(taskModel.findById(task.id)?.completed).toBe(true);
  });

  it("reabre uma tarefa concluída", async () => {
    const task = taskModel.setCompleted(taskModel.create({ title: "Feita" }).id, true)!;
    renderItem(task);

    fireEvent.click(screen.getByRole("switch"));

    expect(await screen.findByText('Tarefa "Feita" reaberta!')).not.toBeNull();
    expect(taskModel.findById(task.id)?.completed).toBe(false);
  });

  it("exclui depois de confirmar", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const task = taskModel.create({ title: "Temporária" });
    renderItem(task);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(await screen.findByText('Tarefa "Temporária" excluída com sucesso!')).not.toBeNull();
    expect(taskModel.findById(task.id)).toBeNull();
  });

  it("não exclui se o usuário cancelar", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const task = taskModel.create({ title: "Fica" });
    renderItem(task);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(taskModel.findById(task.id)).not.toBeNull();
  });

  it("avisa quando a tarefa já tinha sido excluída em outra aba", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const task = taskModel.create({ title: "Já foi" });
    renderItem(task);
    taskModel.remove(task.id);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(
      await screen.findByText("Tarefa não encontrada. Ela pode ter sido excluída."),
    ).not.toBeNull();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Excluir" })).toHaveProperty("disabled", false),
    );
  });
});
