import { createClient } from "@supabase/supabase-js";

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzSdEuvkL9I_zSN8SeCm71gm4LXEd9uzKXkrNz_9vBscVvvfyZwXNsCdxe4jpLDEdAo/exec";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

async function migrate() {
  console.log("Đang tải dữ liệu từ Google Sheets...");

  const response = await fetch(SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "load" }),
    redirect: "follow",
  });

  const result = await response.json();

  if (result.status !== "success" || !result.cards) {
    console.error("Lỗi khi tải từ Google Sheets:", result);
    process.exit(1);
  }

  const cards = result.cards
    .map((c) => ({
      id: String(c.id || ""),
      word: String(c.word || "").replace(/^'/, ""),
      meaning: String(c.meaning || "").replace(/^'/, ""),
      deck: String(c.deck || "Chung").replace(/^'/, ""),
      status: String(c.status || "new"),
    }))
    .filter((c) => c.id && c.word);

  console.log(`Tìm thấy ${cards.length} từ vựng.`);

  if (cards.length === 0) {
    console.log("Không có dữ liệu để migrate.");
    return;
  }

  console.log("Đang insert vào Supabase...");
  const { error } = await supabase
    .from("cards")
    .upsert(cards, { onConflict: "id" });

  if (error) {
    console.error("Lỗi khi insert:", error.message);
    if (error.message.includes("does not exist")) {
      console.error(
        '\n→ Bạn chưa tạo bảng "cards" trong Supabase. Chạy SQL trong README trước.'
      );
    }
    process.exit(1);
  }

  console.log(`✓ Migrate thành công ${cards.length} từ vựng!`);
}

migrate();
