import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// 3 thẻ tiêu đề mục lục lạc vào bộ từ vựng, không phải từ để học.
const DELETE_IDS = [
  "1784138192969-0", // CHỦ ĐỀ 1 -> GIÁO DỤC & DU HỌC
  "1784138192969-19", // CHỦ ĐỀ 2 -> TỰ NHIÊN & MÔI TRƯỜNG
  "1784138192969-53", // CHỦ ĐỀ 3 -> THỂ THAO & GIẢI TRÍ
];

// Thẻ duy nhất bị ngược: câu tiếng Việt nằm ở mặt trước. Đảo lại và sửa lỗi gõ
// ("giữữa" -> "giữa", "nhom" -> "nhóm", "member" -> "members").
const FLIP = {
  id: "1778047086890",
  word: "Effective communication is crucial for coordinating testing activities among team members",
  meaning: [
    "Phiên âm: (phr) /ɪˈfektɪv kəˌmjuːnɪˈkeɪʃn ɪz ˈkruːʃl fɔː kəʊˈɔːdɪneɪtɪŋ ˈtestɪŋ ækˈtɪvətiz əˈmʌŋ tiːm ˈmembəz/",
    "Nghĩa: Giao tiếp hiệu quả rất quan trọng cho việc điều phối hoạt động kiểm thử giữa các thành viên trong nhóm",
    'Ví dụ: "Effective communication is crucial for coordinating testing activities among team members." (Giao tiếp hiệu quả rất quan trọng để điều phối hoạt động kiểm thử giữa các thành viên trong nhóm.)',
  ].join("\n"),
};

// 14 thẻ IELTS: mặt trước dính tag loại từ, mặt sau ở định dạng cũ
// "nghĩa (/phiên âm/). Ví dụ - câu".  Chuyển sang đúng chuẩn của 2891 thẻ ISTQB.
// Giữ nguyên câu ví dụ tiếng Anh gốc; phần dịch tiếng Việt do tôi soạn.
const IELTS = [
  { id: null, old: "effort (n)", word: "effort", pos: "n", exVi: "Chúng ta cần nỗ lực để bảo vệ đại dương." },
  { id: null, old: "negative (adj)", word: "negative", pos: "adj", exVi: "Rác thải nhựa gây tác động tiêu cực lên sinh vật biển." },
  { id: null, old: "renewable (adj)", word: "renewable", pos: "adj", exVi: "Mặt trời và gió là những nguồn năng lượng tái tạo tuyệt vời." },
  { id: null, old: "individual (n)", word: "individual", pos: "n", exVi: "Mỗi cá nhân đều có thể góp phần cứu lấy hành tinh." },
  { id: null, old: "Surf the internet (phr)", word: "Surf the internet", pos: "phr", exVi: "Tôi thường lướt mạng để tìm công thức nấu ăn trước khi vào bếp." },
  { id: null, old: "Access (to something) (n/v)", word: "Access (to something)", pos: "n/v", exVi: "Sinh viên có thể dễ dàng truy cập thư viện trường qua mạng." },
  { id: null, old: "Stay connected (phr)", word: "Stay connected", pos: "phr", exVi: "Mạng xã hội giúp chúng ta giữ liên lạc với người thân ở nước ngoài." },
  { id: null, old: "Social media platform (phr)", word: "Social media platform", pos: "phr", exVi: "Instagram là nền tảng mạng xã hội tôi thích nhất để chia sẻ ảnh." },
  { id: null, old: "Online courses (phr)", word: "Online courses", pos: "phr", exVi: "Học các khóa trực tuyến cho phép tôi học theo nhịp của mình." },
  { id: null, old: "Keep abreast of (phr)", word: "Keep abreast of", pos: "phr", exVi: "Cập nhật tin tức mới nhất là điều quan trọng." },
  { id: null, old: "Online games (phr)", word: "Online games", pos: "phr", exVi: "Chơi game trực tuyến giúp tôi thư giãn sau giờ làm." },
  { id: null, old: "Chat with friends (phr)", word: "Chat with friends", pos: "phr", exVi: "Mỗi tối tôi dành một tiếng để trò chuyện với bạn bè." },
  { id: null, old: "Search for something (phr)", word: "Search for something", pos: "phr", exVi: "Bạn có thể tìm tài liệu học trên mạng." },
  { id: null, old: "Upload/ download (v)", word: "Upload / download", pos: "v", exVi: "Chỉ mất vài giây để tải xuống một video dung lượng lớn." },
];

