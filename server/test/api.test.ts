import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { seedDatabase } from "../src/db/seed.js";

let server: Server;
let base: string;
const auth = { "Content-Type": "application/json", "x-admin-token": "test-token" };

beforeAll(async () => {
  seedDatabase();
  server = createApp().listen(0);
  await new Promise((r) => server.once("listening", r));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  base = `http://localhost:${port}`;
});

afterAll(() => server.close());

describe("öffentliche API", () => {
  it("GET /api/health", async () => {
    const res = await fetch(`${base}/api/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("GET /api/professions liefert eine Liste", async () => {
    const res = await fetch(`${base}/api/professions`);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(100);
  });

  it("GET /api/professions?category=it filtert", async () => {
    const res = await fetch(`${base}/api/professions?category=it`);
    const data = await res.json();
    expect(data.every((p: { category: string }) => p.category === "it")).toBe(true);
  });

  it("GET /api/professions mit ungültigem Typ -> 400", async () => {
    const res = await fetch(`${base}/api/professions?type=quatsch`);
    expect(res.status).toBe(400);
  });

  it("POST /api/professions/recommend", async () => {
    const res = await fetch(`${base}/api/professions/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dimensions: ["praktisch"], limit: 3 }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBeLessThanOrEqual(3);
  });

  it("GET /api/taxonomy und /api/test", async () => {
    const tax = await (await fetch(`${base}/api/taxonomy`)).json();
    expect(tax.categories.length).toBe(10);
    expect(tax.dimensions.length).toBe(6);
    const test = await (await fetch(`${base}/api/test`)).json();
    expect(test.interestQuestions.length).toBe(18);
    expect(test.abilityQuestions.length).toBe(6);
  });

  it("GET /api/cantons liefert 26 Kantone", async () => {
    const data = await (await fetch(`${base}/api/cantons`)).json();
    expect(data.length).toBe(26);
  });

  it("GET /api/professions/:id/placements liefert Such-Links", async () => {
    const first = (await (await fetch(`${base}/api/professions`)).json())[0];
    const res = await fetch(`${base}/api/professions/${first.id}/placements?canton=ZH&mode=schnupperlehre`);
    expect(res.status).toBe(200);
    const links = await res.json();
    expect(Array.isArray(links)).toBe(true);
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links.every((l: { url: string }) => l.url.startsWith("http"))).toBe(true);
  });
});

describe("Admin-API (geschützt)", () => {
  it("ohne Token -> 401", async () => {
    const res = await fetch(`${base}/api/admin/professions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    expect(res.status).toBe(401);
  });

  it("CRUD-Zyklus: anlegen, ändern, löschen", async () => {
    const create = await fetch(`${base}/api/admin/professions`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        name: "Test-Beruf EFZ",
        category: "technik",
        tags: ["praktisch", "forschend"],
        description: "nur ein Test",
      }),
    });
    expect(create.status).toBe(201);
    const created = await create.json();
    expect(created.id).toBe("test-beruf-efz");
    expect(created.videoUrl).toContain("youtube");

    const update = await fetch(`${base}/api/admin/professions/${created.id}`, {
      method: "PUT",
      headers: auth,
      body: JSON.stringify({ imageUrl: "https://example.com/x.jpg" }),
    });
    expect(update.status).toBe(200);
    expect((await update.json()).imageUrl).toBe("https://example.com/x.jpg");

    const del = await fetch(`${base}/api/admin/professions/${created.id}`, {
      method: "DELETE",
      headers: auth,
    });
    expect(del.status).toBe(204);

    const gone = await fetch(`${base}/api/professions/${created.id}`);
    expect(gone.status).toBe(404);
  });

  it("Validierung: fehlende Tags -> 400", async () => {
    const res = await fetch(`${base}/api/admin/professions`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ name: "X", category: "technik", tags: [] }),
    });
    expect(res.status).toBe(400);
  });

  it("Bildersuche ohne Key -> 503", async () => {
    const res = await fetch(`${base}/api/admin/images?q=koch`, { headers: auth });
    expect(res.status).toBe(503);
  });
});
