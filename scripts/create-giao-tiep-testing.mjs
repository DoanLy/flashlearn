import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// v1.30.0: tạo chủ đề "Giao tiếp Testing" gồm các từ hay dùng khi giao tiếp trong công việc
// testing, lọc từ 2 deck ISTQB CTFL và ISTQB CTAI (danh sách id ở giao-tiep-testing-ids.json,
// chia theo nhóm tình huống). Thẻ được SAO CHÉP (word + meaning + status), thẻ gốc giữ nguyên.
// id thẻ mới = "gtt-" + id gốc, upsert nên chạy lại không nhân đôi (meaning lấy lại từ thẻ gốc).
// Dùng: node scripts/create-giao-tiep-testing.mjs [--dry]

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);
const DECK = "Giao tiếp Testing";
const dry = process.argv.includes("--dry");
const groups = JSON.parse(fs.readFileSync(new URL("./giao-tiep-testing-ids.json", import.meta.url), "utf8"));

const rows = [];
const seen = new Set();
for (const [srcDeck, byGroup] of Object.entries(groups)) {
  const ids = Object.values(byGroup).flat();
  const { data, error } = await supabase.from("cards").select("id,word,meaning,deck,status").in("id", ids);
  if (error) throw error;
  const byId = Object.fromEntries(data.map((c) => [c.id, c]));
  for (const id of ids) {
    const c = byId[id];
    if (!c || c.deck !== srcDeck) throw new Error(`không thấy thẻ ${id} trong ${srcDeck}`);
    const key = c.word.trim().toLowerCase();
    if (seen.has(key)) throw new Error(`trùng từ: ${c.word}`);
    seen.add(key);
    rows.push({ id: `gtt-${c.id}`, word: c.word, meaning: c.meaning, deck: DECK, status: c.status });
  }
}
if (!dry) {
  const { error } = await supabase.from("cards").upsert(rows, { onConflict: "id" });
  if (error) throw error;
}
const { count } = await supabase.from("cards").select("id", { count: "exact", head: true }).eq("deck", DECK);
console.log(`${dry ? "[dry] " : ""}${rows.length} thẻ; deck "${DECK}" hiện có ${count}`);
process.exit(0);
