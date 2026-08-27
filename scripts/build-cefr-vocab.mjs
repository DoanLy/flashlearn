// Dựng src/data/cefr-vocab.json — bảng tra CEFR + nghĩa Việt + phiên âm dùng OFFLINE trong app.
//
// Mục đích: panel "Từ vựng cần biết" của Chép chính tả phải chấm được độ khó từng từ trong
// transcript ngay lập tức, không chờ mạng. Nguồn:
//   - scripts/oxford-a1-b2.json    → word, level (A1/A2/B1/B2), vi (nghĩa tiếng Việt)
//   - scripts/oxford-phonetics.json → phiên âm IPA Anh-Anh theo từ
//
// Định dạng đầu ra cố tình nén chặt (mỗi từ là 1 chuỗi "level|vi|ipa") để bundle nhẹ:
//   { "abandon": "B2|bỏ rơi, từ bỏ|/əˈbændən/" }
//
// Chạy lại khi bộ từ Oxford thay đổi:  node scripts/build-cefr-vocab.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => JSON.parse(readFileSync(resolve(here, p), "utf8"));

const LEVELS = ["A1", "A2", "B1", "B2"];

const words = read("oxford-a1-b2.json");
const phonetics = read("oxford-phonetics.json");

// Một từ có thể xuất hiện nhiều lần với từ loại khác nhau (vd "book" n. A1 / v. A2).
// Giữ level THẤP NHẤT: nếu người học đã biết nghĩa dễ thì không cần đưa vào danh sách ôn.
const ipaByWord = new Map();
for (const p of phonetics) {
  const w = String(p.word || "").toLowerCase().trim();
  if (!w || !p.phonetic) continue;
  if (!ipaByWord.has(w)) ipaByWord.set(w, p.phonetic);
}

const best = new Map();
for (const entry of words) {
  const w = String(entry.word || "").toLowerCase().trim();
  if (!w) continue;
  const prev = best.get(w);
  if (prev && LEVELS.indexOf(prev.level) <= LEVELS.indexOf(entry.level)) continue;
  best.set(w, entry);
}

const out = {};
for (const [w, entry] of [...best.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
  const vi = String(entry.vi || "").replace(/\|/g, "/").trim();
  const ipa = (ipaByWord.get(w) || "").trim();
  out[w] = `${entry.level}|${vi}|${ipa}`;
}

const target = resolve(here, "../src/data/cefr-vocab.json");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(out), "utf8");

const counts = {};
for (const v of Object.values(out)) counts[v.split("|")[0]] = (counts[v.split("|")[0]] || 0) + 1;
console.log(`Đã ghi ${Object.keys(out).length} từ vào src/data/cefr-vocab.json`, counts);
console.log(`Có phiên âm: ${Object.values(out).filter((v) => v.split("|")[2]).length}`);
