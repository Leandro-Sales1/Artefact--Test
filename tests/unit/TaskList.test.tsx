// @vitest-environment jsdom
import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { taskModel } from "@/models/task.model";
import { TASK_PAGE_SIZE } from "@/models/task.schema";
import { TaskList } from "@/views/tasks/TaskList";
import { network, renderWithProviders } from "../helpers/render";
import { resetTaskStore } from "../helpers/store";

// O jsdom não tem IntersectionObserver: o teste decide quando o fim da lista "aparece".
let reachEnd: () => void = () => {};
class FakeIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    reachEnd = () =>
      callback([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
  }
  observe() {}
  disconnect() {
    reachEnd = () => {};
  }
}

function createTasks(count: number) {
  for (let i = 1; i <= count; i++) taskModel.create({ title: `Tarefa ${i}` });
}

function renderList() {
  return renderWithProviders(<TaskList firstPage={taskModel.findPage(TASK_PAGE_SIZE)} />);
}

beforeEach(() => {
  resetTaskStore();
  network.offline = false;
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("TaskList", () => {
  it("mostra o estado vazio", () => {
    renderList();
    expect(
      screen.getByText("Nenhuma tarefa cadastrada ainda. Que tal criar a primeira?"),
    ).not.toBeNull();
    expect(screen.getByText("0 tarefas")).not.toBeNull();
  });

  it("renderiza a primeira página recebida do servidor e o total", () => {
    createTasks(TASK_PAGE_SIZE + 2);
    renderList();

    expect(screen.getAllByRole("listitem")).toHaveLength(TASK_PAGE_SIZE);
    expect(screen.getByText(`${TASK_PAGE_SIZE + 2} tarefas`)).not.toBeNull();
    expect(screen.getByRole("link", { name: "Nova tarefa" }).getAttribute("href")).toBe(
      "/tasks/new",
    );
  });

  it("carrega a próxima página ao chegar no fim da lista, até acabar", async () => {
    createTasks(TASK_PAGE_SIZE + 2);
    renderList();

    act(() => reachEnd());

    expect(await screen.findByText("Todas as tarefas foram carregadas.")).not.toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(TASK_PAGE_SIZE + 2);
  });

  it("mostra erro e permite tentar de novo quando a próxima página falha", async () => {
    createTasks(TASK_PAGE_SIZE + 1);
    renderList();

    network.offline = true;
    act(() => reachEnd());
    expect(await screen.findByText("Não foi possível carregar mais tarefas.")).not.toBeNull();

    network.offline = false;
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(TASK_PAGE_SIZE + 1));
    expect(screen.queryByText("Não foi possível carregar mais tarefas.")).toBeNull();
  });
});
