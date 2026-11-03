// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "@/views/components/LanguageSwitcher";
import { renderWithProviders } from "../helpers/render";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe("LanguageSwitcher", () => {
  it("marca o idioma atual e não deixa clicar nele", () => {
    renderWithProviders(<LanguageSwitcher />, "en");

    const english = screen.getByRole("button", { name: "EN" });
    expect(english.getAttribute("aria-pressed")).toBe("true");
    expect(english).toHaveProperty("disabled", true);
    expect(screen.getByRole("group", { name: "Language" })).not.toBeNull();
  });

  it("grava o cookie e renderiza a página de novo no idioma escolhido", () => {
    renderWithProviders(<LanguageSwitcher />);

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(document.cookie).toContain("locale=en");
    expect(router.refresh).toHaveBeenCalled();
  });
});
