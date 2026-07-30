// Nạp từ vựng Oxford 3000/5000 (A1–B2) vào Supabase thành 4 chủ đề:
//   "Từ Vựng Oxford 3000 A1" / "... A2" / "... B1" / "... B2"
//
// Nguồn: scripts/oxford-a1-b2.json — trích từ D:\ENGLISH\Oxford_Vocabulary_A1_B2.xlsx
// (sheet "Vocabulary Data", 4 cột: Từ vựng / Từ loại / Cấp độ / Nghĩa tiếng Việt).
//
// Mỗi dòng thành 1 thẻ:
//   word    = ô "Từ vựng" giữ nguyên (kể cả chú thích phân biệt nghĩa như "kind (type)"
//             — game đã có cleanWordForGame() bóc phần trong ngoặc nên không ảnh hưởng)
//   meaning = "Nghĩa: (n.) sân bay"  (đúng format 1 dòng của formatCardMeaning;
//             file nguồn KHÔNG có phiên âm/ví dụ nên bỏ 2 dòng đó)
//   deck    = theo cấp độ CEFR, status = "new"
//   id      = "oxford-a1-0001" (deterministic ⇒ chạy lại không tạo thẻ trùng)
//
// Chạy mặc định là DRY-RUN (chỉ in ra). Thêm --apply để ghi thật lên Supabase.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const APPLY = process.argv.includes("--apply");

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

const DECK_BY_LEVEL = {
  A1: "Từ Vựng Oxford 3000 A1",
  A2: "Từ Vựng Oxford 3000 A2",
  B1: "Từ Vựng Oxford 3000 B1",
  B2: "Từ Vựng Oxford 3000 B2",
};

async function loadAll() {
  let all = [];
  let from = 0;
  const BATCH = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .range(from, from + BATCH - 1);
    if (error) throw error;
    if (!data || !data.length) break;
    all = all.concat(data);
    if (data.length < BATCH) break;
    from += BATCH;
  }
  return all;
}

// --- Dựng danh sách thẻ từ file JSON ---
const rows = JSON.parse(
  readFileSync(join(HERE, "oxford-a1-b2.json"), "utf8"),
);

// Gộp các dòng CÙNG từ + CÙNG cấp độ (file có 3 trường hợp: ring/firm/tear) thành 1 thẻ
// để trong một chủ đề không có 2 thẻ trùng từ: "(n.) chiếc nhẫn; (v.) rung chuông".
const merged = new Map();
for (const r of rows) {
  const word = (r.word || "").trim();
  const level = (r.level || "").trim();
  const pos = (r.pos || "").trim();
  const vi = (r.vi || "").trim();
  if (!word || !vi || !DECK_BY_LEVEL[level]) {
    console.warn("BỎ QUA dòng thiếu dữ liệu:", JSON.stringify(r));
    continue;
  }
  const key = `${level}\u0000${word.toLowerCase()}`;
  const piece = pos ? `(${pos}) ${vi}` : vi;
  if (merged.has(key)) merged.get(key).pieces.push(piece);
  else merged.set(key, { word, level, pieces: [piece] });
}

const counters = {};
const cards = [...merged.values()].map((m) => {
  const n = (counters[m.level] = (counters[m.level] || 0) + 1);
  return {
    id: `oxford-${m.level.toLowerCase()}-${String(n).padStart(4, "0")}`,
    word: m.word,
    meaning: `Nghĩa: ${m.pieces.join("; ")}`,
    deck: DECK_BY_LEVEL[m.level],
    status: "new",
  };
});

console.log(`Đọc ${rows.length} dòng từ file → ${cards.length} thẻ sau khi gộp trùng.`);
for (const level of Object.keys(DECK_BY_LEVEL)) {
  console.log(`  ${DECK_BY_LEVEL[level]}: ${counters[level] || 0} thẻ`);
}

const existing = await loadAll();
const existingIds = new Set(existing.map((c) => String(c.id)));
const existingByDeckWord = new Set(
  existing.map((c) => `${c.deck || "Chung"}\u0000${String(c.word).toLowerCase()}`),
);
console.log(`DB hiện có ${existing.length} thẻ.`);

const toInsert = cards.filter(
  (c) =>
    !existingIds.has(c.id) &&
    !existingByDeckWord.has(`${c.deck}\u0000${c.word.toLowerCase()}`),
);
console.log(`Cần thêm mới: ${toInsert.length} thẻ (đã có sẵn ${cards.length - toInsert.length}).`);
console.log("Ví dụ 3 thẻ đầu:");
toInsert.slice(0, 3).forEach((c) => console.log("  ", JSON.stringify(c)));

if (!APPLY) {
  console.log("\nDRY-RUN — chưa ghi gì. Chạy lại với --apply để ghi thật.");
  process.exit(0);
}

const CHUNK = 500;
let done = 0;
for (let i = 0; i < toInsert.length; i += CHUNK) {
  const chunk = toInsert.slice(i, i + CHUNK);
  const { error } = await supabase.from("cards").insert(chunk);
  if (error) {
    console.error(`Lỗi ở batch ${i}-${i + chunk.length}:`, error);
    process.exit(1);
  }
  done += chunk.length;
  console.log(`  đã ghi ${done}/${toInsert.length}`);
}
console.log("Xong.");
