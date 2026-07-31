// Read-only: so sánh parseCardFields CŨ vs MỚI trên toàn bộ dữ liệu thật + kiểm tra round-trip.
// Không ghi gì lên DB.
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// ---- bản CŨ (trước khi sửa) ----
const parseOld = (raw) => {
  const lines = (raw || "").split("\n").map((s) => s.trim()).filter(Boolean);
  let phonetic = "", meaning = "", example = "";
  const rest = [];
  lines.forEach((l) => {
    let m;
    if (!phonetic && (m = l.match(/^(phiên âm|ipa|pron)\s*[:：]\s*(.*)$/i))) phonetic = m[2].trim();
    else if (!meaning && (m = l.match(/^nghĩa(\s*của\s*từ)?\s*[:：]\s*(.*)$/i))) meaning = m[2].trim();
    else if (!example && (m = l.match(/^(ví dụ|example)\s*[:：]\s*(.*)$/i))) example = m[2].trim();
    else if (!phonetic && /^\/[^/]*\/$/.test(l)) phonetic = l;
    else rest.push(l);
  });
  if (!meaning) meaning = rest.shift() || "";
  if (!example && rest.length) example = rest.join(" ");
  return { phonetic, meaning, example };
};

// ---- bản MỚI: lấy thẳng từ src/App.jsx để test đúng code đang chạy ----
const src = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const grab = (name) => {
  const start = src.indexOf(`const ${name} = (`);
  if (start < 0) throw new Error("not found: " + name);
  const end = src.indexOf("\n};", start);
  return src.slice(start, end + 3);
};
const { parseCardFields: parseNew, formatCardMeaning: fmt } = await import(
  "data:text/javascript," +
    encodeURIComponent(
      grab("parseCardFields") + "\n" + grab("formatCardMeaning") +
        "\nexport { parseCardFields, formatCardMeaning };",
    )
);

let all = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase.from("cards").select("id,word,deck,meaning").range(from, from + 999);
  if (error) throw error;
  all = all.concat(data);
  if (data.length < 1000) break;
}
console.log("total cards:", all.length);

let diff = 0, roundtripFail = 0, lossOld = 0;
const samples = [];
for (const c of all) {
  const o = parseOld(c.meaning), n = parseNew(c.meaning);
  if (o.phonetic !== n.phonetic || o.meaning !== n.meaning || o.example !== n.example) {
    diff++;
    if (samples.length < 10) samples.push({ c, o, n });
  }
  // round-trip: parse -> format -> parse phải ra y hệt
  const again = parseNew(fmt(n));
  if (again.phonetic !== n.phonetic || again.meaning !== n.meaning || again.example !== n.example) {
    roundtripFail++;
    if (roundtripFail <= 5) console.log("ROUNDTRIP FAIL", c.deck, c.word, JSON.stringify(c.meaning));
  }
  const normalize = (s) => (s || "").replace(/\s+/g, " ").trim();
  if (normalize(fmt(o)).length < normalize(c.meaning).length - 12) lossOld++;
}
console.log("\nkhác biệt cũ/mới:", diff, "| round-trip fail (mới):", roundtripFail, "| thẻ parser cũ làm mất chữ:", lossOld);
samples.forEach(({ c, o, n }) => {
  console.log("\n---", c.deck, "|", c.word, "\n  raw:", JSON.stringify(c.meaning));
  console.log("  cũ :", JSON.stringify(o));
  console.log("  mới:", JSON.stringify(n));
});

// ---- test case tổng hợp ----
const cases = [
  "Nghĩa: dramatically\nenormously",
  "Phiên âm: /piːk/\nNghĩa: đỉnh cao\nVí dụ: Traffic reaches its peak.",
  "đỉnh cao",
  "Phiên âm: /piːk/\nđỉnh cao\nVí dụ: abc",
  "Nghĩa: a\nb\nVí dụ: c\nd\ne",
  "",
];
console.log("\n=== case tự tạo ===");
for (const t of cases) {
  const n = parseNew(t);
  console.log(JSON.stringify(t), "=>", JSON.stringify(n), "| round-trip ok:", JSON.stringify(parseNew(fmt(n))) === JSON.stringify(n));
}
