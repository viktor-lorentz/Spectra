// @ts-check
/**
 * Builds the daily puzzle schedule from the set bank (src/data/sets.json).
 *
 * Design goals:
 *  - Reproducible: the same bank always yields the same schedule.
 *  - Stable: already-published days are read back from puzzles.json and left
 *    untouched, so a date that has already gone live keeps its puzzle forever.
 *  - Even + varied: future days are laid out as back-to-back shuffled passes of
 *    the whole bank, so every set appears once per cycle (maximum spacing) and
 *    no set repeats across a cycle boundary.
 *  - Validated: every set must have exactly 8 items with strictly distinct
 *    values, or generation fails loudly.
 *
 * Usage:
 *   node scripts/generate-puzzles.mjs            # extend the schedule
 *   node scripts/generate-puzzles.mjs --fresh    # rebuild from scratch
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, relative } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../src/data");
const SETS_PATH = resolve(DATA_DIR, "sets.json");
const PUZZLES_PATH = resolve(DATA_DIR, "puzzles.json");

// ---- Tunables -------------------------------------------------------------
const EPOCH_UTC = "2026-08-18"; // Spectra #1 is this UTC date.
const TARGET_DAYS = 400; // Over a year of daily puzzles scheduled up front.
const ITEMS_PER_SET = 8;
const DAY_MS = 86_400_000;
// ---------------------------------------------------------------------------

const fresh = process.argv.includes("--fresh");

/** Small, fast, seedable PRNG (mulberry32). */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dateISOForIndex(i) {
  const epoch = Date.parse(`${EPOCH_UTC}T00:00:00Z`);
  return new Date(epoch + i * DAY_MS).toISOString().slice(0, 10);
}

// --- Load + validate the bank ----------------------------------------------
/** @type {Array<{id:string, axis:string, category:string, items:Array<{name:string,value:number}>}>} */
const sets = JSON.parse(readFileSync(SETS_PATH, "utf8"));

const seenIds = new Set();
for (const set of sets) {
  if (seenIds.has(set.id)) throw new Error(`Duplicate set id: ${set.id}`);
  seenIds.add(set.id);
  if (!Array.isArray(set.items) || set.items.length !== ITEMS_PER_SET) {
    throw new Error(`Set "${set.id}" must have exactly ${ITEMS_PER_SET} items (has ${set.items?.length}).`);
  }
  const values = set.items.map((it) => it.value);
  if (values.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    throw new Error(`Set "${set.id}" has a non-numeric value.`);
  }
  if (new Set(values).size !== values.length) {
    throw new Error(`Set "${set.id}" has duplicate values — ordering would be ambiguous.`);
  }
}

if (sets.length < ITEMS_PER_SET) {
  throw new Error(`Need a healthy bank of sets; found only ${sets.length}.`);
}
const setIds = new Set(sets.map((s) => s.id));

// --- Preserve already-published days ---------------------------------------
/** @type {Array<{id:number, dateISO:string, setId:string}>} */
let days = [];
if (!fresh && existsSync(PUZZLES_PATH)) {
  const existing = JSON.parse(readFileSync(PUZZLES_PATH, "utf8"));
  if (existing.epochUTC === EPOCH_UTC && Array.isArray(existing.days)) {
    days = existing.days.filter((d) => setIds.has(d.setId));
  }
}

// --- Append future days as shuffled passes of the whole bank ----------------
function appendCycle(cycleIndex) {
  const rand = mulberry32((cycleIndex + 1) * 2654435761);
  let order = shuffle(sets, rand).map((s) => s.id);
  // Avoid the same set landing on consecutive days across a cycle boundary.
  const last = days.length ? days[days.length - 1].setId : null;
  if (last && order[0] === last && order.length > 1) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  for (const setId of order) {
    if (days.length >= TARGET_DAYS) break;
    const i = days.length;
    days.push({ id: i + 1, dateISO: dateISOForIndex(i), setId });
  }
}

let cycle = Math.floor(days.length / sets.length);
while (days.length < TARGET_DAYS) {
  appendCycle(cycle);
  cycle += 1;
}

// Re-stamp ids/dates so the schedule stays internally consistent.
days = days.slice(0, TARGET_DAYS).map((d, i) => ({
  id: i + 1,
  dateISO: dateISOForIndex(i),
  setId: d.setId,
}));

const output = {
  epochUTC: EPOCH_UTC,
  resetUTC: "00:00",
  itemsPerSet: ITEMS_PER_SET,
  setCount: sets.length,
  generatedDays: days.length,
  days,
};

writeFileSync(PUZZLES_PATH, JSON.stringify(output, null, 2) + "\n");

// --- Report ----------------------------------------------------------------
const catCounts = {};
const setUse = {};
for (const d of days) {
  setUse[d.setId] = (setUse[d.setId] || 0) + 1;
  const cat = sets.find((s) => s.id === d.setId)?.category ?? "?";
  catCounts[cat] = (catCounts[cat] || 0) + 1;
}
// Smallest gap between repeats of the same set (sanity check).
let minGap = Infinity;
const lastSeen = {};
days.forEach((d, i) => {
  if (lastSeen[d.setId] != null) minGap = Math.min(minGap, i - lastSeen[d.setId]);
  lastSeen[d.setId] = i;
});

console.log(`✓ Wrote ${days.length} days from ${sets.length} sets to ${relative(process.cwd(), PUZZLES_PATH)}`);
console.log(`  Smallest gap between repeats: ${minGap === Infinity ? "n/a" : minGap} days`);
console.log("  Category spread:", catCounts);
