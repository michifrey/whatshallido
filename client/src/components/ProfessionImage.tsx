import type { Category } from "../types";

interface Props {
  category: Category;
  imageUrl: string | null;
  name: string;
  className?: string;
}

/**
 * Berufsbild: zeigt ein echtes Foto, falls vorhanden – sonst eine generierte
 * SVG-Illustration mit dem Kategorie-Farbverlauf und Emoji (funktioniert offline).
 */
export function ProfessionImage({ category, imageUrl, name, className = "" }: Props) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  const c = category.color;
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c} 55%, #0f172a))` }}
      aria-label={category.name}
    >
      <span className="absolute -right-3 -top-4 text-7xl opacity-20 blur-[1px]">{category.emoji}</span>
      <span className="absolute -bottom-5 -left-3 text-6xl opacity-10">{category.emoji}</span>
      <span className="relative text-5xl drop-shadow-sm">{category.emoji}</span>
    </div>
  );
}
