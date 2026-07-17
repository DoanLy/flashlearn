import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// 66 thẻ dạng "47. Rise (/raɪz/)" — số thứ tự và phiên âm nằm ở mặt trước.
// Phiên âm lấy THẲNG từ dữ liệu cũ (không bịa), nghĩa tiếng Việt giữ nguyên.
// Ở đây chỉ soạn thêm loại từ + câu ví dụ.
const EX = {
  Graph: ["n", "The graph shows the number of visitors each month.", "Biểu đồ cho thấy số lượng khách mỗi tháng."],
  "Bar chart": ["n phr", "The bar chart compares sales in four countries.", "Biểu đồ cột so sánh doanh số ở bốn quốc gia."],
  "Mixed graph": ["n phr", "The mixed graph combines bars and a line.", "Biểu đồ hỗn hợp kết hợp cột và đường."],
  Table: ["n", "The table lists the population of five cities.", "Bảng số liệu liệt kê dân số của năm thành phố."],
  "Line graph": ["n phr", "The line graph shows temperature changes over a year.", "Biểu đồ đường cho thấy thay đổi nhiệt độ trong một năm."],
  Process: ["n", "The diagram illustrates the process of making paper.", "Sơ đồ minh họa quy trình sản xuất giấy."],
  "Pie chart": ["n phr", "The pie chart shows how households spend their income.", "Biểu đồ tròn cho thấy các hộ gia đình chi tiêu thu nhập ra sao."],
  Percentage: ["n", "The percentage of students taking the bus rose sharply.", "Tỷ lệ phần trăm học sinh đi xe buýt tăng mạnh."],
  Consume: ["v", "People in Japan consume more fish than beef.", "Người Nhật tiêu thụ cá nhiều hơn thịt bò."],
  "Recommended amount": ["n phr", "Most adults eat less than the recommended amount of vegetables.", "Phần lớn người lớn ăn ít rau hơn lượng được khuyến nghị."],
  Comparison: ["n", "A comparison between the two charts reveals a clear trend.", "Sự so sánh giữa hai biểu đồ cho thấy một xu hướng rõ rệt."],
  Relevant: ["adj", "Only the relevant figures should be mentioned.", "Chỉ nên nhắc tới những con số có liên quan."],
  "At least": ["phr", "At least half of the population lives in cities.", "Ít nhất một nửa dân số sống ở thành thị."],
  Immigration: ["n", "Immigration to Canada increased after 2010.", "Sự nhập cư vào Canada tăng lên sau năm 2010."],
  Emigration: ["n", "Emigration from rural areas has slowed down.", "Sự di cư khỏi vùng nông thôn đã chậm lại."],
  "Net migration": ["n phr", "Net migration reached its highest point in 2015.", "Di cư ròng đạt mức cao nhất vào năm 2015."],
  Rise: ["v", "The number of tourists rose steadily from 2000 to 2010.", "Số lượng du khách tăng đều từ năm 2000 đến 2010."],
  Period: ["n", "Sales fell during the same period.", "Doanh số giảm trong cùng giai đoạn."],
  Figure: ["n", "The figure for 2020 was much lower than expected.", "Con số của năm 2020 thấp hơn dự kiến rất nhiều."],
  Significantly: ["adv", "Car ownership increased significantly over the decade.", "Tỷ lệ sở hữu ô tô tăng đáng kể trong thập kỷ đó."],
  Peak: ["v", "Unemployment peaked at 12% in 2009.", "Tỷ lệ thất nghiệp đạt đỉnh ở mức 12% vào năm 2009."],
  Emigrate: ["v", "Many young people emigrate in search of better jobs.", "Nhiều người trẻ di cư ra nước ngoài để tìm việc tốt hơn."],
  "Stand at": ["phr v", "The figure stood at just over two million.", "Con số đứng ở mức hơn hai triệu một chút."],
  "Just under": ["phr", "Just under 40% of the workers were female.", "Ngay dưới 40% số công nhân là nữ."],
  Around: ["prep", "Around one third of the energy came from coal.", "Khoảng một phần ba năng lượng đến từ than đá."],
  Remain: ["v", "The figure remained stable for five years.", "Con số duy trì ổn định trong năm năm."],
  "Similar level": ["n phr", "Both countries stayed at a similar level until 2005.", "Cả hai quốc gia giữ ở mức độ tương đương cho tới năm 2005."],
  Nearly: ["adv", "Nearly half of the respondents disagreed.", "Gần một nửa số người được hỏi không đồng ý."],
  "Much smaller": ["adj phr", "The rural population was much smaller than the urban one.", "Dân số nông thôn nhỏ hơn nhiều so với thành thị."],
  Fluctuate: ["v", "Prices fluctuated between 2010 and 2015.", "Giá cả dao động trong khoảng 2010 đến 2015."],
  Fall: ["v", "The birth rate fell sharply after 1990.", "Tỷ lệ sinh giảm mạnh sau năm 1990."],
  Suddenly: ["adv", "The figure suddenly dropped in the final year.", "Con số đột ngột giảm vào năm cuối."],
  "As a result": ["phr", "Fuel prices rose. As a result, car use declined.", "Giá nhiên liệu tăng. Kết quả là việc dùng ô tô giảm."],
  "Fall back": ["phr v", "After peaking in 2012, the figure fell back to 20%.", "Sau khi đạt đỉnh năm 2012, con số giảm trở lại còn 20%."],
  "Word count": ["n phr", "Your essay must meet the minimum word count.", "Bài luận của bạn phải đạt số lượng từ tối thiểu."],
  Approximately: ["adv", "Approximately 60% of the land was used for farming.", "Xấp xỉ 60% diện tích đất được dùng cho nông nghiệp."],
  "Self-employed": ["adj", "More people became self-employed after the pandemic.", "Nhiều người trở nên tự làm chủ sau đại dịch."],
  "Rather than": ["phr", "She walks to work rather than driving.", "Cô ấy đi bộ đi làm thay vì lái xe."],
  "Work for": ["phr v", "He works for a large software company.", "Anh ấy làm việc cho một công ty phần mềm lớn."],
  Essay: ["n", "Write an essay of at least 250 words.", "Hãy viết một bài tiểu luận ít nhất 250 từ."],
  Consideration: ["n", "Cost is an important consideration for most families.", "Chi phí là một sự cân nhắc quan trọng với hầu hết các gia đình."],
  "To what extent": ["phr", "To what extent do you agree with this statement?", "Bạn đồng ý với nhận định này tới mức độ nào?"],
  Agree: ["v", "I completely agree with this point of view.", "Tôi hoàn toàn đồng ý với quan điểm này."],
  Disagree: ["v", "Many experts disagree with that conclusion.", "Nhiều chuyên gia không đồng ý với kết luận đó."],
  Opinion: ["n", "In my opinion, the benefits outweigh the drawbacks.", "Theo ý kiến của tôi, lợi ích vượt trội hơn hạn chế."],
  Extremely: ["adv", "Air pollution is an extremely serious problem.", "Ô nhiễm không khí là một vấn đề cực kỳ nghiêm trọng."],
  Above: ["prep", "The figure stayed above 50% throughout the period.", "Con số luôn ở trên 50% trong suốt giai đoạn."],
  "Certain level": ["n phr", "Once income reaches a certain level, spending changes.", "Khi thu nhập đạt tới một mức độ nhất định, chi tiêu sẽ thay đổi."],
  "Cause and effect": ["n phr", "The essay explains the cause and effect of climate change.", "Bài luận giải thích nguyên nhân và kết quả của biến đổi khí hậu."],
  "Locally produced": ["adj phr", "Locally produced food is often fresher and cheaper.", "Thực phẩm được sản xuất tại địa phương thường tươi và rẻ hơn."],
  "Why could this be": ["phr", "Fewer people read books now. Why could this be?", "Ngày nay ít người đọc sách hơn. Tại sao lại có thể như vậy?"],
  "Financial support": ["n phr", "Students often need financial support from their parents.", "Sinh viên thường cần sự hỗ trợ tài chính từ cha mẹ."],
  "Local film industry": ["n phr", "The local film industry has grown rapidly.", "Ngành công nghiệp điện ảnh địa phương đã phát triển nhanh chóng."],
  "Present time": ["n phr", "At the present time, most homes have internet access.", "Ở thời điểm hiện tại, hầu hết các gia đình đều có internet."],
  Relatively: ["adv", "The cost of living here is relatively low.", "Chi phí sinh hoạt ở đây tương đối thấp."],
  "Young adult": ["n phr", "Young adults spend the most time online.", "Thanh niên là nhóm dành nhiều thời gian trực tuyến nhất."],
  "Compared with": ["phr", "Compared with 2000, energy use has doubled.", "So sánh với năm 2000, mức dùng năng lượng đã tăng gấp đôi."],
  Outweigh: ["v", "The advantages clearly outweigh the disadvantages.", "Ưu điểm rõ ràng vượt trội hơn nhược điểm."],
  "More and more": ["phr", "More and more people work from home.", "Ngày càng nhiều người làm việc tại nhà."],
  "Developing country": ["n phr", "Many developing countries face a shortage of clean water.", "Nhiều quốc gia đang phát triển đối mặt với tình trạng thiếu nước sạch."],
  "First time": ["n phr", "For the first time, women outnumbered men at university.", "Lần đầu tiên, số nữ sinh viên vượt số nam ở đại học."],
  Overweight: ["adj", "The number of overweight children has doubled.", "Số trẻ em thừa cân đã tăng gấp đôi."],
  "Ever before": ["phr", "People travel more than ever before.", "Con người đi lại nhiều hơn bao giờ hết."],
  "Primary cause": ["n phr", "Traffic is the primary cause of air pollution in cities.", "Giao thông là nguyên nhân chính gây ô nhiễm không khí ở thành phố."],
  "Main effect": ["n phr", "The main effect of the policy was lower fuel use.", "Tác động chính của chính sách là giảm lượng nhiên liệu tiêu thụ."],
  Epidemic: ["n", "Obesity has become a global epidemic.", "Béo phì đã trở thành một nạn dịch toàn cầu."],
};

