import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Thêm dòng "Định nghĩa: …" cho các thuật ngữ trong chủ đề "Giao tiếp Testing" còn thiếu
// định nghĩa (gtt-definitions.json, key = word). Ghi vào cả bản sao (id gtt-…) lẫn thẻ gốc
// trong ISTQB CTFL/CTAI, để chạy lại create-giao-tiep-testing.mjs không làm mất định nghĩa.
// Chỉ đổi cột meaning, giữ nguyên dòng Nghĩa/Phiên âm/Ví dụ và status. Idempotent, có --dry.

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);
const dry = process.argv.includes("--dry");
const defs = JSON.parse(fs.readFileSync(new URL("./gtt-definitions.json", import.meta.url), "utf8"));

const withDef = (meaning, def) => {
  const lines = meaning.split("\n").filter((l) => !/^định nghĩa\s*[:：]/i.test(l.trim()));
  const i = lines.findIndex((l) => /^nghĩa\s*[:：]/i.test(l.trim()));
  if (i < 0) throw new Error("không có dòng Nghĩa");
  lines.splice(i + 1, 0, `Định nghĩa: ${def}`);
  return lines.join("\n");
};

const { data: copies, error } = await supabase.from("cards").select("id,word,meaning").eq("deck", "Giao tiếp Testing");
if (error) throw error;
let changed = 0;
for (const [word, def] of Object.entries(defs)) {
  const copy = copies.filter((c) => c.word === word);
  if (copy.length !== 1) throw new Error(`không tìm thấy đúng 1 thẻ: ${word}`);
  const srcId = copy[0].id.replace(/^gtt-/, "");
  const { data: src, error: e1 } = await supabase.from("cards").select("id,word,meaning").eq("id", srcId).single();
  if (e1 || src.word !== word) throw new Error(`thẻ gốc lệch: ${word}`);
  for (const c of [copy[0], src]) {
    const next = withDef(c.meaning, def);
    if (next === c.meaning) continue;
    changed++;
    if (!dry) {
      const { error: e2 } = await supabase.from("cards").update({ meaning: next }).eq("id", c.id);
      if (e2) throw e2;
    }
  }
}
console.log(`${dry ? "[dry] " : ""}${Object.keys(defs).length} từ, cập nhật ${changed} thẻ`);
process.exit(0);
