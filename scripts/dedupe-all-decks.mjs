import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// Gộp các thẻ trùng từ trong cùng một deck xuống còn 1 thẻ mỗi từ.
//
// LƯU Ý: khác đợt dedupe deck IELTS, ở đây KHÔNG có thẻ nào là bản sao thật sự —
// 418/418 nhóm đều khác nhau ở câu ví dụ hoặc cách diễn đạt nghĩa. Việc xóa vì vậy
// làm mất 551 câu ví dụ riêng. Người dùng đã chọn phương án này sau khi được thông
// báo rõ đánh đổi đó; backup toàn bảng nằm ở backups/ để khôi phục nếu cần.
//
// Thẻ giữ lại = thẻ chất lượng cao nhất nhóm (ưu tiên: đúng chuẩn 3 dòng > có phiên
// âm > có ví dụ > nghĩa dài hơn > id nhỏ hơn cho ổn định).
// Trạng thái học được chuyển sang thẻ giữ lại: nếu trong nhóm có thẻ đã thuộc thì
// thẻ giữ lại thành "known" — để việc xóa không đẩy từ đã thuộc về lại hàng đợi học.

const isStd = (m) => /^Phiên âm:/m.test(m || "") && /^Nghĩa:/m.test(m || "") && /^Ví dụ:/m.test(m || "");
const hasIpa = (m) => /\/[^/]+\//.test(m || "");
const hasEx = (m) => /Ví dụ/i.test(m || "");
const norm = (s) => (s || "").trim().toLowerCase();

// Thẻ nào "tốt" hơn: trả về < 0 nếu a tốt hơn b
function betterFirst(a, b) {
  const rank = (c) => [isStd(c.meaning) ? 0 : 1, hasIpa(c.meaning) ? 0 : 1, hasEx(c.meaning) ? 0 : 1, -(c.meaning || "").length];
  const ra = rank(a), rb = rank(b);
  for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] - rb[i];
  return String(a.id).localeCompare(String(b.id));
}

// Trạng thái học giữ lại cho cả nhóm: đã thuộc > chưa thuộc > chưa học
function mergeStatus(list) {
  if (list.some((c) => c.status === "known")) return "known";
  if (list.some((c) => c.status === "unknown")) return "unknown";
  return "new";
}

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
  console.log(`Đã nạp ${cards.length} thẻ.`);

  const groups = {};
  for (const c of cards) (groups[c.deck + "|" + norm(c.word)] ||= []).push(c);
  const dups = Object.entries(groups).filter(([, v]) => v.length > 1);

  const dropIds = [];
  const statusUpdates = [];
  const report = [];
  for (const [key, list] of dups) {
    const sorted = [...list].sort(betterFirst);
    const keep = sorted[0];
    const drop = sorted.slice(1);
    const st = mergeStatus(list);
    dropIds.push(...drop.map((c) => c.id));
    if (keep.status !== st) statusUpdates.push({ ...keep, status: st });
    report.push({ key, keep: keep.id, keepStatus: st, statusMoved: keep.status !== st, drop: drop.map((c) => c.id) });
  }

  console.log(`Nhóm trùng: ${dups.length} | thẻ sẽ xóa: ${dropIds.length} | thẻ được chuyển trạng thái đã-thuộc: ${statusUpdates.length}`);
  console.log(`Còn lại sau khi dọn: ${cards.length - dropIds.length} thẻ.`);

  const byDeck = {};
  for (const r of report) { const d = r.key.split("|")[0]; byDeck[d] = (byDeck[d] || 0) + r.drop.length; }
  console.log("\nXóa theo deck:");
  Object.entries(byDeck).sort((a, b) => b[1] - a[1]).forEach(([d, n]) => console.log(String(n).padStart(5), d));

  if (new Set(dropIds).size !== dropIds.length) { console.log("DỪNG: danh sách xóa có id lặp."); process.exit(1); }
  const keepIds = new Set(report.map((r) => r.keep));
  if (dropIds.some((id) => keepIds.has(id))) { console.log("DỪNG: có id vừa bị xóa vừa được giữ!"); process.exit(1); }

  console.log("\nCác nhóm được chuyển trạng thái đã-thuộc sang thẻ giữ lại:");
  report.filter((r) => r.statusMoved).forEach((r) => console.log(`   ${r.key} -> giữ ${r.keep} (${r.keepStatus})`));

  fs.writeFileSync("scripts/_tmp-dedupe-plan.json", JSON.stringify(report, null, 2));

  if (!apply) { console.log("\n(chạy thử — thêm --apply để ghi thật)"); return; }

  if (statusUpdates.length) {
    const { error } = await supabase.from("cards").upsert(statusUpdates, { onConflict: "id" });
    if (error) throw error;
    console.log(`\nĐã cập nhật trạng thái ${statusUpdates.length} thẻ.`);
  }
  for (let i = 0; i < dropIds.length; i += 100) {
    const chunk = dropIds.slice(i, i + 100);
    const { error } = await supabase.from("cards").delete().in("id", chunk);
    if (error) throw error;
    console.log(`   đã xóa ${Math.min(i + 100, dropIds.length)}/${dropIds.length}`);
  }
  console.log(`\n✓ ĐÃ XÓA ${dropIds.length} thẻ.`);
}

run().catch((e) => { console.error("Lỗi:", e.message); process.exit(1); });
