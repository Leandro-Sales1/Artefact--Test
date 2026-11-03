// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { taskModel } from "@/models/task.model";
import { TaskForm } from "@/views/tasks/TaskForm";
import { network, renderWithProviders } from "../helpers/render";
import { resetTaskStore } from "../helpers/store";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

beforeEach(() => {
  resetTaskStore();
  vi.clearAllMocks();
  network.offline = false;
});
afterEach(cleanup);

function fillAndSubmit(title: string, description?: string) {
  fireEvent.change(screen.getByLabelText(/Título/), { target: { value: title } });
  if (description !== undefined) {
    fireEvent.change(screen.getByLabelText(/Descrição/), { target: { value: description } });
  }
  fireEvent.click(screen.getByRole("button", { name: /Criar tarefa|Salvar alterações/ }));
}

describe("TaskForm", () => {
  it("valida no navegador e não envia a requisição com título vazio", () => {
    renderWithProviders(<TaskForm />);

    fillAndSubmit("   ");

    expect(screen.getByText("O título é obrigatório")).not.toBeNull();
    expect(screen.getByLabelText(/Título/).getAttribute("aria-invalid")).toBe("true");
    expect(taskModel.findAll()).toEqual([]);
  });

  it("limpa o erro do campo assim que o usuário digita", () => {
    renderWithProviders(<TaskForm />);
    fillAndSubmit("");

    fireEvent.change(screen.getByLabelText(/Título/), { target: { value: "E" } });

    expect(screen.queryByText("O título é obrigatório")).toBeNull();
  });

  it("valida o tamanho máximo do título", () => {
    renderWithProviders(<TaskForm />);
    fillAndSubmit("x".repeat(101));
    expect(screen.getByText("O título deve ter no máximo 100 caracteres")).not.toBeNull();
  });

  it("cria a tarefa, mostra o toast e volta para a lista", async () => {
    renderWithProviders(<TaskForm />);

    fillAndSubmit("Estudar tRPC", "Ler a documentação");

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/"));
    expect(screen.getByText('Tarefa "Estudar tRPC" criada com sucesso!')).not.toBeNull();
    expect(taskModel.findAll()).toMatchObject([
      { title: "Estudar tRPC", description: "Ler a documentação" },
    ]);
  });

  it("edita a tarefa existente pelo id", async () => {
    const task = taskModel.create({ title: "Original", description: "Antiga" });
    renderWithProviders(<TaskForm task={task} />);

    expect(screen.getByRole("heading", { name: "Editar tarefa" })).not.toBeNull();
    fillAndSubmit("Alterada", "");

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/"));
    expect(screen.getByText('Tarefa "Alterada" atualizada com sucesso!')).not.toBeNull();
    expect(taskModel.findById(task.id)).toMatchObject({
      title: "Alterada",
      description: undefined,
    });
  });

  it("volta para a lista com erro se a tarefa foi concluída durante a edição", async () => {
    const task = taskModel.create({ title: "Original" });
    renderWithProviders(<TaskForm task={task} />);
    taskModel.setCompleted(task.id, true);

    fillAndSubmit("Alterada");

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/"));
    expect(
      screen.getByText("Tarefas concluídas não podem ser editadas. Reabra a tarefa para editá-la."),
    ).not.toBeNull();
    expect(taskModel.findById(task.id)?.title).toBe("Original");
  });

  it("mostra erro de rede e mantém o usuário no formulário", async () => {
    network.offline = true;
    renderWithProviders(<TaskForm />);

    fillAndSubmit("Sem conexão");

    expect(
      await screen.findByText(
        "Não foi possível se comunicar com o servidor. Verifique sua conexão e tente novamente.",
      ),
    ).not.toBeNull();
    expect(router.push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Criar tarefa" })).not.toHaveProperty(
      "disabled",
      true,
    );
  });
});
