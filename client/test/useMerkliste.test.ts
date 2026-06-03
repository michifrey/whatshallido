import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMerkliste } from "../src/hooks/useMerkliste";

describe("useMerkliste", () => {
  it("startet leer", () => {
    const { result } = renderHook(() => useMerkliste());
    expect(result.current.count).toBe(0);
  });

  it("toggle fügt hinzu und entfernt, und speichert in localStorage", () => {
    const { result } = renderHook(() => useMerkliste());

    act(() => result.current.toggle("koch-koechin-efz"));
    expect(result.current.has("koch-koechin-efz")).toBe(true);
    expect(result.current.count).toBe(1);
    expect(JSON.parse(localStorage.getItem("bk-merkliste")!)).toContain("koch-koechin-efz");

    act(() => result.current.toggle("koch-koechin-efz"));
    expect(result.current.has("koch-koechin-efz")).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it("clear leert die ganze Liste", () => {
    const { result } = renderHook(() => useMerkliste());
    act(() => result.current.toggle("a"));
    act(() => result.current.toggle("b"));
    expect(result.current.count).toBe(2);
    act(() => result.current.clear());
    expect(result.current.count).toBe(0);
  });
});
