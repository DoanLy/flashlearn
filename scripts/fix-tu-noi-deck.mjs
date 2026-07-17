import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// Soạn tay toàn bộ: phiên âm theo quy ước Cambridge (/r/, không dùng /ɹ/) cho khớp
// với 2891 thẻ ISTQB sẵn có. Loại từ đặt đúng ngữ cảnh từ nối — API tra sai
// (But -> noun, So -> adjective) nên không dùng.
// Khóa là chuỗi mặt trước GỐC, giữ nguyên dấu nháy cong ’ như trong dữ liệu.
const DATA = {
  "First of all": ["phr", "/ˌfɜːst əv ˈɔːl/", "First of all, I'd like to introduce myself.", "Trước tiên, tôi muốn giới thiệu về bản thân."],
  "To begin with": ["phr", "/tə bɪˈɡɪn wɪð/", "To begin with, let me explain why I chose this topic.", "Để bắt đầu, hãy để tôi giải thích vì sao tôi chọn chủ đề này."],
  "At first": ["phr", "/ət ˈfɜːst/", "At first, I found English grammar really difficult.", "Lúc đầu, tôi thấy ngữ pháp tiếng Anh thật sự khó."],
  "In the beginning": ["phr", "/ɪn ðə bɪˈɡɪnɪŋ/", "In the beginning, I could hardly speak a word.", "Ban đầu, tôi gần như không nói được từ nào."],
  "The first reason is that": ["phr", "/ðə fɜːst ˈriːzn ɪz ðæt/", "The first reason is that it saves a lot of time.", "Lý do đầu tiên là nó tiết kiệm rất nhiều thời gian."],
  "I would like to talk about": ["phr", "/aɪ wʊd laɪk tə tɔːk əˈbaʊt/", "I would like to talk about my hometown.", "Tôi muốn nói về quê hương của tôi."],
  "In my opinion": ["phr", "/ɪn maɪ əˈpɪnjən/", "In my opinion, reading is the best way to relax.", "Theo ý kiến của tôi, đọc sách là cách thư giãn tốt nhất."],
  "I think that": ["phr", "/aɪ θɪŋk ðæt/", "I think that everyone should learn a second language.", "Tôi nghĩ rằng ai cũng nên học một ngoại ngữ."],
  "I believe that": ["phr", "/aɪ bɪˈliːv ðæt/", "I believe that hard work always pays off.", "Tôi tin rằng chăm chỉ luôn được đền đáp."],
  Also: ["adv", "/ˈɔːlsəʊ/", "She speaks French, and she also plays the piano.", "Cô ấy nói tiếng Pháp, và cũng chơi piano nữa."],
  Besides: ["adv", "/bɪˈsaɪdz/", "I don't want to go out. Besides, it's raining.", "Tôi không muốn ra ngoài. Bên cạnh đó, trời đang mưa."],
  "Besides that": ["phr", "/bɪˈsaɪdz ðæt/", "Besides that, the price is quite reasonable.", "Ngoài ra, giá cả cũng khá hợp lý."],
  "In addition": ["phr", "/ɪn əˈdɪʃn/", "In addition, the hotel offers free breakfast.", "Thêm vào đó, khách sạn có bữa sáng miễn phí."],
  Moreover: ["adv", "/mɔːˈrəʊvə/", "Moreover, online learning saves travel time.", "Hơn nữa, học trực tuyến tiết kiệm thời gian đi lại."],
  "Another reason is that": ["phr", "/əˈnʌðə ˈriːzn ɪz ðæt/", "Another reason is that it is much cheaper.", "Một lý do khác là nó rẻ hơn nhiều."],
  "What’s more": ["phr", "/wɒts ˈmɔː/", "What's more, the staff were extremely friendly.", "Hơn nữa, nhân viên còn cực kỳ thân thiện."],
  "Not only that, but": ["phr", "/nɒt ˈəʊnli ðæt bʌt/", "Not only that, but the food was excellent too.", "Không chỉ vậy mà đồ ăn cũng rất ngon."],
  However: ["adv", "/haʊˈevə/", "The film was long. However, I enjoyed every minute.", "Bộ phim dài. Tuy nhiên, tôi thích từng phút một."],
  But: ["conj", "/bʌt/", "I wanted to help, but I was too busy.", "Tôi muốn giúp, nhưng tôi quá bận."],
  "On the other hand": ["phr", "/ɒn ði ˈʌðə hænd/", "City life is exciting. On the other hand, it is stressful.", "Cuộc sống thành thị thú vị. Mặt khác, nó cũng căng thẳng."],
  Although: ["conj", "/ɔːlˈðəʊ/", "Although it was raining, we still went hiking.", "Mặc dù trời mưa, chúng tôi vẫn đi leo núi."],
  "Even though": ["conj", "/ˈiːvn ðəʊ/", "Even though I was tired, I finished my homework.", "Mặc dù mệt, tôi vẫn làm xong bài tập."],
  "Despite this": ["phr", "/dɪˈspaɪt ðɪs/", "The test was hard. Despite this, she passed easily.", "Bài kiểm tra khó. Dù vậy, cô ấy vẫn đỗ dễ dàng."],
  "Such as": ["phr", "/sʌtʃ əz/", "I enjoy outdoor sports such as cycling and swimming.", "Tôi thích các môn thể thao ngoài trời chẳng hạn như đạp xe và bơi lội."],
  "As a result": ["phr", "/əz ə rɪˈzʌlt/", "He practised every day. As a result, he improved quickly.", "Anh ấy luyện tập mỗi ngày. Kết quả là anh tiến bộ rất nhanh."],
  Therefore: ["adv", "/ˈðeəfɔː/", "The road was closed. Therefore, we had to take a detour.", "Đường bị đóng. Vì vậy, chúng tôi phải đi vòng."],
  So: ["conj", "/səʊ/", "It was late, so we decided to go home.", "Trời đã muộn, nên chúng tôi quyết định về nhà."],
  "Because of this": ["phr", "/bɪˈkɒz əv ðɪs/", "Because of this, many students dropped the course.", "Vì điều này, nhiều sinh viên đã bỏ khóa học."],
  "That’s why": ["phr", "/ðæts waɪ/", "I love cooking. That's why I watch food shows.", "Tôi thích nấu ăn. Đó là lý do tại sao tôi xem các chương trình ẩm thực."],
  Then: ["adv", "/ðen/", "We had dinner, then we watched a movie.", "Chúng tôi ăn tối, sau đó xem phim."],
  "After that": ["phr", "/ˈɑːftə ðæt/", "I finished school. After that, I went to university.", "Tôi học xong phổ thông. Sau đó tôi vào đại học."],
  Later: ["adv", "/ˈleɪtə/", "I'll call you later this evening.", "Tôi sẽ gọi bạn muộn hơn tối nay."],
  Finally: ["adv", "/ˈfaɪnəli/", "Finally, I would like to thank my teacher.", "Cuối cùng, tôi muốn cảm ơn thầy giáo của mình."],
  "In the end": ["phr", "/ɪn ði ˈend/", "In the end, we chose the cheaper option.", "Cuối cùng thì chúng tôi chọn phương án rẻ hơn."],
  "In conclusion": ["phr", "/ɪn kənˈkluːʒn/", "In conclusion, exercise benefits both body and mind.", "Tóm lại, tập thể dục có lợi cho cả thể chất lẫn tinh thần."],
  "To sum up": ["phr", "/tə sʌm ˈʌp/", "To sum up, technology has changed how we learn.", "Tóm lại, công nghệ đã thay đổi cách chúng ta học."],
  Overall: ["adv", "/ˌəʊvərˈɔːl/", "Overall, it was a very useful trip.", "Nhìn chung, đó là một chuyến đi rất bổ ích."],
  "That’s all I want to say": ["phr", "/ðæts ɔːl aɪ wɒnt tə seɪ/", "That's all I want to say about my hobby.", "Đó là tất cả những gì tôi muốn nói về sở thích của mình."],
  "That’s why I like it": ["phr", "/ðæts waɪ aɪ laɪk ɪt/", "It helps me relax after work. That's why I like it.", "Nó giúp tôi thư giãn sau giờ làm. Đó là lý do tôi thích nó."],
  Actually: ["adv", "/ˈæktʃuəli/", "Actually, I have never been abroad.", "Thật ra là tôi chưa bao giờ ra nước ngoài."],
  "To be honest": ["phr", "/tə bi ˈɒnɪst/", "To be honest, I don't enjoy horror films.", "Thành thật mà nói, tôi không thích phim kinh dị."],
  "I guess": ["phr", "/aɪ ɡes/", "I guess we should leave now.", "Tôi đoán là chúng ta nên đi bây giờ."],
  "I suppose": ["phr", "/aɪ səˈpəʊz/", "I suppose you're right about that.", "Tôi cho rằng bạn nói đúng về điều đó."],
  Personally: ["adv", "/ˈpɜːsənəli/", "Personally, I prefer tea to coffee.", "Cá nhân tôi thì thích trà hơn cà phê."],
  "From my point of view": ["phr", "/frəm maɪ pɔɪnt əv ˈvjuː/", "From my point of view, the price is too high.", "Theo quan điểm của tôi, giá đó quá cao."],
  "It depends": ["phr", "/ɪt dɪˈpendz/", "It depends on how much free time I have.", "Còn tùy vào việc tôi có bao nhiêu thời gian rảnh."],
  "As far as I know": ["phr", "/əz fɑːr əz aɪ ˈnəʊ/", "As far as I know, the museum opens at nine.", "Theo như tôi biết, bảo tàng mở cửa lúc chín giờ."],
  "In my daily life": ["phr", "/ɪn maɪ ˈdeɪli laɪf/", "In my daily life, I use my phone for almost everything.", "Trong cuộc sống hằng ngày của tôi, tôi dùng điện thoại cho hầu hết mọi việc."],
  "In my case": ["phr", "/ɪn maɪ ˈkeɪs/", "In my case, studying at night works best.", "Trong trường hợp của tôi, học vào buổi tối là hiệu quả nhất."],
  "For example": ["phr", "/fər ɪɡˈzɑːmpl/", "Many cities, for example Hanoi, are growing fast.", "Nhiều thành phố, ví dụ Hà Nội, đang phát triển nhanh."],
  "For instance": ["phr", "/fər ˈɪnstəns/", "Some animals, for instance dolphins, are very intelligent.", "Một số loài vật, ví dụ cá heo, rất thông minh."],
  "A good example is": ["phr", "/ə ɡʊd ɪɡˈzɑːmpl ɪz/", "A good example is the way people shop online now.", "Một ví dụ tốt là cách mọi người mua sắm trực tuyến hiện nay."],
};