const PAT = /^\s*\d+\s*[.)]\s*(.+?)\s*\(\s*(\/[^)]*\/)\s*\)\s*$/;

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
  const targets = all.filter((c) => PAT.test(c.word));
  console.log(`Đã nạp ${all.length} thẻ, tìm thấy ${targets.length} thẻ có số thứ tự ở mặt trước.`);

  const updates = [], missing = [];
  for (const c of targets) {
    const m = c.word.match(PAT);
    const word = m[1].trim();
    const ipa = m[2].trim();
    const e = EX[word];
    if (!e) { missing.push(word); continue; }
    const [pos, exEn, exVi] = e;
    updates.push({
      id: c.id,
      word,
      meaning: [
        `Phiên âm: (${pos}) ${ipa}`,
        `Nghĩa: ${c.meaning.trim()}`,
        `Ví dụ: "${exEn}" (${exVi})`,
      ].join("\n"),
      deck: c.deck,
      status: c.status,
    });
  }

  console.log(`Sẽ sửa: ${updates.length}/${targets.length}`);
  if (missing.length) { console.log("CHƯA SOẠN:"); missing.forEach((m) => console.log("   -", JSON.stringify(m))); }

  console.log("\n--- XEM TRƯỚC ---");
  updates.slice(0, 2).forEach((u) => { console.log("MẶT TRƯỚC: " + u.word); console.log(u.meaning); console.log("---"); });

  if (!process.argv.includes("--apply")) { console.log("\n(chạy thử — thêm --apply để ghi thật)"); return; }
  if (missing.length) { console.log("\nDỪNG: còn thẻ chưa soạn."); process.exit(1); }

  const { error } = await supabase.from("cards").upsert(updates, { onConflict: "id" });
  if (error) throw error;
  console.log(`\n✓ ĐÃ GHI ${updates.length} thẻ.`);
}

run().catch((e) => { console.error("Lỗi:", e.message); process.exit(1); });
