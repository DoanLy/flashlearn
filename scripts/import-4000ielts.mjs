// Nạp bộ "4000IELTS" — 20 file CSV ForumFlash (scripts/data-4000ielts/forumflash-*.csv),
// mỗi file 200 từ của 1 chủ đề IELTS (cột Term, Definition, Example, Topic).
// Mỗi file thành 1 chủ đề tên "4000IELTS - <Topic>", vd "4000IELTS - Media & Advertising".
// Từ trùng giữa các chủ đề được GIỮ (mỗi chủ đề đủ 200 thẻ như file gốc).
//
// Thẻ theo chuẩn 3 dòng: "Phiên âm: /…/\nNghĩa: …\nVí dụ: "…"".
// CSV không có phiên âm ⇒ tự dựng IPA Anh-Anh: mỗi từ tra scripts/_oxford_full_word.json
// (Oxford, ưu tiên) rồi scripts/_en_UK_ipa.txt (eSpeak); cụm từ = ghép IPA từng từ.
// Thiếu IPA của bất kỳ từ nào trong cụm ⇒ bỏ dòng Phiên âm (không bịa). 2 file nguồn IPA là
// file tải về, không commit (xem build-oxford-phonetics.mjs) — thiếu file thì thẻ không có IPA.
//
// id = "4000ielts-<slug file>-0001"… (deterministic ⇒ chạy lại không tạo thẻ trùng).
// Mặc định DRY-RUN; thêm --apply để ghi thật lên Supabase.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(HERE, "data-4000ielts");
const APPLY = process.argv.includes("--apply");
const PREFIX = "4000IELTS - ";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// --- IPA từng từ ---
const ipa = new Map();
const espeakPath = join(HERE, "_en_UK_ipa.txt");
if (existsSync(espeakPath)) {
  for (const line of readFileSync(espeakPath, "utf8").split("\n")) {
    const [w, p] = line.split("\t");
    if (w && p && p.trim()) ipa.set(w.trim().toLowerCase(), p.split(",")[0].trim().replace(/^\/|\/$/g, ""));
  }
}
const oxfordPath = join(HERE, "_oxford_full_word.json");
if (existsSync(oxfordPath)) {
  // Oxford ghi đè eSpeak; từ có nhiều mục thì lấy mục đầu tiên có phonetics.uk
  const seenOx = new Set();
  for (const { value } of JSON.parse(readFileSync(oxfordPath, "utf8"))) {
    const w = String(value?.word || "").trim().toLowerCase();
    const uk = value?.phonetics?.uk;
    if (!w || !uk || seenOx.has(w)) continue;
    seenOx.add(w);
    ipa.set(w, uk.trim().replace(/^\/|\/$/g, ""));
  }
}
const phraseIpa = (term) => {
  const words = term.toLowerCase().split(/[\s-]+/).filter(Boolean);
  const parts = words.map((w) => ipa.get(w.replace(/[^a-z']/g, "")));
  return parts.every(Boolean) ? `/${parts.join(" ")}/` : "";
};

// --- CSV (mọi ô đều bọc "…", có thể chứa dấu phẩy) ---
const parseCsv = (text) => {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
};

const decks = new Map(); // deck -> cards[]
let noIpa = 0;
for (const file of readdirSync(DATA_DIR).filter((f) => /^forumflash-.+\.csv$/.test(f)).sort()) {
  const slug = file.replace(/^forumflash-|\.csv$/g, "");
  const [header, ...rows] = parseCsv(readFileSync(join(DATA_DIR, file), "utf8").replace(/^﻿/, ""));
  if (header.join(",") !== "Term,Definition,Example,Topic") throw new Error(`${file}: header lạ ${header}`);
  const cards = [];
  const seen = new Set();
  for (const r of rows) {
    const [term, def, ex, topic] = r.map((s) => s.trim());
    if (r.length !== 4 || !term || !def || !topic) throw new Error(`${file}: dòng lỗi ${r}`);
    const deck = PREFIX + topic;
    if (seen.has(term.toLowerCase())) throw new Error(`${file}: trùng từ ${term}`);
    seen.add(term.toLowerCase());
    const phon = phraseIpa(term);
    if (!phon) noIpa++;
    const lines = [];
    if (phon) lines.push(`Phiên âm: ${phon}`);
    lines.push(`Nghĩa: ${def}`);
    if (ex) lines.push(`Ví dụ: "${ex}"`);
    cards.push({
      id: `4000ielts-${slug}-${String(cards.length + 1).padStart(4, "0")}`,
      word: term,
      meaning: lines.join("\n"),
      deck,
      status: "new",
    });
  }
  const deck = cards[0].deck;
  if (cards.some((c) => c.deck !== deck)) throw new Error(`${file}: nhiều Topic trong 1 file`);
  if (decks.has(deck)) throw new Error(`Trùng chủ đề ${deck}`);
  decks.set(deck, cards);
}

const all = [...decks.values()].flat();
console.log(`${decks.size} chủ đề, ${all.length} thẻ (${noIpa} thẻ không dựng được IPA).`);

// --- So với DB ---
let toInsert = [];
for (const [deck, cards] of decks) {
  const { data: existing, error } = await supabase.from("cards").select("id,word").eq("deck", deck);
  if (error) throw error;
  const ids = new Set(existing.map((c) => String(c.id)));
  const words = new Set(existing.map((c) => String(c.word).toLowerCase()));
  const add = cards.filter((c) => !ids.has(c.id) && !words.has(c.word.toLowerCase()));
  console.log(`  ${deck}: có ${existing.length} → thêm ${add.length}`);
  toInsert.push(...add);
}
toInsert.slice(0, 3).forEach((c) => console.log(JSON.stringify(c)));

if (!APPLY) {
  console.log(`\nDRY-RUN — sẽ thêm ${toInsert.length} thẻ. Chạy lại với --apply để ghi thật.`);
  process.exit(0);
}
for (let i = 0; i < toInsert.length; i += 500) {
  const { error } = await supabase.from("cards").insert(toInsert.slice(i, i + 500));
  if (error) throw error;
  console.log(`  đã ghi ${Math.min(i + 500, toInsert.length)}/${toInsert.length}`);
}
for (const deck of decks.keys()) {
  const { count } = await supabase.from("cards").select("id", { count: "exact", head: true }).eq("deck", deck);
  console.log(`  ${deck}: ${count} thẻ`);
}
