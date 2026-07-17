import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// IELT LỚP 2, phần các thẻ đã có sẵn câu ví dụ tiếng Anh trong dữ liệu gốc (77 thẻ)
// cộng 7 thẻ đã có sẵn phiên âm. Câu ví dụ tiếng Anh gốc được GIỮ NGUYÊN, không viết
// lại; phiên âm, loại từ và bản dịch tiếng Việt của ví dụ là do tôi soạn.

// Nhóm A+B: dữ liệu gốc dạng "nghĩa - câu ví dụ" hoặc "nghĩa - Ví dụ: câu".
// id -> [loại từ, phiên âm, bản dịch câu ví dụ]
const WITH_EX = {
  // --- nhóm B: 1783908741493-* ---
  "1783908741493-0":  ["v", "/ɪˈvɒlv/", "Con người tiến hóa từ loài vượn."],
  "1783908741493-1":  ["v", "/daɪˈvɜːsɪfaɪ/", "Để tồn tại, công ty phải đa dạng hóa sản phẩm của mình."],
  "1783908741493-2":  ["n phr", "/ˌnætʃrəl sɪˈlekʃn/", "Chọn lọc tự nhiên đảm bảo chỉ những cá thể thích nghi tốt nhất mới sống sót."],
  "1783908741493-3":  ["v phr", "/əˈdæpt tuː/", "Bạn phải thích nghi với môi trường mới."],
  "1783908741493-4":  ["n phr", "/ˌnʊk ənd ˈkræni/", "Tôi đã lau dọn mọi ngóc ngách trong nhà."],
  "1783908741493-5":  ["n", "/niːʃ/", "Cuối cùng anh ấy cũng tìm được chỗ đứng riêng của mình trong ngành công nghệ thông tin."],
  "1783908741493-6":  ["n phr", "/ˌhaɪdrəʊˈθɜːml vents/", "Những sinh vật kỳ lạ sống gần các miệng phun thủy nhiệt."],
  "1783908741493-7":  ["adj", "/lʌʃ/", "Hòn đảo được bao phủ bởi những khu rừng xanh tươi tốt."],
  "1783908741493-8":  ["n", "/ɪˈkweɪtə/", "Các nước gần xích đạo thường nóng quanh năm."],
  "1783908741493-9":  ["phr", "/baɪ ˈmiːnz əv/", "Họ trốn thoát bằng một đường hầm bí mật."],
  "1783908741493-10": ["n", "/pəˈspektɪv/", "Theo góc nhìn của tôi, kế hoạch này là hoàn hảo."],
  "1783908741493-11": ["n", "/ˈdɒmɪnəns/", "Sự thống trị của điện thoại thông minh đã thay đổi cách con người giao tiếp."],
  "1783908741493-12": ["phr", "/ˌwæks ənd ˈweɪn/", "Độ nổi tiếng của nhạc pop lúc thịnh lúc suy."],
  "1783908741493-13": ["n", "/ˈɔːɡənɪzəm/", "Cây cối là những sinh vật sống."],
  "1783908741493-14": ["v", "/ˈreplɪkeɪt/", "Virus có thể tự nhân bản rất nhanh."],
  "1783908741493-15": ["n phr", "/ˈseljələ məˈʃiːnəri/", "Các nhà khoa học nghiên cứu cách bộ máy tế bào hoạt động để chống lại bệnh tật."],

  // --- nhóm A: 1784138192969-* ---
  "1784138192969-1":  ["n phr", "/ˌɪntəˈnæʃnəl ˌedʒuˈkeɪʃn/", "Nhiều sinh viên ra nước ngoài để có được nền giáo dục quốc tế nhằm có cơ hội nghề nghiệp tốt hơn."],
  "1784138192969-2":  ["n phr", "/ˌhəʊm ˈkʌntri/", "Sau khi tốt nghiệp đại học, cô ấy quyết định trở về quê hương để khởi nghiệp."],
  "1784138192969-3":  ["n", "/ˌɪntəˈnæʃnəl ˈkæmpəsɪz/", "Vài trường đại học nổi tiếng đã mở cơ sở quốc tế ở các nước châu Á."],
  "1784138192969-4":  ["n phr", "/ˌwestən staɪl ˌedʒuˈkeɪʃn/", "Nền giáo dục kiểu phương Tây thường khuyến khích học sinh tư duy phản biện và tự do bày tỏ quan điểm."],
  "1784138192969-5":  ["v phr", "/ˌɡəʊ əʊvəˈsiːz/", "Ngày càng nhiều người trẻ muốn ra nước ngoài làm việc và trải nghiệm các nền văn hóa khác nhau."],
  "1784138192969-6":  ["n", "/ədˈvɑːntɪdʒɪz/", "Một trong những lợi thế lớn nhất của việc du học là trở nên thành thạo một ngoại ngữ."],
  "1784138192969-7":  ["adj", "/ˌʌp tə ˈdeɪt/", "Thư viện cung cấp cho sinh viên tài liệu và các bài nghiên cứu cập nhật."],
  "1784138192969-8":  ["v phr", "/ˌteɪk ˈnɒlɪdʒ bæk/", "Chính phủ hy vọng sinh viên sẽ đi du học rồi mang kiến thức đó về phát triển đất nước."],
  "1784138192969-9":  ["n phr", "/ˌɡləʊbl ɪˈkɒnəmi/", "Hiểu biết ngoại ngữ là một kỹ năng quan trọng để thành công trong nền kinh tế toàn cầu hiện đại."],
  "1784138192969-10": ["v phr", "/ˌbrɪŋ njuː aɪˈdɪəz/", "Sinh viên quốc tế luôn mang đến những ý tưởng mới và góc nhìn đa dạng cho lớp học."],
  "1784138192969-11": ["v phr", "/ˌduː ˈwel/", "Nếu bạn muốn làm bài thi tốt, bạn cần học chăm chỉ mỗi ngày."],
  "1784138192969-12": ["adj", "/ˌɪntəˈnæʃnəl/", "Cô ấy quyết định tham gia một dự án quốc tế để cải thiện kỹ năng làm việc nhóm và ngoại ngữ."],
  "1784138192969-13": ["phr v", "/ˈlʊk fɔː/", "Anh ấy đang tìm một công việc bán thời gian để trang trải chi phí sinh hoạt ở thành phố."],
  "1784138192969-14": ["n phr", "/ˌedʒuˈkeɪʃənl ˈtʃɔɪsɪz/", "Học sinh ngày nay có nhiều lựa chọn về giáo dục, như học trực tuyến, học trường nghề, hoặc vào đại học."],
  "1784138192969-15": ["v phr", "/ˌliːv wʌnz ˈkʌntri/", "Nhiều người trẻ quyết định rời khỏi đất nước mình để trải nghiệm văn hóa mới và đi du học."],
  "1784138192969-16": ["n phr", "/ˌɪŋɡlɪʃ ˈspiːkɪŋ ˈkʌntriz/", "Canada, Úc và New Zealand là những quốc gia nói tiếng Anh rất được sinh viên quốc tế ưa chuộng."],
  "1784138192969-17": ["n phr", "/ˌɪntrəstɪŋ ˈsəʊʃl laɪf/", "Tham gia câu lạc bộ của trường là cách tuyệt vời để kết bạn và xây dựng một đời sống xã hội thú vị."],
  "1784138192969-18": ["adj", "/ˌmʌltiˈlɪŋɡwəl/", "Lớn lên trong một gia đình đa ngôn ngữ, cô ấy nói thành thạo tiếng Việt, tiếng Anh và tiếng Pháp."],
  "1784138192969-20": ["n", "/ˈpɔɪzn/", "Một số loài ếch tiết ra chất độc chết người để tự vệ."],
  "1784138192969-21": ["n", "/ˈpredətə/", "Sư tử được biết đến là kẻ săn mồi nguy hiểm ở thảo nguyên châu Phi."],
  "1784138192969-22": ["n", "/preɪ/", "Con hổ di chuyển lặng lẽ qua đám cỏ để bắt con mồi."],
  "1784138192969-23": ["adj", "/spekˈtækjələ/", "Màn pháo hoa đêm giao thừa thật sự ngoạn mục."],
  "1784138192969-24": ["n", "/ˈtʌnl/", "Thỏ đào những đường hầm sâu dưới lòng đất để trốn kẻ săn mồi."],
  "1784138192969-25": ["n", "/ˈkɒŋkriːt/", "Cầu hiện đại và các tòa nhà cao tầng chủ yếu được xây bằng thép và bê tông."],
  "1784138192969-26": ["n", "/ˈkɒntɪnənt/", "Châu Á là lục địa lớn nhất và đông dân nhất thế giới."],
  "1784138192969-27": ["n phr", "/ˌæbəˈrɪdʒənl ˈpiːpl/", "Người thổ dân Úc có mối liên hệ sâu sắc với đất đai, lịch sử và văn hóa của họ."],
  "1784138192969-28": ["phr", "/səkˈsesfəli əˈdæptɪd/", "Nhiều loài động vật hoang dã đã thích nghi thành công với việc sống ở khu vực đô thị."],
  "1784138192969-29": ["n phr", "/ˌneɪtɪv ˈspiːʃiːz/", "Chính phủ đang cố gắng bảo vệ các loài bản địa khỏi bị hủy diệt bởi các loài cây ngoại lai."],
  "1784138192969-30": ["n phr", "/ˌnɒn neɪtɪv ˈænɪml/", "Đưa một loài động vật ngoại lai vào hệ sinh thái mới có thể gây thiệt hại nghiêm trọng cho động vật hoang dã bản địa."],
  "1784138192969-31": ["v", "/rɪˈspekt/", "Người bản địa tin rằng chúng ta phải tôn trọng thế giới tự nhiên và chỉ lấy những gì mình cần."],
  "1784138192969-33": ["adj", "/ˈhɑːmfl/", "Nhà máy đang xả hóa chất độc hại ra sông, gây hại cho hệ sinh thái địa phương."],
  "1784138192969-34": ["phr", "/ˈseprət frɒm/", "Vì hòn đảo tách biệt khỏi đất liền nên các loài vật ở đó phát triển rất khác."],
  "1784138192969-35": ["n", "/ˈspiːʃiːz/", "Các nhà khoa học gần đây đã phát hiện vài loài côn trùng mới trong rừng mưa nhiệt đới."],
  "1784138192969-36": ["v", "/ɪɡˈzɪst/", "Một số loài vật tồn tại ở Úc không thể tìm thấy ở bất kỳ nơi nào khác trên thế giới."],
  "1784138192969-37": ["adj", "/ʌnˈkɒmən/", "Rất hiếm khi thấy loài chim này bay trong thành phố vào ban ngày."],
  "1784138192969-38": ["n", "/ˈlændskeɪp/", "Việc xây dựng đường cao tốc mới đã thay đổi hoàn toàn cảnh quan tự nhiên của khu vực."],
  "1784138192969-39": ["phr", "/ˈlɒs əv/", "Những cơn bão lớn năm nay gây thiệt hại mùa màng nặng nề cho nông dân địa phương."],
  "1784138192969-40": ["n", "/ˈreɪnfɒrɪst/", "Rừng mưa Amazon là nhà của hàng triệu loài thực vật và động vật khác nhau."],
  "1784138192969-41": ["phr v", "/rɪˈzʌlt ɪn/", "Việc thiếu mưa trong vài tháng qua đã dẫn đến tình trạng thiếu nước nghiêm trọng."],
  "1784138192969-42": ["n", "/ˈmæml/", "Kangaroo là loài thú có vú nổi tiếng của Úc, mang con trong túi."],
  "1784138192969-43": ["v phr", "/bɪˌkʌm ɪkˈstɪŋkt/", "Khủng long đã tuyệt chủng hàng triệu năm trước khi con người xuất hiện trên Trái Đất."],
  "1784138192969-44": ["v", "/ɪnˈdeɪndʒə/", "Ô nhiễm và sự phá hủy môi trường sống đe dọa nghiêm trọng sự sống còn của những con rùa biển quý hiếm này."],
  "1784138192969-45": ["phr", "/ət ˈrɪsk əv ɪkˈstɪŋkʃn/", "Nếu chúng ta không chấm dứt nạn săn bắt trái phép, hổ sẽ sớm có nguy cơ tuyệt chủng."],
  "1784138192969-46": ["v phr", "/ˌrʌn ˈwaɪld/", "Những con mèo bị chủ bỏ lại và giờ sống hoang trong công viên gần đó."],
  "1784138192969-47": ["adj", "/ˈmæsɪv/", "Các vụ cháy rừng gần đây đã thiêu rụi những vùng đất rộng lớn chỉ trong vài ngày."],
  "1784138192969-48": ["n phr", "/ɪnˌvaɪrənˈmentl ˈdæmɪdʒ/", "Chất thải công nghiệp từ các nhà máy đã gây thiệt hại môi trường nghiêm trọng cho vùng nước ven biển."],
  "1784138192969-49": ["adj", "/ˈhɑːmləs/", "Đừng lo về con nhện vườn nhỏ đó; nó hoàn toàn vô hại với con người."],
  "1784138192969-50": ["n", "/ˈdɪŋɡəʊ/", "Dingo là loài chó hoang độc đáo đã sống ở Úc hàng nghìn năm."],
  "1784138192969-51": ["phr", "/ɪn ˈɔːdə tə səˈvaɪv/", "Động vật phải tìm nước sạch và nơi trú ẩn để sống sót qua mùa đông khắc nghiệt."],
  "1784138192969-52": ["v", "/əˈtæk/", "Mèo hoang thường tấn công các loài chim nhỏ và thú có vú vào ban đêm."],
  "1784138192969-54": ["v", "/kəmˈbaɪn/", "Môn thể thao mới này kết hợp tốc độ của bóng rổ với kỹ năng của bóng đá."],
  "1784138192969-55": ["v phr", "/ˌteɪk ˈɒpəzɪt saɪdz/", "Trước khi trận đấu bắt đầu, hai đội bước ra sân và đứng ở hai phía đối diện."],
  "1784138192969-56": ["n phr", "/ˈtenɪs kɔːt/", "Chúng tôi tập thi đấu trên sân tennis ngoài trời mỗi cuối tuần."],
  "1784138192969-57": ["v phr", "/rɪˌtɜːn ðə ˈbɔːl/", "Cầu thủ dùng đầu để đánh trả bóng sang bên kia lưới."],
  "1784138192969-58": ["v", "/baʊns/", "Trong trò này, bạn chỉ được để bóng nảy một lần xuống đất trước khi đánh trả."],
  "1784138192969-59": ["n", "/əˈpəʊnənt/", "Cô ấy chơi phòng thủ để chờ đối thủ mắc lỗi."],
  "1784138192969-60": ["v/n", "/sɜːv/", "Anh ấy có cú giao bóng rất mạnh và nhanh, khó đỡ được."],
  "1784138192969-61": ["n phr", "/ˈwɪnɪŋ tiːm/", "Cuối cuộc thi, đội chiến thắng được trao một chiếc cúp vàng."],
  "1784138192969-62": ["phr", "/bi ɪn ˈfrʌnt əv/", "Để thắng ván đấu, bạn phải ghi 15 điểm và dẫn trước đội kia ít nhất hai điểm."],
  "1784138192969-63": ["adj", "/ˈpɒpjələ/", "Cầu lông là môn thể thao rất phổ biến trong giới học sinh ở châu Á."],
  "1784138192969-64": ["n phr", "/ˈtʊənəmənt ˈsɪəriːz/", "Đội e-sports đang chuẩn bị cho một chuỗi giải đấu lớn vào tháng sau."],
  "1784138192969-65": ["phr", "/ˈspɒnsəd baɪ/", "Sự kiện bóng đá địa phương này được tài trợ bởi một công ty nước tăng lực nổi tiếng."],
};

