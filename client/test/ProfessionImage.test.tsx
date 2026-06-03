import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfessionImage } from "../src/components/ProfessionImage";
import type { Category } from "../src/types";

const category: Category = { key: "it", name: "Informatik", emoji: "💻", color: "#0ea5e9" };

describe("ProfessionImage", () => {
  it("zeigt ein Foto, wenn imageUrl gesetzt ist", () => {
    render(<ProfessionImage category={category} imageUrl="https://example.com/foto.jpg" name="Test" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/foto.jpg");
    expect(img).toHaveAttribute("alt", "Test");
  });

  it("zeigt die SVG-Illustration mit Kategorie-Emoji, wenn kein Foto da ist", () => {
    render(<ProfessionImage category={category} imageUrl={null} name="Test" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getAllByText("💻").length).toBeGreaterThan(0);
  });
});
