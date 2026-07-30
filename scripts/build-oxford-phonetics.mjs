// Dựng bảng phiên âm (IPA Anh-Anh) cho các thẻ deck "Từ Vựng Oxford 3000 A1/A2/B1/B2"
// đang có trên Supabase, ghi ra scripts/oxford-phonetics.json (KHÔNG ghi DB).
//
// Nguồn phiên âm, ưu tiên từ trên xuống:
//   1. scripts/_oxford_full_word.json — bản scrape Oxford Learner's Dictionaries
//      (github.com/tyypgzl/Oxford-5000-words), 5948 mục có sẵn phonetics.uk đúng chuẩn Oxford.
//      Khớp theo (từ đã bóc chú thích) + ưu tiên mục cùng từ loại, rồi cùng cấp độ CEFR.
//   2. scripts/_en_UK_ipa.txt — bộ ipa-dict en_UK (eSpeak), dùng cho từ nào bước 1 không có.
//   3. api.dictionaryapi.dev — tra online cho phần còn lại (chạy với --api mới gọi mạng).
//
// Cả 2 file nguồn đều là file tải về, KHÔNG commit (xem .gitignore).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const USE_API = process.argv.includes("--api");

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

const DECKS = [
  "Từ Vựng Oxford 3000 A1",
  "Từ Vựng Oxford 3000 A2",
  "Từ Vựng Oxford 3000 B1",
  "Từ Vựng Oxford 3000 B2",
];

// --- 1. Đọc thẻ hiện có trên DB ---
async function loadAll() {
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("id,word,meaning,deck")
      .range(from, from + 999);
    if (error) throw error;
    if (!data || !data.length) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return all;
}

const cards = (await loadAll()).filter((c) => DECKS.includes(c.deck));
console.log(`Thẻ Oxford trên DB: ${cards.length}`);

// "kind (type)" → "kind";  "New York" giữ nguyên
const baseWord = (w) =>
  String(w)
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// Lấy từ loại từ dòng "Nghĩa: (n., adj.) …"
const posOf = (meaning) => {
  const m = /^Nghĩa:\s*\(([^)]*)\)/m.exec(meaning || "");
  return m ? m[1] : "";
};

const POS_MAP = {
  n: "noun",
  v: "verb",
  adj: "adjective",
  adv: "adverb",
  prep: "preposition",
  conj: "conjunction",
  pron: "pronoun",
  det: "determiner",
  exclam: "exclamation",
  number: "number",
  "modal v": "modal verb",
  "auxiliary v": "auxiliary verb",
  article: "indefinite article",
};
const normPosList = (raw) =>
  String(raw)
    .split(/[,/]/)
    .map((s) => s.trim().replace(/\.$/, "").toLowerCase())
    .filter(Boolean)
    .map((s) => POS_MAP[s] || s);

// --- 2. Nguồn 1: bản scrape Oxford ---
const oxfordPath = join(HERE, "_oxford_full_word.json");
const oxfordByWord = new Map();
if (existsSync(oxfordPath)) {
  const raw = JSON.parse(readFileSync(oxfordPath, "utf8"));
  for (const e of raw) {
    const v = e.value || {};
    const uk = v.phonetics?.uk;
    if (!v.word || !uk) continue;
    const key = baseWord(v.word);
    if (!oxfordByWord.has(key)) oxfordByWord.set(key, []);
    oxfordByWord.get(key).push({
      uk: uk.trim(),
      type: String(v.type || "").toLowerCase(),
      level: String(v.level || "").trim(),
    });
  }
  console.log(`Nguồn Oxford: ${oxfordByWord.size} từ.`);
} else {
  console.warn("THIẾU scripts/_oxford_full_word.json — bỏ qua nguồn 1.");
}

