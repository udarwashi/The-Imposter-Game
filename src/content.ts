/**
 * Bilingual content lookups.
 *
 * `words.json` stores one `[arabic, english]` pair per entry, so a round can
 * carry the pair around and each screen renders whichever half matches the
 * language currently on screen. That is what makes switching language mid-round
 * work: the secret word follows, rather than the round having to restart.
 *
 * This module deliberately imports only the string TYPE from `i18n`, never the
 * provider, so it stays a plain data module with no React in it.
 */

import { CATEGORY_AR, CATEGORY_EN } from "../assets/data/categories";
import type { Lang } from "./i18n/strings";

/** `[arabic, english]`. Index order matches `LANG_INDEX` below. */
export type WordPair = [ar: string, en: string];

const WORDS = require("../assets/data/words.json") as Record<string, WordPair[]>;

const LANG_INDEX: Record<Lang, 0 | 1> = { ar: 0, en: 1 };

/** Every word in a category, as pairs. Unknown keys give an empty list. */
export function wordsFor(key: string): WordPair[] {
  return WORDS[key] ?? [];
}

/** The half of a pair that belongs to `lang`. */
export function wordIn(pair: WordPair, lang: Lang): string {
  return pair[LANG_INDEX[lang]];
}

/** A leaf category's label in `lang`. Falls back to the key so nothing renders blank. */
export function categoryName(key: string, lang: Lang): string {
  return (lang === "ar" ? CATEGORY_AR : CATEGORY_EN)[key] ?? key;
}

/** The label of any node in the category tree — group or leaf. */
export function labelOf(node: { nameAr: string; nameEn: string }, lang: Lang): string {
  return lang === "ar" ? node.nameAr : node.nameEn;
}
