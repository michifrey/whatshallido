import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../api";
import { adminApi, type ProfessionInput } from "../api/admin";
import { ProfessionEditor } from "../components/admin/ProfessionEditor";
import { ProfessionImage } from "../components/ProfessionImage";
import { useTaxonomy } from "../context/TaxonomyContext";
import { useAdminToken } from "../hooks/useAdminToken";
import type { Profession } from "../types";

export function Admin() {
  const { token, save, clear } = useAdminToken();
  const { data: authed } = useQuery({
    queryKey: ["admin-check", token],
    queryFn: () => adminApi.check(token),
    enabled: token.length > 0,
  });

  if (!token || authed === false) return <Login onLogin={save} invalid={authed === false} />;
  if (authed === undefined) return <p className="py-12 text-center text-slate-400">Prüfe Zugang …</p>;
  return <AdminDashboard token={token} onLogout={clear} />;
}

function Login({ onLogin, invalid }: { onLogin: (t: string) => void; invalid: boolean }) {
  const [value, setValue] = useState("");
  return (
    <div className="mx-auto max-w-sm animate-fade pt-10">
      <div className="card p-6">
        <h2 className="text-xl font-extrabold">🔐 Admin-Login</h2>
        <p className="mt-1 text-sm text-slate-500">Gib den Admin-Token ein (Env-Variable <code>ADMIN_TOKEN</code>).</p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLogin(value)}
          placeholder="Admin-Token"
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
        />
        {invalid && <p className="mt-2 text-sm text-red-600">Token ungültig.</p>}
        <button onClick={() => onLogin(value)} className="btn-primary mt-4 w-full">Anmelden</button>
      </div>
    </div>
  );
}

function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const qc = useQueryClient();
  const { getCategory } = useTaxonomy();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Profession | "new" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: professions = [] } = useQuery({ queryKey: ["professions", "all"], queryFn: () => api.professions() });
  const { data: meta } = useQuery({ queryKey: ["meta"], queryFn: api.meta });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["professions"] });
    qc.invalidateQueries({ queryKey: ["meta"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const saveMutation = useMutation({
    mutationFn: (input: ProfessionInput) =>
      editing === "new" || !editing
        ? adminApi.create(token, input)
        : adminApi.update(token, editing.id, input),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      setFormError(null);
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : "Speichern fehlgeschlagen"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.remove(token, id),
    onSuccess: invalidate,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return professions
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [professions, search]);

  return (
    <div className="animate-fade space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-extrabold">⚙️ Admin – Berufe verwalten</h2>
        <button onClick={onLogout} className="btn-soft ml-auto">
          <LogOut size={16} /> Abmelden
        </button>
      </div>

      {meta && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Berufe total", value: meta.total },
            { label: "Lehrberufe", value: meta.lehre },
            { label: "Weiterführend", value: meta.weiterfuehrend },
            { label: "mit Foto", value: professions.filter((p) => p.imageUrl).length },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className="text-2xl font-extrabold text-brand-600">{s.value}</div>
              <div className="text-xs font-semibold text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtern … Name oder Kategorie"
          className="min-w-[220px] flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
        />
        <button onClick={() => { setFormError(null); setEditing("new"); }} className="btn-primary">
          <Plus size={16} /> Neuer Beruf
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-700">
              <th className="p-3">Bild</th>
              <th className="p-3">Name</th>
              <th className="p-3">Kategorie</th>
              <th className="p-3">Typ</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const cat = getCategory(p.category);
              return (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
                  <td className="p-3">
                    <div className="h-9 w-14 overflow-hidden rounded">
                      <ProfessionImage category={cat} imageUrl={p.imageUrl} name={p.name} />
                    </div>
                  </td>
                  <td className="p-3 font-semibold">{p.name}</td>
                  <td className="p-3">{cat.emoji} {cat.name}</td>
                  <td className="p-3">{p.type === "weiterfuehrend" ? "📚" : "🎓"}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setFormError(null); setEditing(p); }}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => confirm(`"${p.name}" löschen?`) && deleteMutation.mutate(p.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProfessionEditor
          token={token}
          initial={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={(input) => saveMutation.mutate(input)}
          saving={saveMutation.isPending}
          error={formError}
        />
      )}
    </div>
  );
}
