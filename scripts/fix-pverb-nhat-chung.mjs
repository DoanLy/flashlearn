import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// P Verb: mặt sau đã có "nghĩa - Ví dụ: English. (Tiếng Việt.)" -> chỉ cần thêm phiên âm.
// Câu ví dụ và bản dịch GIỮ NGUYÊN của người dùng, không viết lại.
const PVERB_IPA = {
  "take over": "/teɪk ˈəʊvə/",
  "take after": "/teɪk ˈɑːftə/",
  "take up sth": "/teɪk ˈʌp/",
  "take off": "/teɪk ˈɒf/",
  "look after sth/sb": "/lʊk ˈɑːftə/",
  "look forward to": "/lʊk ˈfɔːwəd tə/",
  "look up to sb": "/lʊk ˈʌp tə/",
  "look for": "/lʊk fə/",
  "come across sb/sth": "/kʌm əˈkrɒs/",
  "break out": "/breɪk ˈaʊt/",
  "account for": "/əˈkaʊnt fə/",
  "break down": "/breɪk ˈdaʊn/",
  "carry out": "/ˈkæri ˈaʊt/",
  "catch up with": "/kætʃ ˈʌp wɪð/",
  "close down": "/kləʊz ˈdaʊn/",
  "come up": "/kʌm ˈʌp/",
  "cut down on": "/kʌt ˈdaʊn ɒn/",
  "get down": "/ɡet ˈdaʊn/",
  "get on with": "/ɡet ˈɒn wɪð/",
  "get over": "/ɡet ˈəʊvə/",
};

// Nhặt + Chung: trơ trụi, soạn phiên âm + ví dụ mới. Nghĩa tiếng Việt giữ nguyên.
const BARE = {
  Citizen: ["n", "/ˈsɪtɪzn/", "Every citizen has the right to vote.", "Mọi công dân đều có quyền bầu cử."],
  measurement: ["n", "/ˈmeʒəmənt/", "Accurate measurement is essential in science.", "Sự đo lường chính xác là điều thiết yếu trong khoa học."],
  intelligence: ["n", "/ɪnˈtelɪdʒəns/", "Dolphins are known for their intelligence.", "Cá heo nổi tiếng nhờ sự thông minh của chúng."],
  Degree: ["n", "/dɪˈɡriː/", "She earned a degree in computer science.", "Cô ấy đã lấy bằng cấp ngành khoa học máy tính."],
  struggle: ["n", "/ˈstrʌɡl/", "Their struggle for independence lasted ten years.", "Cuộc chiến đấu giành độc lập của họ kéo dài mười năm."],
};

// "nghĩa - Ví dụ: English sentence. (Bản dịch.)"
const PV_SPLIT = /\s+-\s+Ví dụ:\s*/i;

async function loadAll() {
  let all = [], from = 0;
  while (true) {
    const { data, error } = await supabase.from("cards").select("*").range(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return all;
}

async function run() {
  const all = await loadAll();
  console.log(`Đã nạp ${all.length} thẻ.`);
  const updates = [], problems = [];

  // --- P Verb ---
  for (const c of all.filter((c) => c.deck === "P Verb")) {
    const ipa = PVERB_IPA[c.word];
    if (!ipa) { problems.push(`P Verb chưa có phiên âm: ${c.word}`); continue; }
    const parts = c.meaning.split(PV_SPLIT);
    if (parts.length < 2) { problems.push(`P Verb không tách được ví dụ: ${c.word}`); continue; }
    const vi = parts[0].trim();
    const rest = parts[1].trim();
    // "English sentence. (Bản dịch.)"
    const m = rest.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
    if (!m) { problems.push(`P Verb không tách được bản dịch: ${c.word}`); continue; }
    updates.push({
      id: c.id,
      word: c.word,
      meaning: [
        `Phiên âm: (phr v) ${ipa}`,
        `Nghĩa: ${vi}`,
        `Ví dụ: "${m[1].trim()}" (${m[2].trim()})`,
      ].join("\n"),
      deck: c.deck,
      status: c.status,
    });
  }

  // --- Nhặt + Chung ---
  for (const c of all.filter((c) => c.deck === "Nhặt" || c.deck === "Chung")) {
    const b = BARE[c.word];
    if (!b) { problems.push(`${c.deck} chưa soạn: ${c.word}`); continue; }
    const [pos, ipa, exEn, exVi] = b;
    updates.push({
      id: c.id,
      word: c.word,
      meaning: [
        `Phiên âm: (${pos}) ${ipa}`,
        `Nghĩa: ${c.meaning.trim()}`,
        `Ví dụ: "${exEn}" (${exVi})`,
      ].join("\n"),
      deck: c.deck,
      status: c.status,
    });
  }

  console.log(`Sẽ sửa: ${updates.length} thẻ (P Verb 20 + Nhặt 4 + Chung 1 = 25)`);
  if (problems.length) { console.log("VẤN ĐỀ:"); problems.forEach((p) => console.log("   -", p)); }

  console.log("\n--- XEM TRƯỚC ---");
  updates.slice(0, 2).forEach((u) => { console.log("MẶT TRƯỚC: " + u.word); console.log(u.meaning); console.log("---"); });

  if (!process.argv.includes("--apply")) { console.log("\n(chạy thử — thêm --apply để ghi thật)"); return; }
  if (problems.length) { console.log("\nDỪNG: còn vấn đề."); process.exit(1); }

  const { error } = await supabase.from("cards").upsert(updates, { onConflict: "id" });
  if (error) throw error;
  console.log(`\n✓ ĐÃ GHI ${updates.length} thẻ.`);
}

run().catch((e) => { console.error("Lỗi:", e.message); process.exit(1); });
