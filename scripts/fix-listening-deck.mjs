import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// Phiên âm + dịch câu ví dụ, soạn tay theo đúng chuẩn của 2891 thẻ ISTQB.
// Câu ví dụ tiếng Anh giữ NGUYÊN từ dữ liệu cũ, chỉ chuyển từ mặt trước sang mặt sau.
const FIX = {
  liquid: { pos: "n", ipa: "/ˈlɪkwɪd/", exVi: "Rót chất lỏng vào bát thật chậm." },
  "Blackberry Crumble": { pos: "n phr", ipa: "/ˈblækbəri ˈkrʌmbl/", exVi: "Tối nay tôi sẽ làm món bánh vụn mâm xôi đen thật ngon." },
  straight: { pos: "adv", ipa: "/streɪt/", exVi: "Cho hỗn hợp thẳng vào lò luôn." },
  peel: { pos: "v", ipa: "/piːl/", exVi: "Gọt vỏ táo trước khi cắt lát." },
  slices: { pos: "n", ipa: "/ˈslaɪsɪz/", exVi: "Cắt bánh thành những lát mỏng." },
  "a baking dish": { pos: "n phr", ipa: "/ə ˈbeɪkɪŋ dɪʃ/", exVi: "Thoa một chút bơ lên khay nướng." },
  "tiny pieces": { pos: "n phr", ipa: "/ˈtaɪni ˈpiːsɪz/", exVi: "Cắt bơ lạnh thành những miếng nhỏ." },
  breadcrumbs: { pos: "n", ipa: "/ˈbredkrʌmz/", exVi: "Phủ vụn bánh mì lên gà trước khi chiên." },
  bake: { pos: "v", ipa: "/beɪk/", exVi: "Nướng bánh ở 180°C trong 30 phút." },
  "in deep fat": { pos: "prep phr", ipa: "/ɪn diːp fæt/", exVi: "Khoai tây có thể chiên ngập dầu để làm khoai chiên." },
  greasy: { pos: "adj", ipa: "/ˈɡriːsi/", exVi: "Nếu bạn dùng quá nhiều dầu, món ăn sẽ bị ngấy mỡ." },
  cereal: { pos: "n", ipa: "/ˈsɪəriəl/", exVi: "Tôi thường ăn một bát ngũ cốc cho bữa sáng." },
  "Rub the flour": { pos: "v phr", ipa: "/rʌb ðə ˈflaʊə/", exVi: "Xoa bột với bơ cho tới khi hỗn hợp trông như vụn bánh mì." },
  mixture: { pos: "n", ipa: "/ˈmɪkstʃə/", exVi: "Khuấy hỗn hợp cho tới khi quyện đều." },
  smooth: { pos: "adj", ipa: "/smuːð/", exVi: "Đánh trứng với sữa cho tới khi bột mịn." },
  "thick consistency": { pos: "n phr", ipa: "/θɪk kənˈsɪstənsi/", exVi: "Nấu sốt cho tới khi đạt độ sệt." },
  "Make sure you stir all the time": { pos: "phr", ipa: "/meɪk ʃɔː juː stɜː ɔːl ðə taɪm/", exVi: "Khi đun sữa, nhớ khuấy liên tục để không bị khét." },
  "greasing it lightly": { pos: "v phr", ipa: "/ˈɡriːsɪŋ ɪt ˈlaɪtli/", exVi: "Chuẩn bị khuôn nướng bằng cách thoa nhẹ một lớp dầu." },
  "When the butter's melted": { pos: "phr", ipa: "/wen ðə ˈbʌtəz ˈmeltɪd/", exVi: "Khi bơ đã tan chảy, cho bột vào để làm sốt." },
  pour: { pos: "v", ipa: "/pɔː/", exVi: "Rưới sốt lên mì đã nấu chín." },
  spoonful: { pos: "n", ipa: "/ˈspuːnfʊl/", exVi: "Thêm một thìa đường vào trà." },
  Serve: { pos: "v", ipa: "/sɜːv/", exVi: "Dọn món bánh vụn ra khi còn ấm, kèm một viên kem vani." },
};

const SPLIT = /\s*\.\s*ví dụ\s*-\s*/i;

async function run() {
  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .eq("deck", "Listening");
  if (error) throw error;

  const updates = [];
  const skipped = [];

  for (const c of cards) {
    if (!SPLIT.test(c.word)) {
      skipped.push({ word: c.word, why: "không theo khuôn '. ví dụ -'" });
      continue;
    }
    const [rawWord, example] = c.word.split(SPLIT);
    const word = rawWord.trim();
    const fix = FIX[word];
    if (!fix) {
      skipped.push({ word, why: "chưa soạn phiên âm" });
      continue;
    }
    const exEn = example.trim().replace(/^"|"$/g, "");
    const meaning = [
      `Phiên âm: (${fix.pos}) ${fix.ipa}`,
      `Nghĩa: ${c.meaning.trim()}`,
      `Ví dụ: "${exEn}" (${fix.exVi})`,
    ].join("\n");
    updates.push({ id: c.id, word, meaning, deck: c.deck, status: c.status });
  }

  console.log(`Sẽ sửa ${updates.length}/${cards.length} thẻ.`);
  if (skipped.length) {
    console.log("BỎ QUA:");
    skipped.forEach((s) => console.log("   -", s.word, "|", s.why));
  }

  console.log("\n--- XEM TRƯỚC 3 THẺ ---");
  updates.slice(0, 3).forEach((u) => {
    console.log("MẶT TRƯỚC: " + u.word);
    console.log(u.meaning);
    console.log("---");
  });

  if (process.argv.includes("--apply")) {
    const { error: e2 } = await supabase
      .from("cards")
      .upsert(updates, { onConflict: "id" });
    if (e2) throw e2;
    console.log(`\n✓ ĐÃ GHI ${updates.length} thẻ lên Supabase.`);
  } else {
    console.log("\n(chạy thử — thêm --apply để ghi thật)");
  }
}

run().catch((e) => {
  console.error("Lỗi:", e.message);
  process.exit(1);
});
