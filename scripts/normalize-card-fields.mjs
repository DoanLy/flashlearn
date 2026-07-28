// Chuẩn hoá dữ liệu cũ về đúng format 4-trường: word = Từ vựng sạch,
// meaning = 3 dòng "Phiên âm: …\nNghĩa: …\nVí dụ: …" (nhãn nào rỗng thì bỏ dòng).
// Đa số thẻ (~3107/3332) đã đúng format này rồi (giữ nguyên, không đụng tới).
// Chạy mặc định là DRY-RUN (chỉ in ra). Thêm --apply để ghi thật lên Supabase.
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

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

const hasNghia = (m) => /^nghĩa\s*[:：]/im.test(m || "");

// --- Word-side: bóc phiên âm dạng "Cụm từ (/ipa/)" hoặc ví dụ dạng "word - câu ví dụ" ---
function extractFromWord(word) {
  const w = (word || "").trim();
  let m = w.match(/^(.*?)\s*\(\/([^)]+)\/\)\s*$/);
  if (m) {
    return { cleanWord: m[1].trim(), phonetic: `/${m[2].trim()}/`, example: "" };
  }
  m = w.split(/\s+[-–—]\s+/);
  if (m.length >= 2 && m[0].trim() && /\s/.test(m.slice(1).join(" - "))) {
    return { cleanWord: m[0].trim(), phonetic: "", example: m.slice(1).join(" - ").trim() };
  }
  return { cleanWord: w, phonetic: "", example: "" };
}

// --- Meaning-side: bóc phiên âm đầu chuỗi (có/không ngoặc), rồi tách Nghĩa/Ví dụ ---
function extractFromMeaning(raw) {
  let s = (raw || "").trim();
  let phonetic = "";
  // Dạng "(/…/) Nghĩa" — phiên âm có thể chứa "/" nội bộ (biến thể "A / B"),
  // nên bắt tham lam tới cặp "/…/)" CUỐI CÙNG trên cùng dòng, không dừng ở "/" đầu tiên.
  let pm = s.match(/^\((\/[^\n]*\/)\)\s*/);
  if (pm) {
    phonetic = pm[1].trim();
    s = s.slice(pm[0].length).trim();
  } else {
    // Dạng bare "/…/" đầu dòng (không ngoặc), ví dụ phiên âm 1 từ đứng riêng dòng đầu.
    const pm2 = s.match(/^(\/[^/\n]*\/)\s*/);
    if (pm2) {
      phonetic = pm2[1].trim();
      s = s.slice(pm2[0].length).trim();
    }
  }
  if (s.includes("\n")) {
    const lines = s.split("\n").map((l) => l.trim()).filter(Boolean);
    return { phonetic, meaning: lines[0] || "", example: lines.slice(1).join(" ") };
  }
  const dotIdx = s.indexOf(". ");
  if (dotIdx > -1) {
    const head = s.slice(0, dotIdx).trim();
    const tail = s.slice(dotIdx + 2).trim();
    const looksLikeExample = tail.split(/\s+/).length >= 3;
    if (head && looksLikeExample) {
      return { phonetic, meaning: head, example: tail };
    }
  }
  return { phonetic, meaning: s, example: "" };
}

function formatCardMeaning({ phonetic, meaning, example }) {
  const lines = [];
  if ((phonetic || "").trim()) lines.push(`Phiên âm: ${phonetic.trim()}`);
  lines.push(`Nghĩa: ${(meaning || "").trim()}`);
  if ((example || "").trim()) lines.push(`Ví dụ: ${example.trim()}`);
  return lines.join("\n");
}

const apply = process.argv.includes("--apply");
const all = await loadAll();
console.log(`Tổng số thẻ: ${all.length}`);

const toFix = all.filter((c) => !hasNghia(c.meaning || ""));
console.log(`Thẻ lệch format (cần chuẩn hoá): ${toFix.length}`);

const upserts = [];
for (const c of toFix) {
  const fromWord = extractFromWord(c.word);
  const fromMeaning = extractFromMeaning(c.meaning);
  const phonetic = fromWord.phonetic || fromMeaning.phonetic;
  const example = fromWord.example || fromMeaning.example;
  const meaning = fromMeaning.meaning;
  const newWord = fromWord.cleanWord;
  const newMeaning = formatCardMeaning({ phonetic, meaning, example });
  if (newWord !== c.word || newMeaning !== c.meaning) {
    upserts.push({ ...c, word: newWord, meaning: newMeaning, _old: c });
  }
}

console.log(`Sẽ ghi lại: ${upserts.length} thẻ\n`);
const sampleLimit = process.argv.includes("--full") ? upserts.length : 10;
console.log(`--- Mẫu (${sampleLimit} thẻ) ---`);
for (const u of upserts.slice(0, sampleLimit)) {
  console.log(`[${u.deck}] "${u._old.word}" | ${JSON.stringify(u._old.meaning)}`);
  console.log(`  -> "${u.word}" | ${JSON.stringify(u.meaning)}`);
}

if (!apply) {
  console.log("\n(chạy thử — thêm --apply để ghi thật lên Supabase)");
  process.exit(0);
}

const backupPath = new URL(`./_backup_cards_${Date.now()}.json`, import.meta.url);
writeFileSync(backupPath, JSON.stringify(all, null, 2));
console.log(`Đã backup toàn bộ ${all.length} thẻ vào ${backupPath.pathname}`);

const rows = upserts.map(({ _old, ...rest }) => rest);
const CHUNK = 500;
for (let i = 0; i < rows.length; i += CHUNK) {
  const batch = rows.slice(i, i + CHUNK);
  const { error } = await supabase.from("cards").upsert(batch, { onConflict: "id" });
  if (error) throw error;
  console.log(`  ghi ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
}
console.log(`\n✓ ĐÃ CHUẨN HOÁ ${rows.length} thẻ.`);
