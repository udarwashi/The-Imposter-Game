/**
 * Checks the category tree and the word lists agree, and that the words are
 * usable in-game — in BOTH languages.
 *
 *   node scripts/validate-content.js
 *
 * Exits non-zero on any error, so it can gate a commit.
 *
 * `words.json` stores one `["<arabic>", "<english>"]` pair per entry. Both
 * halves are checked independently: a missing English word is just as broken as
 * a missing Arabic one, because either can end up on a player's card.
 *
 * `categories.ts` is TypeScript, so rather than compile it we scrape the leaf
 * keys out of the source. The tree is a plain literal with one `key: "..."` per
 * entry, which makes that reliable enough for a checker — and if the shape ever
 * changes, the count assertion below fails loudly rather than silently passing.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const WORDS_PATH = path.join(ROOT, "assets", "data", "words.json");
const CATS_PATH = path.join(ROOT, "assets", "data", "categories.ts");

/** Minimum list length that still makes for a varied game. */
const MIN_WORDS = 20;
/** The round engine itself refuses to start below this (validateBeforeStart). */
const HARD_MIN = 4;

const errors = [];
const warnings = [];

const src = fs.readFileSync(CATS_PATH, "utf8");
const words = JSON.parse(fs.readFileSync(WORDS_PATH, "utf8"));

// Group keys appear as `key: "x",` followed by `nameAr`, then `nameEn`, then
// `icon`. Leaf keys appear inside `items: [...]`. Distinguish by grabbing the
// items blocks first, then pulling keys from within them.
const itemBlocks = [...src.matchAll(/items:\s*\[([\s\S]*?)\n\s{4}\],/g)].map((m) => m[1]);
if (itemBlocks.length === 0) {
  errors.push("could not parse any `items:` blocks out of categories.ts — has its shape changed?");
}

const leafKeys = [];
const leafNames = new Map(); // key -> { nameAr, nameEn }
for (const block of itemBlocks) {
  for (const m of block.matchAll(
    /key:\s*"([^"]+)",\s*nameAr:\s*"([^"]*)",\s*nameEn:\s*"([^"]*)"/g
  )) {
    leafKeys.push(m[1]);
    leafNames.set(m[1], { nameAr: m[2], nameEn: m[3] });
  }
  // Anything with a key but no matching nameAr+nameEn pair is a half-translated
  // entry, which the regex above would silently skip.
  for (const m of block.matchAll(/key:\s*"([^"]+)"/g)) {
    if (!leafNames.has(m[1])) {
      errors.push(`categories.ts leaf "${m[1]}" is missing nameAr and/or nameEn (or they are out of order)`);
      leafKeys.push(m[1]);
    }
  }
}

const groupCount = itemBlocks.length;
console.log(`Parsed ${groupCount} groups / ${leafKeys.length} leaf categories from categories.ts`);

// Every group needs both labels too. Comment lines are allowed between them.
const COMMENTS = String.raw`(?:\s*//[^\n]*\n)*`;
const groupHeads = [
  ...src.matchAll(
    new RegExp(
      String.raw`\n {4}key:\s*"([^"]+)",\n` + COMMENTS + String.raw`\s*nameAr:\s*"([^"]*)",\n` + COMMENTS + String.raw`\s*nameEn:\s*"([^"]*)",`,
      "g"
    )
  ),
];
if (groupHeads.length !== groupCount) {
  errors.push(
    `${groupCount} groups have items but only ${groupHeads.length} have both nameAr and nameEn`
  );
}

for (const [key, names] of leafNames) {
  if (!names.nameAr.trim()) errors.push(`category "${key}" has an empty nameAr`);
  if (!names.nameEn.trim()) errors.push(`category "${key}" has an empty nameEn`);
}

// ---------------------------------------------------------------- cross-checks

const dupLeaves = leafKeys.filter((k, i) => leafKeys.indexOf(k) !== i);
if (dupLeaves.length) errors.push(`leaf key(s) appear more than once in the tree: ${[...new Set(dupLeaves)].join(", ")}`);

