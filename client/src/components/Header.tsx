import { Compass, Heart, Moon, Sun } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useMerkliste } from "../hooks/useMerkliste";
import { useTheme } from "../hooks/useTheme";

const links = [
  { to: "/", label: "Start", end: true },
  { to: "/explorer", label: "🔎 Explorer" },
  { to: "/entdecker", label: "✨ Entdecker" },
  { to: "/test", label: "🧩 Test" },
  { to: "/lehrstellen", label: "📍 Lehrstellen" },
  { to: "/bewerbung", label: "📄 Bewerbung" },
  { to: "/bildungsweg", label: "🎓 Bildungsweg" },
];

export function Header() {
  const { count } = useMerkliste();
  const { dark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-card no-print">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 text-xl font-extrabold">
          <Compass size={26} /> Berufs-Kompass
        </NavLink>
        <nav className="ml-auto flex flex-wrap items-center gap-1.5">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isActive ? "bg-white text-brand-600" : "bg-white/15 hover:bg-white/30"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/merkliste"
            className={({ isActive }) =>
              `flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                isActive ? "bg-white text-brand-600" : "bg-white/15 hover:bg-white/30"
              }`
            }
          >
            <Heart size={15} /> Merkliste
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-extrabold text-brand-600">
                {count}
              </span>
            )}
          </NavLink>
          <button
            onClick={toggle}
            aria-label="Hell/Dunkel umschalten"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition hover:bg-white/30"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
