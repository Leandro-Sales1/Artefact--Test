// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "@/app/error";
import NotFound from "@/app/not-found";
import HomePage from "@/app/page";
import EditTaskPage from "@/app/tasks/[id]/edit/page";
import { taskModel } from "@/models/task.model";
import { renderWithProviders } from "../helpers/render";
import { UNKNOWN_ID, resetTaskStore } from "../helpers/store";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useRouter: () => router,
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));

const editPage = (id: string) => EditTaskPage({ params: Promise.resolve({ id }) });

beforeEach(resetTaskStore);
afterEach(cleanup);

describe("página da lista", () => {
  it("renderiza no servidor só a primeira página", async () => {
    for (let i = 0; i < 7; i++) taskModel.create({ title: `Tarefa ${i}` });
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );

    renderWithProviders(await HomePage());

    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByText("7 tarefas")).not.toBeNull();
    vi.unstubAllGlobals();
  });
});

describe("página de edição", () => {
  it("carrega a tarefa pelo id no formulário", async () => {
    const task = taskModel.create({ title: "Editável" });
    renderWithProviders(await editPage(task.id));

    expect(screen.getByLabelText(/Título/)).toHaveProperty("value", "Editável");
  });

  it("explica que tarefa concluída não pode ser editada, sem mostrar o formulário", async () => {
    const task = taskModel.setCompleted(taskModel.create({ title: "Feita" }).id, true)!;
    render(await editPage(task.id));

    expect(
      screen.getByText("Tarefas concluídas não podem ser editadas. Reabra a tarefa para editá-la."),
    ).not.toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByRole("link", { name: "Voltar para a lista de tarefas" })).not.toBeNull();
  });

  it.each([
    ["inexistente", UNKNOWN_ID],
    ["inválido", "abc"],
  ])("responde 404 para id %s", async (_, id) => {
    await expect(editPage(id)).rejects.toMatchObject({ digest: expect.stringContaining("404") });
  });
});

describe("páginas de erro", () => {
  it("not-found explica o problema e leva de volta à lista", async () => {
    render(await NotFound());

    expect(screen.getByRole("heading", { name: "Não encontrado" })).not.toBeNull();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/");
  });

  it("error mostra a mensagem e tenta de novo", () => {
    const reset = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithProviders(<ErrorPage error={new Error("falhou")} reset={reset} />);

    expect(screen.getByRole("alert").textContent).toContain(
      "Ocorreu um erro inesperado ao carregar esta página.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(reset).toHaveBeenCalled();
  });
});
