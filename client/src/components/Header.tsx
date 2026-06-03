import { ChevronDown, Compass, Heart, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useMerkliste } from "../hooks/useMerkliste";
import { useTheme } from "../hooks/useTheme";

const mainLinks = [
  { to: "/", label: "Start", end: true },
  { to: "/explorer", label: "🔎 Explorer" },
  { to: "/entdecker", label: "✨ Entdecker" },
  { to: "/test", label: "🧩 Test" },
  { to: "/bildungsweg", label: "🎓 Bildungsweg" },
  { to: "/messen", label: "📅 Messen" },
];

const bewerbenLinks = [
  { to: "/lehrstellen", label: "📍 Lehrstellen finden" },
  { to: "/bewerbung", label: "📄 Bewerbung schreiben" },
  { to: "/tracker", label: "📌 Bewerbungs-Tracker" },
];

const pillBase = "rounded-full px-3 py-1.5 text-sm font-display font-bold transition";
const pillActive = "bg-brand-500 text-white";
const pillIdle = "bg-white/10 hover:bg-white/25";

export function Header() {
  const { count } = useMerkliste();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const bewerbenActive = bewerbenLinks.some((l) => location.pathname === l.to);

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b-4 border-brand-500 bg-ink text-white shadow-card no-print">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 text-xl font-display font-extrabold uppercase tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white">
            <Compass size={20} />
          </span>
          Berufs-Kompass
        </NavLink>
        <nav className="ml-auto flex flex-wrap items-center gap-1.5">
          {mainLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `${pillBase} ${isActive ? pillActive : pillIdle}`}>
              {l.label}
            </NavLink>
          ))}

          {/* Bewerben-Menü */}
          <div className="relative" ref={ref}>
            <button onClick={() => setOpen((o) => !o)}
              className={`${pillBase} flex items-center gap-1 ${bewerbenActive ? pillActive : pillIdle}`}>
              📄 Bewerben <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
            </button>
            {open && (
              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl bg-white py-1 text-slate-800 shadow-cardlg dark:bg-slate-900 dark:text-slate-100">
                {bewerbenLinks.map((l) => (
                  <NavLink key={l.to} to={l.to}
                    className={({ isActive }) =>
                      `block px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? "text-brand-600" : ""}`}>
                    {l.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/merkliste"
            className={({ isActive }) => `${pillBase} flex items-center gap-1 ${isActive ? pillActive : pillIdle}`}>
            <Heart size={15} /> Merkliste
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-sun px-1 text-xs font-extrabold text-ink">
                {count}
              </span>
            )}
          </NavLink>

          <button onClick={toggle} aria-label="Hell/Dunkel umschalten"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition hover:bg-white/30">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
