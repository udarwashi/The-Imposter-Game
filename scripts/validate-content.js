/**
 * Checks the category tree and the word lists agree, and that the words are
 * usable in-game.
 *
 *   node scripts/validate-content.js
 *
 * Exits non-zero on any error, so it can gate a commit.
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

// Group keys appear as `key: "x",` followed by `nameAr`, then `icon`.
// Leaf keys appear inside `items: [...]`. Distinguish by grabbing the items
// blocks first, then pulling keys from within them.
const itemBlocks = [...src.matchAll(/items:\s*\[([\s\S]*?)\n\s{4}\],/g)].map((m) => m[1]);
if (itemBlocks.length === 0) {
  errors.push("could not parse any `items:` blocks out of categories.ts — has its shape changed?");
}

const leafKeys = [];
for (const block of itemBlocks) {
  for (const m of block.matchAll(/key:\s*"([^"]+)"/g)) leafKeys.push(m[1]);
}

const groupCount = itemBlocks.length;
console.log(`Parsed ${groupCount} groups / ${leafKeys.length} leaf categories from categories.ts`);

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

const LATIN = /[A-Za-z]/;
const DIGIT = /[0-9٠-٩]/;

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

  const seen = new Map();
  list.forEach((w, i) => {
    if (typeof w !== "string") {
      errors.push(`"${key}"[${i}] is not a string`);
      return;
    }
    const trimmed = w.trim();
    if (trimmed !== w) warnings.push(`"${key}": "${w}" has surrounding whitespace`);
    if (!trimmed) {
      errors.push(`"${key}"[${i}] is empty`);
      return;
    }
    if (seen.has(trimmed)) {
      errors.push(`"${key}" has duplicate word "${trimmed}"`);
    }
    seen.set(trimmed, i);

    if (LATIN.test(trimmed)) warnings.push(`"${key}": "${trimmed}" contains Latin letters`);
    if (DIGIT.test(trimmed)) warnings.push(`"${key}": "${trimmed}" contains digits`);
    if (trimmed.length > 30) warnings.push(`"${key}": "${trimmed}" is long (${trimmed.length} chars)`);
  });
}

// ----------------------------------------------------------------------- report

const total = Object.values(words).reduce((n, l) => n + (Array.isArray(l) ? l.length : 0), 0);
const shortest = Object.entries(words)
  .filter(([, l]) => Array.isArray(l))
  .sort((a, b) => a[1].length - b[1].length)
  .slice(0, 5);

console.log(`${Object.keys(words).length} lists, ${total} words total`);
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
