// The service categories used across Nana's Hub.
// The slug is what's saved in the database; the label is what people see.
// If you add one here, also add its slug to the database check in
// supabase/2026-10-15-services-and-account-deletion.sql (or a newer file).
export const CATEGORIES = [
  { slug: "braids", label: "Braids & twists" },
  { slug: "locs", label: "Locs" },
  { slug: "natural-hair", label: "Silk press & natural hair" },
  { slug: "wigs", label: "Wigs & installs" },
  { slug: "barbering", label: "Barbering" },
  { slug: "lashes-brows", label: "Lashes & brows" },
  { slug: "makeup", label: "Makeup" },
  { slug: "skin", label: "Skin & aesthetics" },
  { slug: "nails", label: "Nails" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

const slugs: readonly string[] = CATEGORIES.map((c) => c.slug);

export function isCategory(value: unknown): value is CategorySlug {
  return typeof value === "string" && slugs.includes(value);
}

export function categoryLabel(slug: string | null | undefined): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? "";
}

export function formatPrice(pence: number | null | undefined): string {
  if (pence == null) return "";
  const pounds = pence / 100;
  return Number.isInteger(pounds) ? `£${pounds}` : `£${pounds.toFixed(2)}`;
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr${h > 1 ? "s" : ""}`;
  return `${m} min`;
}