// --- 3. Nguồn 2: ipa-dict en_UK ---
const ipaDictPath = join(HERE, "_en_UK_ipa.txt");
const ipaDict = new Map();
if (existsSync(ipaDictPath)) {
  for (const line of readFileSync(ipaDictPath, "utf8").split("\n")) {
    const [w, prons] = line.split("\t");
    if (!w || !prons) continue;
    const first = prons.split(",")[0].trim();
    if (first) ipaDict.set(w.trim().toLowerCase(), first);
  }
  console.log(`Nguồn ipa-dict: ${ipaDict.size} từ.`);
}

const pickOxford = (word, level, posRaw) => {
  const list = oxfordByWord.get(baseWord(word));
  if (!list || !list.length) return null;
  const wanted = normPosList(posRaw);
  // Ưu tiên: đúng từ loại + đúng cấp độ → đúng từ loại → đúng cấp độ → mục đầu tiên
  const byPosLevel = list.find((e) => wanted.includes(e.type) && e.level === level);
  const byPos = list.find((e) => wanted.includes(e.type));
  const byLevel = list.find((e) => e.level === level);
  const chosen = byPosLevel || byPos || byLevel || list[0];
  // Nếu các từ loại của thẻ đọc khác nhau (record n. vs v.) thì ghi cả 2
  const variants = [
    ...new Set(
      list
        .filter((e) => wanted.includes(e.type))
        .map((e) => e.uk),
    ),
  ];
  if (variants.length > 1) return variants.join(", ");
  return chosen.uk;
};

const out = [];
const missing = [];
for (const c of cards) {
  const level = /A1$/.test(c.deck)
    ? "A1"
    : /A2$/.test(c.deck)
      ? "A2"
      : /B1$/.test(c.deck)
        ? "B1"
        : "B2";
  const pos = posOf(c.meaning);
  let phonetic = pickOxford(c.word, level, pos);
  let source = phonetic ? "oxford" : null;
  if (!phonetic) {
    const alt = ipaDict.get(baseWord(c.word));
    if (alt) {
      phonetic = alt;
      source = "ipa-dict";
    }
  }
  if (!phonetic) missing.push(c);
  out.push({ id: c.id, word: c.word, level, pos, phonetic: phonetic || "", source: source || "" });
}

console.log(
  `Có phiên âm: ${out.filter((o) => o.phonetic).length}/${out.length}` +
    ` (oxford ${out.filter((o) => o.source === "oxford").length}, ipa-dict ${out.filter((o) => o.source === "ipa-dict").length})`,
);
console.log(`Thiếu: ${missing.length}`, missing.slice(0, 30).map((c) => c.word).join(", "));

// --- 4. Nguồn 3: dictionaryapi.dev cho phần còn lại ---
if (USE_API && missing.length) {
  const byId = new Map(out.map((o) => [o.id, o]));
  let done = 0;
  for (const c of missing) {
    const w = baseWord(c.word);
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`,
      );
      if (res.ok) {
        const json = await res.json();
        const texts = [];
        for (const entry of json) {
          if (entry.phonetic) texts.push(entry.phonetic);
          for (const p of entry.phonetics || []) if (p.text) texts.push(p.text);
        }
        // ưu tiên bản KHÔNG có r cuối kiểu Mỹ (ɹ/r trước phụ âm) — lấy bản đầu tiên vậy
        const pick = texts.find((t) => /^\/.*\/$/.test(t));
        if (pick) {
          const o = byId.get(c.id);
          o.phonetic = pick.replace(/ɹ/g, "r");
          o.source = "dictionaryapi";
        }
      }
    } catch (e) {
      console.warn("lỗi tra", w, e.message);
    }
    done++;
    if (done % 25 === 0) console.log(`  đã tra ${done}/${missing.length}`);
  }
  console.log(
    `Sau khi gọi API: có phiên âm ${out.filter((o) => o.phonetic).length}/${out.length}`,
  );
}

writeFileSync(join(HERE, "oxford-phonetics.json"), JSON.stringify(out, null, 0), "utf8");
console.log("Đã ghi scripts/oxford-phonetics.json");
