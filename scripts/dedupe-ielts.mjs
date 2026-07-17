import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// Deck IELTS có 4 từ bị lặp 2 thẻ. Giữ 1 thẻ mỗi từ.
// Nguyên tắc chọn thẻ giữ lại: ưu tiên thẻ đã học thuộc (status "known"), để việc
// xóa không đẩy từ đó trở lại hàng đợi học. "contaminant" cả 2 thẻ đều chưa thuộc
// nên giữ thẻ có nghĩa đầy đủ hơn.
const PLAN = [
  { word: "Meditate",    keep: "1781706271934-3",   drop: "1781705929548-4",   why: "2 thẻ giống hệt nhau; giữ thẻ đã thuộc" },
  { word: "Artifact",    keep: "1781706271934-5",   drop: "1781705929549-127", why: "giữ thẻ đã thuộc (ví dụ cung điện Huế)" },
  { word: "Cut down on", keep: "1781705929549-156", drop: "1781705929548-13",  why: "giữ thẻ đã thuộc (ví dụ đồ ăn vặt)" },
  { word: "Contaminant", keep: "1781705929549-52",  drop: "1781705929549-66",  why: "cả 2 đều chưa thuộc; giữ thẻ có nghĩa đầy đủ hơn" },
];

// Thẻ "Cut down on" giữ lại đang ghi nghĩa "Giảm thiểu"; thẻ bị xóa ghi "cắt giảm"
// sát nghĩa hơn -> gộp lại để không mất phần tốt của thẻ bị xóa.
const MERGE = {
  "1781705929549-156": { from: "Nghĩa: Giảm thiểu", to: "Nghĩa: cắt giảm, giảm bớt" },
};

async function loadAll() {
  let all = [], from = 0;
  const BATCH = 1000;
  while (true) {
    const { data, error } = await supabase.from("cards").select("*").range(from, from + BATCH - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < BATCH) break;
    from += BATCH;
  }
  return all;
}

async function run() {
  const apply = process.argv.includes("--apply");
  const cards = await loadAll();
  const byId = new Map(cards.map((c) => [c.id, c]));
  const problems = [];

  for (const p of PLAN) {
    const keep = byId.get(p.keep), drop = byId.get(p.drop);
    if (!keep) { problems.push(`Không tìm thấy thẻ giữ lại ${p.keep} (${p.word})`); continue; }
    if (!drop) { problems.push(`Không tìm thấy thẻ cần xóa ${p.drop} (${p.word})`); continue; }
    if (keep.deck !== "IELTS" || drop.deck !== "IELTS") problems.push(`${p.word}: có thẻ không thuộc deck IELTS!`);
    if (keep.word.trim().toLowerCase() !== drop.word.trim().toLowerCase()) problems.push(`${p.word}: 2 thẻ không cùng từ!`);
    console.log(`${p.word}: giữ ${p.keep} [${keep.status}] — xóa ${p.drop} [${drop.status}]  (${p.why})`);
  }

  // Gộp nghĩa
  const updates = [];
  for (const [id, m] of Object.entries(MERGE)) {
    const c = byId.get(id);
    if (!c) { problems.push(`Không tìm thấy thẻ cần gộp nghĩa: ${id}`); continue; }
    if (!c.meaning.includes(m.from)) { problems.push(`Thẻ ${id} không còn dòng "${m.from}" để gộp`); continue; }
    updates.push({ ...c, meaning: c.meaning.replace(m.from, m.to) });
    console.log(`\nGộp nghĩa ${id}: "${m.from}" -> "${m.to}"`);
  }

  const dropIds = PLAN.map((p) => p.drop);
  console.log(`\nTổng: xóa ${dropIds.length} thẻ, sửa nghĩa ${updates.length} thẻ.`);
  if (problems.length) { console.log("VẤN ĐỀ:"); problems.forEach((p) => console.log("   -", p)); }

  if (!apply) { console.log("\n(chạy thử — thêm --apply để ghi thật)"); return; }
  if (problems.length) { console.log("\nDỪNG: còn vấn đề chưa xử lý, không ghi."); process.exit(1); }

  if (updates.length) {
    const { error } = await supabase.from("cards").upsert(updates, { onConflict: "id" });
    if (error) throw error;
  }
  const { error } = await supabase.from("cards").delete().in("id", dropIds);
  if (error) throw error;
  console.log(`\n✓ ĐÃ XÓA ${dropIds.length} thẻ, SỬA ${updates.length} thẻ.`);
}

run().catch((e) => { console.error("Lỗi:", e.message); process.exit(1); });
