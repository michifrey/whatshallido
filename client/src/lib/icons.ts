import {
  Briefcase,
  ClipboardList,
  Cog,
  FlaskConical,
  HardHat,
  Handshake,
  Laptop,
  type LucideIcon,
  Megaphone,
  Palette,
  Scissors,
  ShoppingBag,
  Sprout,
  Stethoscope,
  UtensilsCrossed,
  Users,
  Wrench,
} from "lucide-react";

/** Line-Icon je Berufs-Kategorie (statt Emoji). */
const CATEGORY_ICON: Record<string, LucideIcon> = {
  technik: Cog,
  it: Laptop,
  gesundheit: Stethoscope,
  soziales: Handshake,
  gestaltung: Palette,
  wirtschaft: ShoppingBag,
  natur: Sprout,
  gastro: UtensilsCrossed,
  bau: HardHat,
  koerper: Scissors,
};

/** Line-Icon je Interessens-Dimension. */
const DIM_ICON: Record<string, LucideIcon> = {
  praktisch: Wrench,
  forschend: FlaskConical,
  kreativ: Palette,
  sozial: Users,
  fuehrend: Megaphone,
  ordnend: ClipboardList,
};

export const categoryIcon = (key: string): LucideIcon => CATEGORY_ICON[key] ?? Briefcase;
export const dimIcon = (key: string): LucideIcon => DIM_ICON[key] ?? Briefcase;
