import type { Profession } from "../types";

export interface ImageSuggestion {
  id: string;
  url: string;
  thumb: string;
  author: string;
  authorUrl: string;
}

export interface ProfessionInput {
  id?: string;
  name: string;
  category: string;
  type: "lehre" | "weiterfuehrend";
  duration?: string | null;
  tags: string[];
  description?: string | null;
  imageUrl?: string | null;
}

function authHeaders(token: string): Record<string, string> {
  return { "Content-Type": "application/json", "x-admin-token": token };
}

async function handle<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && (data.error as string)) || `Fehler ${res.status}`);
  }
  return data as T;
}

export const adminApi = {
  check: async (token: string): Promise<boolean> => {
    const res = await fetch("/api/admin/check", { headers: authHeaders(token) });
    return res.ok;
  },
  create: (token: string, body: ProfessionInput) =>
    fetch("/api/admin/professions", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }).then(handle<Profession>),
  update: (token: string, id: string, body: Partial<ProfessionInput>) =>
    fetch(`/api/admin/professions/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }).then(handle<Profession>),
  remove: (token: string, id: string) =>
    fetch(`/api/admin/professions/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }).then(handle<void>),
  images: (token: string, q: string) =>
    fetch(`/api/admin/images?q=${encodeURIComponent(q)}`, {
      headers: authHeaders(token),
    }).then(handle<ImageSuggestion[]>),
};
