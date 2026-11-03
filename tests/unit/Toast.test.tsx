// @vitest-environment jsdom
import { act, cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useToast } from "@/views/components/Toast";
import { renderWithProviders } from "../helpers/render";

function ToastTrigger() {
  const showToast = useToast();
  return (
    <>
      <button onClick={() => showToast({ type: "success", message: "Primeiro" })}>sucesso</button>
      <button onClick={() => showToast({ type: "error", message: "Segundo" })}>erro</button>
    </>
  );
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Toast", () => {
  it("mostra o mais recente primeiro, com papel de status ou alerta", () => {
    renderWithProviders(<ToastTrigger />);

    fireEvent.click(screen.getByText("sucesso"));
    fireEvent.click(screen.getByText("erro"));

    const messages = [...screen.getAllByRole("status"), ...screen.getAllByRole("alert")];
    expect(messages).toHaveLength(2);
    const order = screen.getAllByText(/Primeiro|Segundo/).map((element) => element.textContent);
    expect(order).toEqual(["Segundo", "Primeiro"]);
  });

  it("some sozinho depois de 5 segundos", () => {
    renderWithProviders(<ToastTrigger />);
    fireEvent.click(screen.getByText("sucesso"));

    act(() => vi.advanceTimersByTime(4_999));
    expect(screen.queryByText("Primeiro")).not.toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Primeiro")).toBeNull();
  });

  it("fecha pelo botão, sem afetar os outros", () => {
    renderWithProviders(<ToastTrigger />);
    fireEvent.click(screen.getByText("sucesso"));
    fireEvent.click(screen.getByText("erro"));

    fireEvent.click(screen.getAllByRole("button", { name: "Fechar mensagem" })[0]);

    expect(screen.queryByText("Segundo")).toBeNull();
    expect(screen.queryByText("Primeiro")).not.toBeNull();
  });
});