async function loadDeck(deck) {
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("deck", deck)
      .range(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return all;
}

async function run() {
  const cards = await loadDeck("Từ nối");
  console.log(`Chủ đề "Từ nối": ${cards.length} thẻ.`);

  const updates = [];
  const missing = [];
  for (const c of cards) {
    const d = DATA[c.word];
    if (!d) { missing.push(c.word); continue; }
    const [pos, ipa, exEn, exVi] = d;
    updates.push({
      id: c.id,
      word: c.word,
      // Nghĩa tiếng Việt GỐC được giữ nguyên, không viết lại
      meaning: [
        `Phiên âm: (${pos}) ${ipa}`,
        `Nghĩa: ${c.meaning.trim()}`,
        `Ví dụ: "${exEn}" (${exVi})`,
      ].join("\n"),
      deck: c.deck,
      status: c.status,
    });
  }

  console.log(`Sẽ soạn lại: ${updates.length}/${cards.length}`);
  if (missing.length) {
    console.log("CHƯA SOẠN (sẽ không ghi):");
    missing.forEach((m) => console.log("   -", JSON.stringify(m)));
  }

  console.log("\n--- XEM TRƯỚC 3 THẺ ---");
  updates.slice(0, 3).forEach((u) => {
    console.log("MẶT TRƯỚC: " + u.word);
    console.log(u.meaning);
    console.log("---");
  });

  if (!process.argv.includes("--apply")) {
    console.log("\n(chạy thử — thêm --apply để ghi thật)");
    return;
  }
  if (missing.length) { console.log("\nDỪNG: còn thẻ chưa soạn, không ghi."); process.exit(1); }

  const { error } = await supabase.from("cards").upsert(updates, { onConflict: "id" });
  if (error) throw error;
  console.log(`\n✓ ĐÃ GHI ${updates.length} thẻ.`);
}

run().catch((e) => { console.error("Lỗi:", e.message); process.exit(1); });
