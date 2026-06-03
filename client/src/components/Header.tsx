import {
  CalendarDays,
  ChevronDown,
  Compass,
  FileText,
  GraduationCap,
  Heart,
  Home as HomeIcon,
  ListChecks,
  MapPin,
  Moon,
  type LucideIcon,
  Puzzle,
  Search,
  Sparkles,
  Sun,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useMerkliste } from "../hooks/useMerkliste";
import { useTheme } from "../hooks/useTheme";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const mainLinks: NavItem[] = [
  { to: "/", label: "Start", icon: HomeIcon, end: true },
  { to: "/explorer", label: "Explorer", icon: Search },
  { to: "/entdecker", label: "Entdecker", icon: Sparkles },
  { to: "/test", label: "Test", icon: Puzzle },
  { to: "/bildungsweg", label: "Bildungsweg", icon: GraduationCap },
  { to: "/messen", label: "Messen", icon: CalendarDays },
];

const bewerbenLinks: NavItem[] = [
  { to: "/lehrstellen", label: "Lehrstellen finden", icon: MapPin },
  { to: "/bewerbung", label: "Bewerbung schreiben", icon: FileText },
  { to: "/tracker", label: "Bewerbungs-Tracker", icon: ListChecks },
];

const linkBase = "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium transition";
const linkActive = "text-brand-600";
const linkIdle = "text-slate-600 hover:text-ink dark:text-slate-300 dark:hover:text-white";

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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 text-ink backdrop-blur no-print dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-display font-bold tracking-tight">
          <Compass size={22} className="text-brand-600" /> Berufs-Kompass
        </NavLink>

        <nav className="ml-auto flex flex-wrap items-center gap-0.5">
          {mainLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
              <l.icon size={15} /> {l.label}
            </NavLink>
          ))}

          {/* Bewerben-Menü */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((o) => !o)}
              className={`${linkBase} ${bewerbenActive ? linkActive : linkIdle}`}
            >
              <FileText size={15} /> Bewerben
              <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
            </button>
            {open && (
              <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-slate-700 shadow-cardlg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                {bewerbenLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800 ${isActive ? "text-brand-600" : ""}`
                    }
                  >
                    <l.icon size={16} /> {l.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/merkliste" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            <Heart size={15} /> Merkliste
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </NavLink>

          <button
            onClick={toggle}
            aria-label="Hell/Dunkel umschalten"
            className="ml-1 grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