for (const k of leafKeys) {
  if (!words[k]) errors.push(`categories.ts references "${k}" but words.json has no such list`);
}

for (const k of Object.keys(words)) {
  if (!leafKeys.includes(k)) {
    errors.push(`words.json has list "${k}" that no category in the tree points at (it can never be played)`);
  }
}

// ------------------------------------------------------------- per-list checks

const ARABIC = /[؀-ۿݐ-ݿ]/;
const LATIN = /[A-Za-z]/;
const DIGIT = /[0-9٠-٩]/;

/** Index of each language inside a pair, matching `src/content.ts`. */
const LANGS = [
  { name: "ar", index: 0 },
  { name: "en", index: 1 },
];

for (const [key, list] of Object.entries(words)) {
  if (!Array.isArray(list)) {
    errors.push(`"${key}" is not an array`);
    continue;
  }
  if (list.length < HARD_MIN) {
    errors.push(`"${key}" has ${list.length} words — the game refuses to start below ${HARD_MIN}`);
  } else if (list.length < MIN_WORDS) {
    warnings.push(`"${key}" has only ${list.length} words (want >= ${MIN_WORDS})`);
  }

  // Duplicates are tracked per language: two different Arabic words are allowed
  // to be near-synonyms, but they must not collapse to the same English card.
  const seen = { ar: new Map(), en: new Map() };

  list.forEach((pair, i) => {
    if (!Array.isArray(pair) || pair.length !== 2) {
      errors.push(`"${key}"[${i}] is not an [arabic, english] pair`);
      return;
    }

    for (const { name, index } of LANGS) {
      const w = pair[index];
      if (typeof w !== "string") {
        errors.push(`"${key}"[${i}].${name} is not a string`);
        continue;
      }
      const trimmed = w.trim();
      if (trimmed !== w) warnings.push(`"${key}".${name}: "${w}" has surrounding whitespace`);
      if (!trimmed) {
        errors.push(`"${key}"[${i}].${name} is empty`);
        continue;
      }
      if (seen[name].has(trimmed)) {
        errors.push(`"${key}" has duplicate ${name} word "${trimmed}"`);
      }
      seen[name].set(trimmed, i);

      if (DIGIT.test(trimmed)) warnings.push(`"${key}".${name}: "${trimmed}" contains digits`);
      if (trimmed.length > 34) warnings.push(`"${key}".${name}: "${trimmed}" is long (${trimmed.length} chars)`);
    }

    // Script sanity: the Arabic half must not be plain Latin, and the English
    // half must not contain Arabic script at all.
    const [ar, en] = pair;
    if (typeof ar === "string" && LATIN.test(ar)) {
      warnings.push(`"${key}".ar: "${ar}" contains Latin letters`);
    }
    if (typeof en === "string" && ARABIC.test(en)) {
      errors.push(`"${key}".en: "${en}" contains Arabic script`);
    }
    if (typeof en === "string" && en.trim() && !LATIN.test(en)) {
      warnings.push(`"${key}".en: "${en}" has no Latin letters`);
    }
  });
}

// ----------------------------------------------------------------------- report

const total = Object.values(words).reduce((n, l) => n + (Array.isArray(l) ? l.length : 0), 0);
const shortest = Object.entries(words)
  .filter(([, l]) => Array.isArray(l))
  .sort((a, b) => a[1].length - b[1].length)
  .slice(0, 5);

console.log(`${Object.keys(words).length} lists, ${total} bilingual pairs (${total * 2} words)`);
console.log(`shortest: ${shortest.map(([k, l]) => `${k}(${l.length})`).join(", ")}`);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings.slice(0, 40)) console.log(`  ! ${w}`);
  if (warnings.length > 40) console.log(`  … and ${warnings.length - 40} more`);
}

if (errors.length) {
  console.log(`\n${errors.length} ERROR(s):`);
  for (const e of errors) console.log(`  x ${e}`);
  process.exit(1);
}

console.log("\nContent OK.");