// Tách "nghĩa (/phiên âm/). Ví dụ - câu"  ->  { vi, ipa, exEn }
function parseOld(meaning) {
  const exSplit = meaning.split(/\.\s*Ví dụ\s*[-:]\s*/i);
  const head = exSplit[0];
  const exEn = (exSplit[1] || "").trim().replace(/^"|"$/g, "");
  const ipaMatch = head.match(/\((\/[^)]*\/)\)\s*$/);
  const ipa = ipaMatch ? ipaMatch[1].trim() : null;
  const vi = head.replace(/\s*\((\/[^)]*\/)\)\s*$/, "").trim();
  return { vi, ipa, exEn };
}

// Supabase chỉ trả tối đa 1000 dòng mỗi lần -> phải lấy theo từng batch
async function loadAll() {
  let all = [];
  let from = 0;
  const BATCH = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .range(from, from + BATCH - 1);
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
  const byWord = new Map(cards.map((c) => [c.word, c]));

  // --- 1. Đảo thẻ bị ngược ---
  const flipCard = cards.find((c) => c.id === FLIP.id);
  const flipUpdate = flipCard
    ? [{ id: FLIP.id, word: FLIP.word, meaning: FLIP.meaning, deck: flipCard.deck, status: flipCard.status }]
    : [];
  console.log(flipCard ? "Thẻ ngược: sẽ đảo lại 1 thẻ." : "Thẻ ngược: KHÔNG tìm thấy!");

  // --- 2. Chuẩn hóa 14 thẻ IELTS ---
  const updates = [];
  const problems = [];
  for (const it of IELTS) {
    const c = byWord.get(it.old);
    if (!c) { problems.push(`Không tìm thấy: ${it.old}`); continue; }
    const { vi, ipa, exEn } = parseOld(c.meaning);
    if (!ipa) { problems.push(`Không tách được phiên âm: ${it.old}`); continue; }
    if (!exEn) { problems.push(`Không tách được ví dụ: ${it.old}`); continue; }
    updates.push({
      id: c.id,
      word: it.word,
      meaning: [
        `Phiên âm: (${it.pos}) ${ipa}`,
        `Nghĩa: ${vi}`,
        `Ví dụ: "${exEn}" (${it.exVi})`,
      ].join("\n"),
      deck: c.deck,
      status: c.status,
    });
  }
  console.log(`IELTS: chuẩn hóa ${updates.length}/${IELTS.length} thẻ.`);
  if (problems.length) { console.log("VẤN ĐỀ:"); problems.forEach((p) => console.log("   -", p)); }

  // --- 3. Xóa thẻ tiêu đề ---
  const toDelete = cards.filter((c) => DELETE_IDS.includes(c.id));
  console.log(`Xóa: ${toDelete.length} thẻ tiêu đề ->`, toDelete.map((c) => c.word).join(", "));

  console.log("\n--- XEM TRƯỚC ---");
  [...flipUpdate, ...updates].slice(0, 3).forEach((u) => {
    console.log("MẶT TRƯỚC: " + u.word);
    console.log(u.meaning);
    console.log("---");
  });

  if (!apply) { console.log("\n(chạy thử — thêm --apply để ghi thật)"); return; }
  if (problems.length) { console.log("\nDỪNG: còn vấn đề chưa xử lý, không ghi."); process.exit(1); }

  const all = [...flipUpdate, ...updates];
  const { error: e1 } = await supabase.from("cards").upsert(all, { onConflict: "id" });
  if (e1) throw e1;
  const { error: e2 } = await supabase.from("cards").delete().in("id", DELETE_IDS);
  if (e2) throw e2;
  console.log(`\n✓ ĐÃ GHI ${all.length} thẻ, XÓA ${toDelete.length} thẻ.`);
}

run().catch((e) => { console.error("Lỗi:", e.message); process.exit(1); });
