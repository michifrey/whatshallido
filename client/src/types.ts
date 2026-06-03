export type DimensionKey =
  | "praktisch" | "forschend" | "kreativ" | "sozial" | "fuehrend" | "ordnend";

export interface Dimension {
  key: DimensionKey;
  name: string;
  emoji: string;
  color: string;
  text: string;
}

export interface Category {
  key: string;
  name: string;
  emoji: string;
  color: string;
}

export interface CategoryWithCount extends Category {
  count: number;
}

export type ProfessionType = "lehre" | "weiterfuehrend";

export interface Profession {
  id: string;
  name: string;
  category: string;
  type: ProfessionType;
  duration: string | null;
  tags: DimensionKey[];
  description: string | null;
  infoUrl: string | null;
  videoUrl: string | null;
  lehrstelleUrl: string | null;
  imageUrl: string | null;
  source: string | null;
  updatedAt: number | null;
}

export interface RecommendedProfession extends Profession {
  match: number;
}

export interface Meta {
  total: number;
  lehre: number;
  weiterfuehrend: number;
  byCategory: Record<string, number>;
  generatedAt: string;
}

export interface TestQuestion {
  dim: DimensionKey;
  text: string;
}

export interface ScaleOption {
  value: number;
  label: string;
}

export interface TestData {
  interestQuestions: TestQuestion[];
  abilityQuestions: TestQuestion[];
  interestScale: ScaleOption[];
  abilityScale: ScaleOption[];
}

export interface Taxonomy {
  categories: Category[];
  dimensions: Dimension[];
}

export interface Canton {
  code: string;
  name: string;
}

export type PlacementMode = "lehrstelle" | "schnupperlehre";

export interface PlacementLink {
  provider: string;
  label: string;
  description: string;
  url: string;
}
