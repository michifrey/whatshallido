import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBewerbungen } from "../src/hooks/useBewerbungen";

const sample = { firma: "Muster AG", beruf: "Informatikerin EFZ", typ: "lehrstelle", status: "beworben", datum: "2026-06-03" } as const;

describe("useBewerbungen", () => {
  it("startet leer", () => {
    const { result } = renderHook(() => useBewerbungen());
    expect(result.current.items).toHaveLength(0);
  });

  it("add fügt hinzu und vergibt eine id", () => {
    const { result } = renderHook(() => useBewerbungen());
    act(() => { result.current.add({ ...sample }); });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBeTruthy();
    expect(result.current.items[0].firma).toBe("Muster AG");
  });

  it("update ändert den Status, remove löscht", () => {
    const { result } = renderHook(() => useBewerbungen());
    let id = "";
    act(() => { id = result.current.add({ ...sample }).id; });
    act(() => { result.current.update(id, { status: "zusage" }); });
    expect(result.current.items[0].status).toBe("zusage");
    act(() => { result.current.remove(id); });
    expect(result.current.items).toHaveLength(0);
  });
});