// Nhóm C: dữ liệu gốc dạng "/phiên âm/ loại từ ⏎ nghĩa ⏎ Collocation: ...".
// Phiên âm gốc là ký hiệu giọng Mỹ (/ˈsoʊ.lɚ/) -> đổi sang giọng Anh cho khớp các deck
// khác. Phần Collocation gốc được giữ lại, gộp vào dòng Nghĩa. Ví dụ do tôi soạn.
// id -> [loại từ, phiên âm, nghĩa, ví dụ tiếng Anh, bản dịch]
const WITH_IPA = {
  "1783917324479": ["adj", "/ˈsəʊlə/", "Thuộc về mặt trời (đi kèm: solar energy, solar panels)", "Solar energy is much cheaper than it was ten years ago.", "Năng lượng mặt trời giờ rẻ hơn nhiều so với mười năm trước."],
  "1783917424742": ["n", "/kəˈlektə/", "Bộ thu, thiết bị thu nhận (đi kèm: solar collector, data collector)", "The solar collector on the roof heats the water for the whole house.", "Bộ thu năng lượng mặt trời trên mái làm nóng nước cho cả ngôi nhà."],
  "1783917448128": ["v", "/əbˈzɔːb/", "Hấp thụ, nuốt chửng (đi kèm: absorb heat, absorb information)", "Dark surfaces absorb more heat than light ones.", "Bề mặt sẫm màu hấp thụ nhiệt nhiều hơn bề mặt sáng màu."],
  "1783917472841": ["n", "/ˈpænl/", "Tấm, bảng, tấm pa-nô (đi kèm: solar panels, control panel)", "They installed solar panels on the roof last year.", "Năm ngoái họ lắp các tấm pin mặt trời trên mái nhà."],
  "1783917484723": ["v", "/ɪnˈhɪbɪt/", "Ngăn chặn, kiềm chế, cản trở (đi kèm: inhibit growth, inhibit reflection)", "A black coating inhibits reflection and keeps the heat inside.", "Lớp phủ màu đen ngăn sự phản xạ và giữ nhiệt lại bên trong."],
  "1783917512894": ["n", "/ˌɪnsjuˈleɪʃn/", "Vật liệu cách nhiệt, vật liệu cách điện (đi kèm: roof insulation, thermal insulation)", "Good roof insulation keeps the house warm in winter.", "Vật liệu cách nhiệt tốt trên mái giữ cho ngôi nhà ấm áp vào mùa đông."],
  "1783917462544": ["n", "/ˌreɪdiˈeɪʃn/", "Bức xạ, phóng xạ (đi kèm: solar radiation, UV radiation)", "Solar radiation is strongest around midday.", "Bức xạ mặt trời mạnh nhất vào khoảng giữa trưa."],
};

