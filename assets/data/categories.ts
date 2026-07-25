/**
 * The category tree.
 *
 * Every LEAF `key` here must also be a key in `words.json` (a list of
 * `[arabic, english]` pairs), because the round engine still does `WORDS[key]` —
 * grouping is a presentation concern only, so the game logic never learns about
 * groups.
 *
 * Every group and leaf carries both labels. `nameAr`/`nameEn` are picked by the
 * current language via `categoryName()` in `src/content.ts`.
 *
 * `scripts/validate-content.js` enforces that both directions stay in sync.
 */

import type { Ionicons } from "@expo/vector-icons";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export type CategoryItem = { key: string; nameAr: string; nameEn: string };

export type CategoryGroup = {
  key: string;
  nameAr: string;
  nameEn: string;
  icon: IoniconName;
  /** Accent colour so groups are visually distinguishable at a glance. */
  accent: string;
  items: CategoryItem[];
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    key: "islamic",
    nameAr: "إسلامي",
    nameEn: "Islamic",
    icon: "moon",
    accent: "#4CC38A",
    items: [
      { key: "quran_chapters", nameAr: "سور القرآن", nameEn: "Quran Chapters" },
      { key: "prophets", nameAr: "أنبياء ورسل", nameEn: "Prophets & Messengers" },
      { key: "sahaba", nameAr: "صحابة", nameEn: "Companions" },
      { key: "islamic_landmarks", nameAr: "معالم إسلامية", nameEn: "Islamic Landmarks" },
      { key: "islamic_battles", nameAr: "غزوات ومعارك", nameEn: "Battles & Expeditions" },
      { key: "islamic_terms", nameAr: "مصطلحات دينية", nameEn: "Religious Terms" },
    ],
  },
  {
    key: "sports",
    nameAr: "رياضة",
    // Not plain "Sports": the leaf listing the disciplines is already called
    // that, and a group header repeating its own child's label reads as a bug.
    nameEn: "Sports & Athletes",
    icon: "football",
    accent: "#5B8CFF",
    items: [
      { key: "sports", nameAr: "رياضات", nameEn: "Sports" },
      { key: "football_players", nameAr: "لاعبين كرة قدم", nameEn: "Footballers" },
      { key: "football_clubs", nameAr: "أندية كرة القدم", nameEn: "Football Clubs" },
      { key: "national_teams", nameAr: "منتخبات", nameEn: "National Teams" },
      { key: "basketball_players", nameAr: "لاعبين كرة سلة", nameEn: "Basketball Players" },
      { key: "ufc_fighters", nameAr: "مقاتلي القتال الحر", nameEn: "MMA Fighters" },
      { key: "tournaments", nameAr: "بطولات رياضية", nameEn: "Tournaments" },
    ],
  },
  {
    key: "screen",
    nameAr: "ترفيه ومشاهدة",
    nameEn: "Screen & Entertainment",
    icon: "film",
    accent: "#A87BFF",
    items: [
      { key: "cartoon", nameAr: "رسوم متحركة", nameEn: "Cartoons" },
      { key: "anime", nameAr: "أنمي", nameEn: "Anime" },
      { key: "movies", nameAr: "أفلام عالمية", nameEn: "International Movies" },
      // Not "World Series" — in English that is the baseball championship.
      { key: "series_intl", nameAr: "مسلسلات عالمية", nameEn: "International Series" },
      { key: "series_arabic", nameAr: "مسلسلات عربية", nameEn: "Arabic Series" },
      { key: "disney", nameAr: "شخصيات ديزني", nameEn: "Disney Characters" },
      { key: "tv_shows", nameAr: "برامج تلفزيونية", nameEn: "TV Shows" },
    ],
  },
  {
    key: "games",
    nameAr: "ألعاب",
    nameEn: "Games",
    icon: "game-controller",
    accent: "#FF7AC6",
    items: [
      { key: "video_games", nameAr: "ألعاب فيديو", nameEn: "Video Games" },
      { key: "game_characters", nameAr: "شخصيات ألعاب", nameEn: "Game Characters" },
      { key: "street_games", nameAr: "ألعاب شعبية", nameEn: "Street Games" },
      { key: "board_games", nameAr: "ألعاب لوحية", nameEn: "Board Games" },
      { key: "kid_games", nameAr: "ألعاب أطفال", nameEn: "Kids' Games" },
    ],
  },
  {
    key: "geography",
    nameAr: "جغرافيا",
    nameEn: "Geography",
    icon: "earth",
    accent: "#37C6D0",
    items: [
      { key: "countries", nameAr: "دول", nameEn: "Countries" },
      { key: "capitals", nameAr: "عواصم", nameEn: "Capitals" },
      { key: "arab_cities", nameAr: "مدن عربية", nameEn: "Arab Cities" },
      { key: "world_landmarks", nameAr: "معالم عالمية", nameEn: "World Landmarks" },
      { key: "seas_rivers", nameAr: "بحار وأنهار", nameEn: "Seas & Rivers" },
      { key: "mountains_deserts", nameAr: "جبال وصحاري", nameEn: "Mountains & Deserts" },
    ],
  },
  {
    key: "places",
    nameAr: "أماكن",
    nameEn: "Places",
    icon: "location",
    accent: "#FF9F45",
    items: [
      { key: "places", nameAr: "أماكن عامة", nameEn: "Public Places" },
      { key: "city_places", nameAr: "أماكن في المدينة", nameEn: "Around the City" },
      { key: "home_places", nameAr: "أماكن في البيت", nameEn: "Around the House" },
      { key: "shops", nameAr: "محلات ومتاجر", nameEn: "Shops & Stores" },
    ],
  },
  {
    key: "food",
    nameAr: "طعام وشراب",
    nameEn: "Food & Drink",
    icon: "fast-food",
    accent: "#FFC24B",
    items: [
      { key: "food", nameAr: "أطعمة", nameEn: "Foods" },
      { key: "sweets", nameAr: "حلويات", nameEn: "Sweets" },
      { key: "drinks", nameAr: "مشروبات", nameEn: "Drinks" },
      { key: "fruits", nameAr: "فواكه", nameEn: "Fruits" },
      { key: "vegetables", nameAr: "خضروات", nameEn: "Vegetables" },
      { key: "gulf_dishes", nameAr: "أكلات خليجية", nameEn: "Gulf Dishes" },
      { key: "spices", nameAr: "بهارات وتوابل", nameEn: "Herbs & Spices" },
    ],
  },
  {
    key: "daily",
    nameAr: "حياة يومية",
    nameEn: "Daily Life",
    icon: "home",
    accent: "#8FD14F",
    items: [
      { key: "objects", nameAr: "أشياء", nameEn: "Objects" },
      { key: "home_tools", nameAr: "أدوات منزلية", nameEn: "Household Tools" },
      { key: "clothes", nameAr: "ملابس", nameEn: "Clothes" },
      { key: "school_supplies", nameAr: "أدوات مدرسية", nameEn: "School Supplies" },
      { key: "colors_arabic", nameAr: "ألوان", nameEn: "Colors" },
    ],
  },
  {
    key: "tech",
    nameAr: "مواصلات وتقنية",
    nameEn: "Transport & Tech",
    icon: "hardware-chip",
    accent: "#6BA8FF",
    items: [
      { key: "transport", nameAr: "وسائل نقل", nameEn: "Transport" },
      { key: "cars", nameAr: "سيارات وماركات", nameEn: "Cars & Brands" },
      { key: "devices", nameAr: "أجهزة إلكترونية", nameEn: "Electronics" },
      { key: "apps_sites", nameAr: "تطبيقات ومواقع", nameEn: "Apps & Websites" },
      { key: "tech_terms", nameAr: "مصطلحات تقنية", nameEn: "Tech Terms" },
    ],
  },
  {
    key: "people",
    nameAr: "مهن وأشخاص",
    nameEn: "People & Jobs",
    icon: "people",
    accent: "#F4795B",
    items: [
      { key: "jobs", nameAr: "وظائف", nameEn: "Jobs" },
      { key: "family", nameAr: "أفراد العائلة", nameEn: "Family Members" },
      { key: "historical_figures", nameAr: "شخصيات تاريخية", nameEn: "Historical Figures" },
      { key: "scientists", nameAr: "علماء ومخترعين", nameEn: "Scientists & Inventors" },
      { key: "arab_celebs", nameAr: "مشاهير عرب", nameEn: "Arab Celebrities" },
    ],
  },
  {
    key: "nature",
    nameAr: "حيوانات وطبيعة",
    nameEn: "Animals & Nature",
    icon: "leaf",
    accent: "#4CD98A",
    items: [
      { key: "animals", nameAr: "حيوانات", nameEn: "Animals" },
      { key: "birds", nameAr: "طيور", nameEn: "Birds" },
      { key: "sea_animals", nameAr: "حيوانات بحرية", nameEn: "Sea Creatures" },
      { key: "insects", nameAr: "حشرات", nameEn: "Insects" },
      { key: "plants", nameAr: "نباتات وأشجار", nameEn: "Plants & Trees" },
      { key: "weather", nameAr: "ظواهر جوية", nameEn: "Weather" },
    ],
  },
  {
    key: "health",
    nameAr: "جسم وصحة",
    nameEn: "Body & Health",
    icon: "fitness",
    accent: "#FF6B8A",
    items: [
      { key: "body_parts", nameAr: "أعضاء الجسم", nameEn: "Body Parts" },
      { key: "diseases", nameAr: "أمراض", nameEn: "Illnesses" },
      { key: "medical", nameAr: "مستلزمات طبية", nameEn: "Medical Supplies" },
      { key: "fitness", nameAr: "لياقة وصحة", nameEn: "Fitness & Health" },
    ],
  },
  {
    key: "science",
    nameAr: "علوم ودراسة",
    nameEn: "Science & Study",
    icon: "flask",
    accent: "#7BD3FF",
    items: [
      { key: "school_subjects", nameAr: "مواد دراسية", nameEn: "School Subjects" },
      { key: "space", nameAr: "كواكب وفضاء", nameEn: "Planets & Space" },
      { key: "elements", nameAr: "عناصر ومواد", nameEn: "Elements & Materials" },
      { key: "lab_tools", nameAr: "أدوات علمية", nameEn: "Lab Tools" },
      { key: "shapes_math", nameAr: "أشكال ورياضيات", nameEn: "Shapes & Math" },
    ],
  },
  {
    key: "misc",
    nameAr: "متنوع ومرح",
    nameEn: "Mixed & Fun",
    icon: "sparkles",
    accent: "#C9A0FF",
    items: [
      // Not "Odd Jobs" — that means casual handyman work in English, whereas
      // this list is astronauts, lion tamers and falconers.
      { key: "odd_jobs", nameAr: "مهن غريبة", nameEn: "Unusual Jobs" },
      { key: "daily_situations", nameAr: "مواقف يومية", nameEn: "Everyday Moments" },
      { key: "proverbs", nameAr: "أمثال ومصطلحات", nameEn: "Proverbs & Sayings" },
      { key: "feelings", nameAr: "مشاعر وصفات", nameEn: "Feelings & Traits" },
      { key: "occasions", nameAr: "مناسبات وأعياد", nameEn: "Occasions & Holidays" },
    ],
  },
];

/** Flat list of every leaf key, in tree order. */
export const CATEGORY_KEYS: string[] = CATEGORY_GROUPS.flatMap((g) => g.items.map((i) => i.key));

/** Leaf key -> Arabic label, for the round summary. */
export const CATEGORY_AR: Record<string, string> = Object.fromEntries(
  CATEGORY_GROUPS.flatMap((g) => g.items.map((i) => [i.key, i.nameAr]))
);

/** Leaf key -> English label. */
export const CATEGORY_EN: Record<string, string> = Object.fromEntries(
  CATEGORY_GROUPS.flatMap((g) => g.items.map((i) => [i.key, i.nameEn]))
);

/** Leaf key -> the group it belongs to, for headers and accents. */
export const GROUP_OF: Record<string, CategoryGroup> = Object.fromEntries(
  CATEGORY_GROUPS.flatMap((g) => g.items.map((i) => [i.key, g]))
);
