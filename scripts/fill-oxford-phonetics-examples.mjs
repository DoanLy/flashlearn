// Bổ sung dòng "Phiên âm:" và "Ví dụ:" cho các thẻ deck Oxford 3000 A1/A2/B1/B2 trên Supabase.
//
// Nguồn:
//   - scripts/oxford-phonetics.json         (do build-oxford-phonetics.mjs sinh ra; IPA Anh-Anh)
//   - scripts/oxford-examples/chunk-*.txt   (viết tay, mỗi dòng: "a1-0001|English sentence|Bản dịch")
//
// Kết quả mỗi thẻ đúng format 3 dòng chuẩn của app (parseCardFields/formatCardMeaning):
//   Phiên âm: /ˈeəpɔːt/
//   Nghĩa: (n.) sân bay
//   Ví dụ: "Our office is only ten minutes from the airport." (Văn phòng của chúng tôi chỉ cách sân bay mười phút.)
//
// Dòng "Nghĩa:" giữ NGUYÊN như đang có trên DB. Thẻ nào đã có sẵn Phiên âm/Ví dụ thì bỏ qua
// (chỉ ghi khi nội dung thực sự đổi) ⇒ chạy lại script là no-op.
//
// Mặc định DRY-RUN. Thêm --apply để ghi thật (tự backup toàn bộ bảng cards trước khi ghi).
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const APPLY = process.argv.includes("--apply");

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

// Vài từ dataset Oxford không có phonetics.uk — điền tay.
const PHONETIC_OVERRIDE = {
  aged: "/eɪdʒd/, /ˈeɪdʒɪd/",
};

// --- Đọc phiên âm ---
const phonetics = new Map();
for (const row of JSON.parse(
  readFileSync(join(HERE, "oxford-phonetics.json"), "utf8"),
)) {
  const p = PHONETIC_OVERRIDE[String(row.word).toLowerCase()] || row.phonetic;
  if (p) phonetics.set(row.id, p.trim());
}
console.log(`Phiên âm đọc được: ${phonetics.size}`);

// --- Đọc ví dụ ---
const exDir = join(HERE, "oxford-examples");
const examples = new Map();
const badLines = [];
if (existsSync(exDir)) {
  for (const f of readdirSync(exDir).filter((f) => f.endsWith(".txt")).sort()) {
    const text = readFileSync(join(exDir, f), "utf8");
    for (const raw of text.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      const parts = line.split("|");
      if (parts.length !== 3) {
        badLines.push(`${f}: ${line}`);
        continue;
      }
      const [short, en, vi] = parts.map((s) => s.trim());
      if (!short || !en || !vi) {
        badLines.push(`${f}: ${line}`);
        continue;
      }
      const id = `oxford-${short}`;
      if (examples.has(id)) badLines.push(`${f}: TRÙNG id ${short}`);
      examples.set(id, { en, vi });
    }
  }
}
console.log(`Ví dụ đọc được: ${examples.size}` + (badLines.length ? ` — ${badLines.length} DÒNG LỖI` : ""));
badLines.slice(0, 20).forEach((l) => console.log("  LỖI:", l));
if (badLines.length) {
  console.error("Có dòng ví dụ sai định dạng — dừng.");
  process.exit(1);
}

// --- Đọc DB ---
async function loadAll() {
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from("cards").select("*").range(from, from + 999);
    if (error) throw error;
    if (!data || !data.length) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return all;
}

const all = await loadAll();
const cards = all.filter((c) => DECKS.includes(c.deck));
console.log(`DB: ${all.length} thẻ, trong đó ${cards.length} thẻ Oxford.`);

// --- Dựng meaning mới ---
const meaningLine = (raw) => {
  const m = /^Nghĩa:.*$/m.exec(raw || "");
  return m ? m[0].trim() : `Nghĩa: ${String(raw || "").trim()}`;
};
const hasLine = (raw, label) => new RegExp(`^${label}:`, "m").test(raw || "");

const updates = [];
let missPhonetic = 0;
let missExample = 0;
for (const c of cards) {
  const phon = phonetics.get(c.id) || "";
  const ex = examples.get(c.id);
  if (!phon) missPhonetic++;
  if (!ex) missExample++;
  const keepPhon = hasLine(c.meaning, "Phiên âm");
  const keepEx = hasLine(c.meaning, "Ví dụ");
  const lines = [];
  if (keepPhon) lines.push(/^Phiên âm:.*$/m.exec(c.meaning)[0].trim());
  else if (phon) lines.push(`Phiên âm: ${phon}`);
  lines.push(meaningLine(c.meaning));
  if (keepEx) lines.push(/^Ví dụ:.*$/m.exec(c.meaning)[0].trim());
  else if (ex) lines.push(`Ví dụ: "${ex.en}" (${ex.vi})`);
  const meaning = lines.join("\n");
  if (meaning !== c.meaning) updates.push({ ...c, meaning });
}

console.log(`Thiếu phiên âm: ${missPhonetic} · thiếu ví dụ: ${missExample}`);
console.log(`Cần cập nhật: ${updates.length} thẻ.`);
updates.slice(0, 3).forEach((u) => console.log(`--- ${u.id} | ${u.word}\n${u.meaning}`));

if (!APPLY) {
  console.log("\nDRY-RUN — chưa ghi gì. Chạy lại với --apply để ghi thật.");
  process.exit(0);
}
if (!updates.length) {
  console.log("Không có gì để ghi.");
  process.exit(0);
}

const backup = join(HERE, `_backup_cards_${Date.now()}.json`);
writeFileSync(backup, JSON.stringify(all), "utf8");
console.log(`Đã backup ${all.length} thẻ vào ${backup}`);

const CHUNK = 300;
let done = 0;
for (let i = 0; i < updates.length; i += CHUNK) {
  const chunk = updates.slice(i, i + CHUNK);
  const { error } = await supabase.from("cards").upsert(chunk);
  if (error) {
    console.error(`Lỗi ở batch ${i}:`, error);
    process.exit(1);
  }
  done += chunk.length;
  console.log(`  đã ghi ${done}/${updates.length}`);
}
console.log("Xong.");
