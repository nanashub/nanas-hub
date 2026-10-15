// The service categories and styles used across Nana's Hub.
// Slugs are what's saved in the database; labels are what people see.
// If you add or rename a CATEGORY slug, also update the database check
// (see supabase/2026-10-15-category-styles.sql for the current list).
// Styles can be added, removed or renamed here freely.

type Style = { slug: string; label: string };
type Category = { slug: string; label: string; styles: Style[] };

export const CATEGORIES: Category[] = [
  {
    slug: "single-plaits",
    label: "Single plait styles",
    styles: [
      { slug: "knotless", label: "Knotless braids" },
      { slug: "box-braids", label: "Box braids" },
      { slug: "boho-goddess", label: "Boho / goddess braids" },
      { slug: "twists", label: "Twists (Senegalese, passion, Marley)" },
      { slug: "faux-locs", label: "Faux locs" },
      { slug: "fulani", label: "Fulani braids" },
    ],
  },
  {
    slug: "cornrows",
    label: "Cornrows",
    styles: [
      { slug: "straight-back", label: "Straight-back cornrows" },
      { slug: "stitch", label: "Stitch braids" },
      { slug: "feed-in", label: "Feed-in braids" },
      { slug: "lemonade", label: "Lemonade braids" },
      { slug: "ghana-weaving", label: "Ghana weaving" },
    ],
  },
  {
    slug: "locs",
    label: "Locs",
    styles: [
      { slug: "starter", label: "Starter locs" },
      { slug: "retwist", label: "Retwist" },
      { slug: "interlocking", label: "Interlocking" },
      { slug: "microlocs", label: "Sisterlocks / microlocs" },
      { slug: "loc-styling", label: "Loc styling" },
    ],
  },
  {
    slug: "natural-hair",
    label: "Natural hair",
    styles: [
      { slug: "silk-press", label: "Silk press" },
      { slug: "wash-and-go", label: "Wash & go" },
      { slug: "twist-out", label: "Twist-out / braid-out" },
      { slug: "treatments", label: "Treatments" },
      { slug: "trims", label: "Trims" },
    ],
  },
  {
    slug: "wigs-weaves",
    label: "Wigs & weaves",
    styles: [
      { slug: "frontal", label: "Frontal install" },
      { slug: "closure", label: "Closure install" },
      { slug: "sew-in", label: "Sew-in" },
      { slug: "wig-making", label: "Wig making" },
      { slug: "wig-styling", label: "Wig styling & maintenance" },
    ],
  },
  {
    slug: "barbering",
    label: "Barbering",
    styles: [
      { slug: "haircut", label: "Haircut" },
      { slug: "fade", label: "Fade" },
      { slug: "line-up", label: "Line-up" },
      { slug: "beard", label: "Beard trim" },
      { slug: "kids-cut", label: "Kids' cut" },
    ],
  },
  {
    slug: "lashes",
    label: "Lashes",
    styles: [
      { slug: "classic", label: "Classic" },
      { slug: "hybrid", label: "Hybrid" },
      { slug: "volume", label: "Volume" },
      { slug: "lash-lift", label: "Lash lift" },
    ],
  },
  {
    slug: "brows",
    label: "Brows",
    styles: [
      { slug: "lamination", label: "Lamination" },
      { slug: "tint", label: "Tint" },
      { slug: "threading", label: "Threading" },
      { slug: "waxing", label: "Waxing" },
      { slug: "microblading", label: "Microblading" },
    ],
  },
  {
    slug: "makeup",
    label: "Makeup",
    styles: [
      { slug: "occasion", label: "Everyday / occasion" },
      { slug: "bridal", label: "Bridal" },
      { slug: "photoshoot", label: "Photoshoot" },
    ],
  },
  {
    slug: "skin",
    label: "Skin & aesthetics",
    styles: [
      { slug: "facials", label: "Facials" },
      { slug: "hyperpigmentation", label: "Hyperpigmentation treatment" },
      { slug: "peels", label: "Chemical peels" },
      { slug: "microneedling", label: "Microneedling" },
    ],
  },
  {
    slug: "nails",
    label: "Nails",
    styles: [
      { slug: "gel", label: "Gel" },
      { slug: "acrylic", label: "Acrylic" },
      { slug: "biab", label: "BIAB" },
      { slug: "nail-art", label: "Nail art" },
      { slug: "pedicure", label: "Pedicure" },
    ],
  },
  { slug: "other", label: "Other", styles: [] },
];

export const OTHER = "other";

export function isCategory(value: unknown): value is string {
  return typeof value === "string" && CATEGORIES.some((c) => c.slug === value);
}

export function getCategory(slug: string | null | undefined): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryLabel(slug: string | null | undefined): string {
  return getCategory(slug)?.label ?? "";
}

export function isStyle(category: string | null | undefined, style: unknown): style is string {
  return typeof style === "string" && !!getCategory(category)?.styles.some((s) => s.slug === style);
}

export function styleLabel(category: string | null | undefined, style: string | null | undefined): string {
  return getCategory(category)?.styles.find((s) => s.slug === style)?.label ?? "";
}

// A pro's category tags, using their own words for "Other".
export function categoryTags(categories: string[], otherText: string | null | undefined): { slug: string; label: string }[] {
  return categories
    .filter(isCategory)
    .map((slug) => ({
      slug,
      label: slug === OTHER ? (otherText?.trim() || "Other") : categoryLabel(slug),
    }));
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
