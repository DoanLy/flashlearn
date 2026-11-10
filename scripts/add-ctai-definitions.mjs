import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Thêm dòng "Định nghĩa: …" (theo syllabus ISTQB CT-AI) ngay sau dòng
// "Nghĩa:" cho các thẻ là thuật ngữ kiểm thử trong deck "ISTQB CTAI". Từ tiếng Anh
// thông thường giữ nguyên. Dữ liệu ở ctai-definitions.json.
// Chạy lại được nhiều lần: dòng Định nghĩa cũ (nếu có) bị thay, không nhân đôi.
// Dùng: node scripts/add-ctai-definitions.mjs [--dry]

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);
const dry = process.argv.includes("--dry");
const defs = JSON.parse(fs.readFileSync(new URL("./ctai-definitions.json", import.meta.url), "utf8"));

const build = (meaning, d) => {
  const lines = meaning.split("\n").filter((l) => !/^định nghĩa\s*[:：]/i.test(l.trim()));
  const i = lines.findIndex((l) => /^nghĩa\s*[:：]/i.test(l.trim()));
  if (i < 0) throw new Error("không có dòng Nghĩa");
  lines.splice(i, 1, `Nghĩa: ${d.nghia}`, `Định nghĩa: ${d.dinhnghia}`);
  return lines.join("\n");
};

let ok = 0, same = 0;
for (const d of defs) {
  const { data, error } = await supabase.from("cards").select("id,word,meaning,deck").eq("id", d.id).single();
  if (error) throw error;
  if (data.deck !== "ISTQB CTAI" || data.word !== d.word) throw new Error(`lệch: ${d.id} ${data.word}`);
  const next = build(data.meaning, d);
  if (next === data.meaning) { same++; continue; }
  if (!dry) {
    const { error: e } = await supabase.from("cards").update({ meaning: next }).eq("id", d.id);
    if (e) throw e;
  }
  ok++;
}
console.log(`${dry ? "[dry] " : ""}cập nhật ${ok}, đã đúng sẵn ${same}, tổng ${defs.length}`);
process.exit(0);
