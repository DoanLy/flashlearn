import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://qrufhskmxcuowavwokau.supabase.co","sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK");
// 2 thẻ ghi loại từ kiểu "(n)(adj)" thay vì "(n/adj)" như 3000+ thẻ còn lại.
const FIX = { "istqb-ctfl-1752400000-1085": ["(n)(adj)", "(n/adj)"], "istqb-ctfl-1752400000-1066": ["(n)(adj)", "(n/adj)"] };
async function loadAll(){let all=[],from=0;const B=1000;while(true){const{data,error}=await supabase.from("cards").select("*").range(from,from+B-1);if(error)throw error;if(!data||!data.length)break;all=all.concat(data);if(data.length<B)break;from+=B;}return all;}
const apply = process.argv.includes("--apply");
const byId = new Map((await loadAll()).map(c=>[c.id,c]));
const ups = [];
for (const [id,[from,to]] of Object.entries(FIX)) {
  const c = byId.get(id);
  if (!c) { console.log("Không tìm thấy", id); process.exit(1); }
  if (!c.meaning.includes(from)) { console.log(`Thẻ ${id} không còn "${from}"`); process.exit(1); }
  ups.push({ ...c, meaning: c.meaning.replace(from, to) });
  console.log(`${c.word}: ${from} -> ${to}`);
}
if (!apply) { console.log("\n(chạy thử — thêm --apply để ghi thật)"); process.exit(0); }
const { error } = await supabase.from("cards").upsert(ups, { onConflict: "id" });
if (error) throw error;
console.log(`\n✓ ĐÃ GHI ${ups.length} thẻ.`);
