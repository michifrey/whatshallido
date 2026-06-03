import { ImageOff, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { adminApi, type ImageSuggestion } from "../../api/admin";

interface Props {
  token: string;
  value: string;
  defaultQuery: string;
  onChange: (url: string) => void;
}

export function ImagePicker({ token, value, defaultQuery, onChange }: Props) {
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<ImageSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await adminApi.images(token, query.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler bei der Bildersuche");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
        >
          {value ? (
            <img src={value} alt="Vorschau" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-slate-400">
              <ImageOff size={20} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Bild-URL (oder unten suchen)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          {value && (
            <button type="button" onClick={() => onChange("")} className="mt-1 text-xs text-brand-600 hover:underline">
              Bild entfernen
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
          placeholder="Foto suchen (Unsplash) …"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
        />
        <button type="button" onClick={search} className="btn-soft" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Suchen
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {results.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onChange(img.url)}
              title={`Foto von ${img.author}`}
              className={`overflow-hidden rounded-lg border-2 transition ${
                value === img.url ? "border-brand-600" : "border-transparent hover:border-brand-400"
              }`}
            >
              <img src={img.thumb} alt={`Foto von ${img.author}`} className="h-20 w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