// "nghĩa - câu ví dụ"  ->  { vi, exEn }. Tách ở dấu " - " CUỐI CÙNG, vì phần nghĩa
// có thể chứa " - " bên trong ngoặc (vd "dẫn trước (đội khác - về mặt điểm số)").
function splitOld(meaning) {
  const s = (meaning || "").trim();
  const i = s.lastIndexOf(" - ");
  if (i < 0) return { vi: s, exEn: "" };
  const vi = s.slice(0, i).trim();
  const exEn = s.slice(i + 3).replace(/^Ví dụ:\s*/i, "").trim();
  return { vi, exEn };
}

const fmt = (pos, ipa, vi, exEn, exVi) =>
  [`Phiên âm: (${pos}) ${ipa}`, `Nghĩa: ${vi}`, `Ví dụ: "${exEn}" (${exVi})`].join("\n");

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
  const updates = [];
  const problems = [];

  for (const [id, [pos, ipa, exVi]] of Object.entries(WITH_EX)) {
    const c = byId.get(id);
    if (!c) { problems.push(`Không tìm thấy ${id}`); continue; }
    const { vi, exEn } = splitOld(c.meaning);
    if (!vi) { problems.push(`${id} (${c.word}): tách không ra nghĩa`); continue; }
    if (!exEn || !exEn.includes(" ")) { problems.push(`${id} (${c.word}): tách không ra ví dụ -> ${JSON.stringify(exEn)}`); continue; }
    if (!/[.?!]$/.test(exEn)) problems.push(`${id} (${c.word}): ví dụ không kết thúc bằng dấu câu -> ${JSON.stringify(exEn)}`);
    updates.push({ id, word: c.word, meaning: fmt(pos, ipa, vi, exEn, exVi), deck: c.deck, status: c.status });
  }

  for (const [id, [pos, ipa, vi, exEn, exVi]] of Object.entries(WITH_IPA)) {
    const c = byId.get(id);
    if (!c) { problems.push(`Không tìm thấy ${id}`); continue; }
    updates.push({ id, word: c.word, meaning: fmt(pos, ipa, vi, exEn, exVi), deck: c.deck, status: c.status });
  }

  console.log(`Sẽ ghi ${updates.length} thẻ (có sẵn ví dụ: ${Object.keys(WITH_EX).length}, có sẵn phiên âm: ${Object.keys(WITH_IPA).length}).`);
  if (problems.length) { console.log("VẤN ĐỀ:"); problems.forEach((p) => console.log("   -", p)); }

  console.log("\n--- XEM TRƯỚC 4 THẺ ---");
  for (const id of ["1783908741493-12", "1784138192969-62", "1784138192969-3", "1783917324479"]) {
    const u = updates.find((x) => x.id === id);
    if (u) { console.log("MẶT TRƯỚC: " + u.word); console.log(u.meaning); console.log("---"); }
  }

  if (!apply) { console.log("\n(chạy thử — thêm --apply để ghi thật)"); return; }
  if (problems.length) { console.log("\nDỪNG: còn vấn đề chưa xử lý, không ghi."); process.exit(1); }

  for (let i = 0; i < updates.length; i += 50) {
    const { error } = await supabase.from("cards").upsert(updates.slice(i, i + 50), { onConflict: "id" });
    if (error) throw error;
    console.log(`   đã ghi ${Math.min(i + 50, updates.length)}/${updates.length}`);
  }
  console.log(`\n✓ ĐÃ GHI ${updates.length} thẻ.`);
}

run().catch((e) => { console.error("Lỗi:", e.message); process.exit(1); });
