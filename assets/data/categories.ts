/**
 * The category tree.
 *
 * Every LEAF `key` here must also be a key in `words.json` (a flat `string[]`),
 * because the round engine still does `WORDS[key]` — grouping is a presentation
 * concern only, so the game logic never learns about groups.
 *
 * `scripts/validate-content.js` enforces that both directions stay in sync.
 */

import type { Ionicons } from "@expo/vector-icons";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export type CategoryItem = { key: string; nameAr: string };

export type CategoryGroup = {
  key: string;
  nameAr: string;
  icon: IoniconName;
  /** Accent colour so groups are visually distinguishable at a glance. */
  accent: string;
  items: CategoryItem[];
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    key: "islamic",
    nameAr: "إسلامي",
    icon: "moon",
    accent: "#4CC38A",
    items: [
      { key: "quran_chapters", nameAr: "سور القرآن" },
      { key: "prophets", nameAr: "أنبياء ورسل" },
      { key: "sahaba", nameAr: "صحابة" },
      { key: "islamic_landmarks", nameAr: "معالم إسلامية" },
      { key: "islamic_battles", nameAr: "غزوات ومعارك" },
      { key: "islamic_terms", nameAr: "مصطلحات دينية" },
    ],
  },
  {
    key: "sports",
    nameAr: "رياضة",
    icon: "football",
    accent: "#5B8CFF",
    items: [
      { key: "sports", nameAr: "رياضات" },
      { key: "football_players", nameAr: "لاعبين كرة قدم" },
      { key: "football_clubs", nameAr: "أندية كرة القدم" },
      { key: "national_teams", nameAr: "منتخبات" },
      { key: "basketball_players", nameAr: "لاعبين كرة سلة" },
      { key: "ufc_fighters", nameAr: "مقاتلي القتال الحر" },
      { key: "tournaments", nameAr: "بطولات رياضية" },
    ],
  },
  {
    key: "screen",
    nameAr: "ترفيه ومشاهدة",
    icon: "film",
    accent: "#A87BFF",
    items: [
      { key: "cartoon", nameAr: "رسوم متحركة" },
      { key: "anime", nameAr: "أنمي" },
      { key: "movies", nameAr: "أفلام عالمية" },
      { key: "series_intl", nameAr: "مسلسلات عالمية" },
      { key: "series_arabic", nameAr: "مسلسلات عربية" },
      { key: "disney", nameAr: "شخصيات ديزني" },
      { key: "tv_shows", nameAr: "برامج تلفزيونية" },
    ],
  },
  {
    key: "games",
    nameAr: "ألعاب",
    icon: "game-controller",
    accent: "#FF7AC6",
    items: [
      { key: "video_games", nameAr: "ألعاب فيديو" },
      { key: "game_characters", nameAr: "شخصيات ألعاب" },
      { key: "street_games", nameAr: "ألعاب شعبية" },
      { key: "board_games", nameAr: "ألعاب لوحية" },
      { key: "kid_games", nameAr: "ألعاب أطفال" },
    ],
  },
  {
    key: "geography",
    nameAr: "جغرافيا",
    icon: "earth",
    accent: "#37C6D0",
    items: [
      { key: "countries", nameAr: "دول" },
      { key: "capitals", nameAr: "عواصم" },
      { key: "arab_cities", nameAr: "مدن عربية" },
      { key: "world_landmarks", nameAr: "معالم عالمية" },
      { key: "seas_rivers", nameAr: "بحار وأنهار" },
      { key: "mountains_deserts", nameAr: "جبال وصحاري" },
    ],
  },
  {
    key: "places",
    nameAr: "أماكن",
    icon: "location",
    accent: "#FF9F45",
    items: [
      { key: "places", nameAr: "أماكن عامة" },
      { key: "city_places", nameAr: "أماكن في المدينة" },
      { key: "home_places", nameAr: "أماكن في البيت" },
      { key: "shops", nameAr: "محلات ومتاجر" },
    ],
  },
  {
    key: "food",
    nameAr: "طعام وشراب",
    icon: "fast-food",
    accent: "#FFC24B",
    items: [
      { key: "food", nameAr: "أطعمة" },
      { key: "sweets", nameAr: "حلويات" },
      { key: "drinks", nameAr: "مشروبات" },
      { key: "fruits", nameAr: "فواكه" },
      { key: "vegetables", nameAr: "خضروات" },
      { key: "gulf_dishes", nameAr: "أكلات خليجية" },
      { key: "spices", nameAr: "بهارات وتوابل" },
    ],
  },
  {
    key: "daily",
    nameAr: "حياة يومية",
    icon: "home",
    accent: "#8FD14F",
    items: [
      { key: "objects", nameAr: "أشياء" },
      { key: "home_tools", nameAr: "أدوات منزلية" },
      { key: "clothes", nameAr: "ملابس" },
      { key: "school_supplies", nameAr: "أدوات مدرسية" },
      { key: "colors_arabic", nameAr: "ألوان" },
    ],
  },
  {
    key: "tech",
    nameAr: "مواصلات وتقنية",
    icon: "hardware-chip",
    accent: "#6BA8FF",
    items: [
      { key: "transport", nameAr: "وسائل نقل" },
      { key: "cars", nameAr: "سيارات وماركات" },
      { key: "devices", nameAr: "أجهزة إلكترونية" },
      { key: "apps_sites", nameAr: "تطبيقات ومواقع" },
      { key: "tech_terms", nameAr: "مصطلحات تقنية" },
    ],
  },
  {
    key: "people",
    nameAr: "مهن وأشخاص",
    icon: "people",
    accent: "#F4795B",
    items: [
      { key: "jobs", nameAr: "وظائف" },
      { key: "family", nameAr: "أفراد العائلة" },
      { key: "historical_figures", nameAr: "شخصيات تاريخية" },
      { key: "scientists", nameAr: "علماء ومخترعين" },
      { key: "arab_celebs", nameAr: "مشاهير عرب" },
    ],
  },
  {
    key: "nature",
    nameAr: "حيوانات وطبيعة",
    icon: "leaf",
    accent: "#4CD98A",
    items: [
      { key: "animals", nameAr: "حيوانات" },
      { key: "birds", nameAr: "طيور" },
      { key: "sea_animals", nameAr: "حيوانات بحرية" },
      { key: "insects", nameAr: "حشرات" },
      { key: "plants", nameAr: "نباتات وأشجار" },
      { key: "weather", nameAr: "ظواهر جوية" },
    ],
  },
  {
    key: "health",
    nameAr: "جسم وصحة",
    icon: "fitness",
    accent: "#FF6B8A",
    items: [
      { key: "body_parts", nameAr: "أعضاء الجسم" },
      { key: "diseases", nameAr: "أمراض" },
      { key: "medical", nameAr: "مستلزمات طبية" },
      { key: "fitness", nameAr: "لياقة وصحة" },
    ],
  },
  {
    key: "science",
    nameAr: "علوم ودراسة",
    icon: "flask",
    accent: "#7BD3FF",
    items: [
      { key: "school_subjects", nameAr: "مواد دراسية" },
      { key: "space", nameAr: "كواكب وفضاء" },
      { key: "elements", nameAr: "عناصر ومواد" },
      { key: "lab_tools", nameAr: "أدوات علمية" },
      { key: "shapes_math", nameAr: "أشكال ورياضيات" },
    ],
  },
  {
    key: "misc",
    nameAr: "متنوع ومرح",
    icon: "sparkles",
    accent: "#C9A0FF",
    items: [
      { key: "odd_jobs", nameAr: "مهن غريبة" },
      { key: "daily_situations", nameAr: "مواقف يومية" },
      { key: "proverbs", nameAr: "أمثال ومصطلحات" },
      { key: "feelings", nameAr: "مشاعر وصفات" },
      { key: "occasions", nameAr: "مناسبات وأعياد" },
    ],
  },
];

/** Flat list of every leaf key, in tree order. */
export const CATEGORY_KEYS: string[] = CATEGORY_GROUPS.flatMap((g) => g.items.map((i) => i.key));

/** Leaf key -> Arabic label, for the round summary. */
export const CATEGORY_AR: Record<string, string> = Object.fromEntries(
  CATEGORY_GROUPS.flatMap((g) => g.items.map((i) => [i.key, i.nameAr]))
);

/** Leaf key -> the group it belongs to, for headers and accents. */
export const GROUP_OF: Record<string, CategoryGroup> = Object.fromEntries(
  CATEGORY_GROUPS.flatMap((g) => g.items.map((i) => [i.key, g]))
);
