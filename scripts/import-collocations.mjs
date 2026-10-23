// Nạp chủ đề "Collocations IELTS Speaking" — 150 collocation IELTS (10 nhóm: thói quen, học tập
// & công việc, sở thích, ăn uống & sức khoẻ, du lịch, công nghệ, các mối quan hệ, nhà cửa & quê
// hương, thời tiết & môi trường, tiền bạc & cảm xúc), mỗi cụm 2 câu mẫu Speaking Part 1 do user
// cung cấp (2026-10-23). Bỏ nhãn chủ đề in nghiêng ở đầu mỗi câu mẫu.
//
// Thẻ theo chuẩn 3 dòng; 2 câu ví dụ nằm trên 2 dòng của trường Ví dụ (parseCardFields giữ dòng
// nối tiếp sau "Ví dụ:"):
//   Phiên âm: (v phr) /…/
//   Nghĩa: …
//   Ví dụ: "EN 1" (VI 1)
//   "EN 2" (VI 2)
// IPA Anh-Anh tự ghép từng từ như import-4000ielts.mjs (Oxford → eSpeak); thiếu IPA của bất kỳ
// từ nào thì chỉ ghi loại từ, không bịa.
//
// Mỗi dòng DATA: cụm | loại từ | nghĩa | câu 1 | dịch 1 | câu 2 | dịch 2
// id = "collocations-0001"… (deterministic ⇒ chạy lại không tạo thẻ trùng).
// Mặc định DRY-RUN; thêm --apply để ghi thật lên Supabase.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const APPLY = process.argv.includes("--apply");
const DECK = "Collocations IELTS Speaking";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// --- IPA từng từ ---
const ipa = new Map();
const espeakPath = join(HERE, "_en_UK_ipa.txt");
if (existsSync(espeakPath)) {
  for (const line of readFileSync(espeakPath, "utf8").split("\n")) {
    const [w, p] = line.split("\t");
    if (w && p && p.trim()) ipa.set(w.trim().toLowerCase(), p.split(",")[0].trim().replace(/^\/|\/$/g, ""));
  }
}
const oxfordPath = join(HERE, "_oxford_full_word.json");
if (existsSync(oxfordPath)) {
  const seenOx = new Set();
  for (const { value } of JSON.parse(readFileSync(oxfordPath, "utf8"))) {
    const w = String(value?.word || "").trim().toLowerCase();
    const uk = value?.phonetics?.uk;
    if (!w || !uk || seenOx.has(w)) continue;
    seenOx.add(w);
    ipa.set(w, uk.trim().replace(/^\/|\/$/g, ""));
  }
}
// Ghi đè theo Oxford Learner's: từ không có trong 2 nguồn (selfie, can't), từ chỉ có bản eSpeak
// (dấu nhấn lệch, ɹ/ɛ), và DẠNG YẾU của từ chức năng — trong cụm từ "a/the/to/for/of" đọc yếu.
const FIX = {
  selfie: "ˈselfi", "can't": "kɑːnt", housework: "ˈhaʊswɜːk", stuck: "stʌk", errands: "ˈerəndz",
  nap: "næp", notes: "nəʊts", mistakes: "mɪˈsteɪks", overtime: "ˈəʊvətaɪm",
  badminton: "ˈbædmɪntən", surf: "sɜːf", friends: "frendz", games: "ɡeɪmz", photos: "ˈfəʊtəʊz",
  plants: "plɑːnts", junk: "dʒʌŋk", cooked: "kʊkt", bags: "bæɡz", sightseeing: "ˈsaɪtsiːɪŋ",
  easier: "ˈiːziə(r)", viral: "ˈvaɪrəl", extended: "ɪkˈstendɪd", cosy: "ˈkəʊzi",
  buildings: "ˈbɪldɪŋz", sunny: "ˈsʌni", humid: "ˈhjuːmɪd", scenery: "ˈsiːnəri",
  sunset: "ˈsʌnset", stressed: "strest", room: "ruːm", interest: "ˈɪntrəst",
  a: "ə", an: "ən", the: "ðə", to: "tə", for: "fə(r)", of: "əv", and: "ənd", at: "ət",
};
for (const [w, p] of Object.entries(FIX)) ipa.set(w, p);
// "pay attention (to)" → đọc cả từ trong ngoặc; "play badminton / football" → giữ dấu "/".
// "the" trước nguyên âm đọc /ði/; "to" cuối cụm đọc /tuː/.
const phraseIpa = (term) => {
  const words = term.toLowerCase().replace(/[()]/g, "").split(/[\s-]+/).filter(Boolean);
  const parts = words.map((w) => (w === "/" ? "/" : ipa.get(w.replace(/[^a-z']/g, ""))));
  if (!parts.every(Boolean)) return "";
  words.forEach((w, i) => {
    if (w === "the" && /^ˈ?[aeiouɪʊəɒʌæɜ]/.test(parts[i + 1] || "")) parts[i] = "ði";
    if (w === "to" && i === words.length - 1) parts[i] = "tuː";
  });
  return `/${parts.join(" ")}/`;
};

const DATA = `
get up early|v phr|dậy sớm|I usually get up early on weekdays because I have to go to work.|Tôi thường dậy sớm vào các ngày trong tuần vì phải đi làm.|On Sundays, I don't get up early. I like to stay in bed until 9 a.m.|Vào Chủ nhật, tôi không dậy sớm. Tôi thích nằm trên giường đến 9 giờ sáng.
have breakfast|v phr|ăn sáng|I always have breakfast at a small stall near my house.|Tôi luôn ăn sáng ở một quán nhỏ gần nhà.|If I don't have breakfast, I feel tired all morning.|Nếu không ăn sáng, tôi thấy mệt cả buổi sáng.
take a shower|v phr|tắm|In summer, I take a shower twice a day because it's so hot.|Vào mùa hè, tôi tắm hai lần một ngày vì trời rất nóng.|I take a warm shower before bed to help me relax.|Tôi tắm nước ấm trước khi ngủ để giúp mình thư giãn.
go to bed late|v phr|đi ngủ muộn|I often go to bed late because I watch videos on my phone.|Tôi thường đi ngủ muộn vì xem video trên điện thoại.|During exam time, most students go to bed late.|Trong mùa thi, hầu hết học sinh đều đi ngủ muộn.
do the housework|v phr|làm việc nhà|In my family, everyone helps to do the housework at the weekend.|Trong gia đình tôi, mọi người đều phụ làm việc nhà vào cuối tuần.|When I was a child, I didn't like doing the housework at all.|Khi còn nhỏ, tôi hoàn toàn không thích làm việc nhà.
do the washing-up|v phr|rửa bát|After dinner, I do the washing-up while my mum cleans the table.|Sau bữa tối, tôi rửa bát trong khi mẹ lau bàn.|When my friends come over, we do the washing-up together.|Khi bạn bè đến chơi, chúng tôi cùng nhau rửa bát.
catch the bus|v phr|bắt xe buýt|I catch the bus to work because it's cheap.|Tôi đi xe buýt đến chỗ làm vì nó rẻ.|On rainy days, it's hard to catch the bus on time.|Vào những ngày mưa, rất khó bắt xe buýt đúng giờ.
get stuck in traffic|v phr|bị kẹt xe|I often get stuck in traffic in the evening, so I get home late.|Tôi thường bị kẹt xe vào buổi tối nên về nhà muộn.|My city is nice, but people get stuck in traffic every day.|Thành phố của tôi đẹp, nhưng ngày nào người ta cũng bị kẹt xe.
run errands|v phr|chạy việc vặt|On Saturday mornings, I usually run errands, like going to the bank.|Vào sáng thứ Bảy, tôi thường chạy việc vặt, ví dụ như ra ngân hàng.|I try to run all my errands on one day to save time.|Tôi cố gắng làm hết việc vặt trong một ngày để tiết kiệm thời gian.
take a nap|v phr|chợp mắt, ngủ trưa|I sometimes take a short nap after lunch.|Thỉnh thoảng tôi chợp mắt một chút sau bữa trưa.|In my office, many people take a nap at lunchtime.|Ở văn phòng tôi, nhiều người ngủ trưa vào giờ nghỉ.
set an alarm|v phr|đặt báo thức|I use my phone to set an alarm every night.|Tối nào tôi cũng dùng điện thoại để đặt báo thức.|When I have an early flight, I set two alarms.|Khi có chuyến bay sớm, tôi đặt hai cái báo thức.
follow a routine|v phr|theo một thói quen cố định|I try to follow the same routine every day.|Tôi cố gắng theo cùng một nếp sinh hoạt mỗi ngày.|Following a routine helps me sleep better.|Sinh hoạt theo nề nếp giúp tôi ngủ ngon hơn.
spend time with|v phr|dành thời gian cho ai|I spend a lot of time with my parents at the weekend.|Tôi dành nhiều thời gian cho bố mẹ vào cuối tuần.|I love spending time with my dog after work.|Tôi rất thích dành thời gian chơi với chú chó của mình sau giờ làm.
waste time|v phr|lãng phí thời gian|I think I waste too much time on Facebook.|Tôi nghĩ mình lãng phí quá nhiều thời gian trên Facebook.|I waste a lot of time waiting for the bus.|Tôi mất rất nhiều thời gian chờ xe buýt.
make a list|v phr|lập danh sách|I always make a shopping list before I go to the supermarket.|Tôi luôn lập danh sách đồ cần mua trước khi đi siêu thị.|I make a to-do list every morning so I don't forget anything.|Sáng nào tôi cũng lập danh sách việc cần làm để không quên gì.
do homework|v phr|làm bài tập về nhà|When I was at school, I did my homework every evening.|Hồi còn đi học, tối nào tôi cũng làm bài tập về nhà.|I usually listen to soft music when I do my homework.|Tôi thường nghe nhạc nhẹ khi làm bài tập.
take notes|v phr|ghi chép|I take notes in class so I can remember the lessons.|Tôi ghi chép trong lớp để có thể nhớ bài.|When I read a good book, I sometimes take notes on my phone.|Khi đọc một cuốn sách hay, thỉnh thoảng tôi ghi chú lại trên điện thoại.
pass an exam|v phr|thi đỗ|I studied very hard to pass my English exam.|Tôi đã học rất chăm để thi đỗ kỳ thi tiếng Anh.|I felt so happy when I passed my first big exam.|Tôi đã rất vui khi thi đỗ kỳ thi lớn đầu tiên của mình.
fail a test|v phr|trượt bài kiểm tra|I once failed a maths test, so I had to take it again.|Tôi từng trượt một bài kiểm tra toán nên phải làm lại.|My friend failed his driving test two times.|Bạn tôi đã trượt bài thi lái xe hai lần.
make progress|v phr|tiến bộ|I think I'm making progress with my English speaking.|Tôi nghĩ kỹ năng nói tiếng Anh của mình đang tiến bộ.|I have made a lot of progress in swimming since last year.|Tôi đã tiến bộ nhiều trong môn bơi kể từ năm ngoái.
make mistakes|v phr|mắc lỗi|I'm not afraid to make mistakes when I speak English.|Tôi không sợ mắc lỗi khi nói tiếng Anh.|I made many mistakes when I first learnt to cook.|Tôi đã mắc nhiều lỗi khi mới học nấu ăn.
gain experience|v phr|tích lũy kinh nghiệm|I want to gain more experience before I change my job.|Tôi muốn tích lũy thêm kinh nghiệm trước khi đổi việc.|Students can gain useful experience from part-time jobs.|Sinh viên có thể tích lũy kinh nghiệm hữu ích từ việc làm thêm.
meet a deadline|v phr|kịp hạn chót|Sometimes I have to stay late to meet a deadline.|Đôi khi tôi phải ở lại muộn để kịp hạn chót.|I use a calendar app to help me meet my deadlines.|Tôi dùng ứng dụng lịch để giúp mình hoàn thành công việc đúng hạn.
work overtime|v phr|làm thêm giờ|I usually work overtime at the end of the month.|Tôi thường làm thêm giờ vào cuối tháng.|My father often worked overtime when I was young.|Hồi tôi còn nhỏ, bố tôi thường làm thêm giờ.
earn a living|v phr|kiếm sống|In my hometown, most people earn a living from farming.|Ở quê tôi, hầu hết mọi người kiếm sống bằng nghề nông.|Many students earn a living by teaching children after school.|Nhiều sinh viên kiếm sống bằng cách dạy kèm trẻ em sau giờ học.
apply for a job|v phr|nộp đơn xin việc|I applied for my current job online.|Tôi đã nộp đơn cho công việc hiện tại qua mạng.|I wrote a formal email when I applied for a job.|Tôi đã viết một email trang trọng khi nộp đơn xin việc.
attend a class|v phr|tham gia lớp học|I attend an English class twice a week.|Tôi đi học lớp tiếng Anh hai buổi một tuần.|Last year, I attended a painting class at weekends.|Năm ngoái, tôi tham gia một lớp vẽ vào cuối tuần.
learn by heart|v phr|học thuộc lòng|At primary school, we had to learn poems by heart.|Ở tiểu học, chúng tôi phải học thuộc lòng các bài thơ.|I try to learn ten new words by heart every night.|Tối nào tôi cũng cố gắng học thuộc mười từ mới.
pay attention (to)|v phr|chú ý|My favourite teacher always made us pay attention in class.|Thầy cô mà tôi yêu quý nhất luôn khiến chúng tôi chú ý trong lớp.|You have to pay attention when you ride a motorbike in the city.|Bạn phải chú ý khi chạy xe máy trong thành phố.
take a break|v phr|nghỉ giải lao|I take a short break every two hours.|Cứ hai tiếng tôi lại nghỉ giải lao một chút.|I usually have a coffee when I take a break.|Tôi thường uống một ly cà phê khi nghỉ giải lao.
in my free time|prep phr|lúc rảnh rỗi|In my free time, I like reading books and drawing.|Lúc rảnh, tôi thích đọc sách và vẽ.|I don't have much free time, even at weekends.|Tôi không có nhiều thời gian rảnh, kể cả vào cuối tuần.
take up a hobby|v phr|bắt đầu một sở thích mới|Last year, I took up photography as a new hobby.|Năm ngoái, tôi bắt đầu chụp ảnh như một sở thích mới.|My mum took up yoga to stay healthy.|Mẹ tôi bắt đầu tập yoga để giữ sức khỏe.
play badminton / football|v phr|chơi cầu lông / bóng đá|I play badminton with my colleagues every Friday.|Thứ Sáu nào tôi cũng chơi cầu lông với đồng nghiệp.|I played football with my friends after school almost every day.|Hồi nhỏ, gần như ngày nào tôi cũng đá bóng với bạn sau giờ học.
go for a walk|v phr|đi dạo|I often go for a walk in the park near my house.|Tôi thường đi dạo trong công viên gần nhà.|After dinner, my family usually goes for a walk together.|Sau bữa tối, gia đình tôi thường cùng nhau đi dạo.
go shopping|v phr|đi mua sắm|I go shopping for clothes about once a month.|Khoảng một tháng tôi đi mua quần áo một lần.|My friends and I usually go shopping at the mall on Saturdays.|Tôi và bạn bè thường đi mua sắm ở trung tâm thương mại vào thứ Bảy.
watch a film|v phr|xem phim|I usually watch a film on my laptop before bed.|Tôi thường xem phim trên laptop trước khi đi ngủ.|On Saturday nights, I like to watch a film with my sister.|Vào tối thứ Bảy, tôi thích xem phim với chị/em gái.
listen to music|v phr|nghe nhạc|I listen to music on my way to work.|Tôi nghe nhạc trên đường đi làm.|Listening to music makes running much more fun.|Nghe nhạc làm cho việc chạy bộ vui hơn nhiều.
read for pleasure|v phr|đọc sách để giải trí|I don't read for pleasure very often because I'm busy.|Tôi không hay đọc sách giải trí vì bận.|As a child, I read for pleasure every day.|Hồi nhỏ, ngày nào tôi cũng đọc sách để giải trí.
surf the internet|v phr|lướt mạng|I surf the internet for about two hours a day.|Mỗi ngày tôi lướt mạng khoảng hai tiếng.|When I feel bored, I just surf the internet.|Khi thấy chán, tôi chỉ lên mạng lướt.
hang out with friends|v phr|đi chơi với bạn bè|I often hang out with my friends at a coffee shop.|Tôi thường đi chơi với bạn ở quán cà phê.|On Friday evenings, I like to hang out with friends.|Vào tối thứ Sáu, tôi thích đi chơi với bạn bè.
play video games|v phr|chơi trò chơi điện tử|My younger brother plays video games for hours every day.|Em trai tôi chơi game hàng giờ mỗi ngày.|I think playing video games can help children think faster.|Tôi nghĩ chơi game có thể giúp trẻ em suy nghĩ nhanh hơn.
take photos|v phr|chụp ảnh|I like taking photos of the sky in the evening.|Tôi thích chụp ảnh bầu trời vào buổi chiều tối.|I take a lot of photos when I travel.|Tôi chụp rất nhiều ảnh khi đi du lịch.
go camping|v phr|đi cắm trại|Last summer, my friends and I went camping near a lake.|Mùa hè năm ngoái, tôi và bạn bè đi cắm trại gần một cái hồ.|I never went camping when I was young.|Hồi nhỏ tôi chưa bao giờ đi cắm trại.
grow plants|v phr|trồng cây|I grow some small plants on my balcony.|Tôi trồng vài chậu cây nhỏ ở ban công.|My grandparents grow vegetables in their garden.|Ông bà tôi trồng rau trong vườn.
have fun|v phr|vui chơi, vui vẻ|We always have fun during the Tet holiday.|Chúng tôi luôn vui chơi thỏa thích trong dịp Tết.|We had a lot of fun at my birthday party last year.|Chúng tôi đã rất vui ở bữa tiệc sinh nhật của tôi năm ngoái.
eat out|v phr|ăn ở ngoài|My family eats out once a week, usually on Sunday.|Gia đình tôi đi ăn ngoài mỗi tuần một lần, thường là Chủ nhật.|I don't eat out much because I enjoy cooking at home.|Tôi không hay ăn ngoài vì tôi thích nấu ăn ở nhà.
cook a meal|v phr|nấu một bữa ăn|I can cook a simple meal like fried rice or noodle soup.|Tôi có thể nấu những bữa đơn giản như cơm chiên hay mì nước.|On Sundays, I cook a meal for my parents.|Vào Chủ nhật, tôi nấu một bữa cho bố mẹ.
a balanced diet|n phr|chế độ ăn cân bằng|I try to have a balanced diet with lots of vegetables.|Tôi cố gắng ăn uống cân bằng với nhiều rau.|It's not easy to have a balanced diet when you are busy at work.|Khi bận rộn công việc thì không dễ để ăn uống cân bằng.
junk food|n phr|đồ ăn không lành mạnh|I sometimes eat junk food when I don't have time to cook.|Thỉnh thoảng tôi ăn đồ ăn nhanh khi không có thời gian nấu.|When I was a teenager, I ate a lot of junk food.|Hồi tuổi teen, tôi ăn rất nhiều đồ ăn vặt không lành mạnh.
stay healthy|v phr|giữ sức khỏe|I drink a lot of water and walk every day to stay healthy.|Tôi uống nhiều nước và đi bộ mỗi ngày để giữ sức khỏe.|Playing sports is a good way to stay healthy.|Chơi thể thao là một cách tốt để giữ sức khỏe.
do exercise|v phr|tập thể dục|I do exercise for about 30 minutes every morning.|Sáng nào tôi cũng tập thể dục khoảng 30 phút.|Many old people do exercise in the park early in the morning.|Nhiều người lớn tuổi tập thể dục trong công viên vào sáng sớm.
cut down on|v phr|cắt giảm|I'm trying to cut down on sugar in my coffee.|Tôi đang cố bớt đường trong cà phê.|I want to cut down on the time I spend on my phone.|Tôi muốn giảm thời gian dùng điện thoại.
get enough sleep|v phr|ngủ đủ giấc|I don't always get enough sleep during the week.|Trong tuần tôi không phải lúc nào cũng ngủ đủ giấc.|Students should get enough sleep before an exam.|Học sinh nên ngủ đủ giấc trước kỳ thi.
catch a cold|v phr|bị cảm|I often catch a cold when the weather changes.|Tôi hay bị cảm khi thời tiết thay đổi.|I caught a cold after I got wet in the rain last week.|Tuần trước tôi bị cảm sau khi dầm mưa.
see a doctor|v phr|đi khám bác sĩ|I see a doctor once a year for a check-up.|Mỗi năm tôi đi khám sức khỏe tổng quát một lần.|I was scared to see a doctor when I was small.|Hồi nhỏ tôi rất sợ đi khám bác sĩ.
a home-cooked meal|n phr|bữa cơm nhà nấu|For me, nothing is better than a home-cooked meal.|Với tôi, không gì ngon bằng bữa cơm nhà nấu.|When I travel for a long time, I really miss home-cooked meals.|Khi đi xa lâu ngày, tôi rất nhớ cơm nhà.
a healthy lifestyle|n phr|lối sống lành mạnh|I want a healthier lifestyle, so I walk more now.|Tôi muốn sống lành mạnh hơn nên bây giờ tôi đi bộ nhiều hơn.|People in the countryside often have a healthy lifestyle.|Người ở nông thôn thường có lối sống lành mạnh.
keep fit|v phr|giữ dáng, giữ cơ thể khỏe mạnh|I go to the gym three times a week to keep fit.|Tôi đến phòng gym ba lần một tuần để giữ dáng.|Swimming is a great way to keep fit.|Bơi lội là một cách tuyệt vời để giữ cơ thể khỏe mạnh.
drink plenty of water|v phr|uống nhiều nước|In hot weather, you should drink plenty of water.|Khi trời nóng, bạn nên uống nhiều nước.|I keep a bottle on my desk so I drink plenty of water.|Tôi để một chai nước trên bàn làm việc để uống được nhiều nước.
street food|n phr|đồ ăn đường phố|Vietnamese street food is cheap and delicious.|Đồ ăn đường phố Việt Nam vừa rẻ vừa ngon.|When I visit a new city, I always try the street food.|Khi đến một thành phố mới, tôi luôn thử đồ ăn đường phố ở đó.
go on holiday|v phr|đi nghỉ mát|My family goes on holiday to the beach every summer.|Mùa hè nào gia đình tôi cũng đi nghỉ ở biển.|I can only go on holiday once a year because of my job.|Vì công việc, tôi chỉ có thể đi nghỉ mỗi năm một lần.
book a room|v phr|đặt phòng|I usually book a room online before my trip.|Tôi thường đặt phòng qua mạng trước chuyến đi.|Booking apps make it very easy to book a room.|Các ứng dụng đặt phòng giúp việc đặt phòng rất dễ dàng.
take a trip|v phr|đi một chuyến|Last month, I took a trip to Da Lat with my friends.|Tháng trước, tôi đi Đà Lạt với bạn bè.|Sometimes we take a short trip to the countryside at the weekend.|Thỉnh thoảng cuối tuần chúng tôi đi một chuyến ngắn về vùng quê.
a tourist attraction|n phr|điểm thu hút khách du lịch|The most famous tourist attraction in my hometown is the old market.|Điểm du lịch nổi tiếng nhất ở quê tôi là khu chợ cũ.|Museums are popular tourist attractions in big cities.|Bảo tàng là những điểm du lịch được ưa chuộng ở các thành phố lớn.
travel abroad|v phr|đi nước ngoài|I have never travelled abroad, but I really want to visit Japan.|Tôi chưa bao giờ ra nước ngoài, nhưng rất muốn đến Nhật Bản.|Learning English is very useful if you travel abroad.|Học tiếng Anh rất hữu ích nếu bạn đi nước ngoài.
pack my bags|v phr|xếp đồ, chuẩn bị hành lý|I always pack my bags the night before a trip.|Tôi luôn xếp hành lý vào tối hôm trước chuyến đi.|When I pack my bags, I always bring too many clothes.|Khi soạn hành lý, tôi lúc nào cũng mang quá nhiều quần áo.
public transport|n phr|phương tiện công cộng|I think public transport in my city should be better.|Tôi nghĩ phương tiện công cộng ở thành phố tôi nên tốt hơn.|Using public transport is good for the environment.|Đi phương tiện công cộng thì tốt cho môi trường.
heavy traffic|n phr|giao thông đông đúc|There is heavy traffic in the city centre every evening.|Tối nào trung tâm thành phố cũng đông xe.|I stay home on Saturday nights because of the heavy traffic.|Tôi ở nhà vào tối thứ Bảy vì đường quá đông xe.
rush hour|n phr|giờ cao điểm|The buses are very crowded during rush hour.|Xe buýt rất đông vào giờ cao điểm.|I leave the office a bit later to avoid rush hour.|Tôi rời văn phòng muộn hơn một chút để tránh giờ cao điểm.
a crowded place|n phr|nơi đông đúc|I don't like crowded places like shopping malls at weekends.|Tôi không thích những nơi đông đúc như trung tâm thương mại vào cuối tuần.|The flower street is a very crowded place during Tet.|Đường hoa là nơi rất đông người vào dịp Tết.
a quiet place|n phr|nơi yên tĩnh|I need a quiet place when I read.|Tôi cần một nơi yên tĩnh khi đọc sách.|My grandparents live in a quiet place far from the city.|Ông bà tôi sống ở một nơi yên tĩnh, xa thành phố.
get lost|v phr|bị lạc đường|I got lost the first time I visited Hanoi.|Lần đầu đến Hà Nội, tôi bị lạc đường.|I rarely get lost now because I use a map app on my phone.|Giờ tôi hiếm khi bị lạc vì dùng ứng dụng bản đồ trên điện thoại.
go sightseeing|v phr|đi tham quan|We went sightseeing all day in Hoi An.|Chúng tôi đi tham quan Hội An cả ngày.|I prefer to go sightseeing on foot.|Tôi thích đi bộ tham quan hơn.
explore a new place|v phr|khám phá nơi mới|I love exploring new places on my motorbike.|Tôi rất thích chạy xe máy đi khám phá những nơi mới.|When I moved house, I spent a week exploring the new area.|Khi chuyển nhà, tôi mất một tuần để khám phá khu vực mới.
local culture|n phr|văn hóa địa phương|I like to learn about the local culture when I travel.|Khi đi du lịch, tôi thích tìm hiểu văn hóa địa phương.|Festivals are a good way to understand the local culture.|Lễ hội là một cách tốt để hiểu văn hóa địa phương.
use social media|v phr|dùng mạng xã hội|I use social media mainly to see what my friends are doing.|Tôi dùng mạng xã hội chủ yếu để xem bạn bè đang làm gì.|Many young people get the news from social media now.|Ngày nay nhiều người trẻ đọc tin tức trên mạng xã hội.
send a message|v phr|gửi tin nhắn|I send messages to my family every day.|Ngày nào tôi cũng nhắn tin cho gia đình.|I'd rather send a message than call my friends.|Tôi thích nhắn tin cho bạn bè hơn là gọi điện.
make a phone call|v phr|gọi điện thoại|I make a phone call to my grandparents every Sunday.|Chủ nhật nào tôi cũng gọi điện cho ông bà.|At work, I make a lot of phone calls to customers.|Ở chỗ làm, tôi gọi điện cho khách hàng rất nhiều.
download an app|v phr|tải ứng dụng|I downloaded an app to learn Japanese.|Tôi đã tải một ứng dụng để học tiếng Nhật.|I have downloaded a weather app on my phone.|Tôi đã tải một ứng dụng thời tiết về điện thoại.
shop online|v phr|mua sắm trực tuyến|I shop online because it saves a lot of time.|Tôi mua sắm online vì nó tiết kiệm rất nhiều thời gian.|I don't like to shop online for clothes because they may not fit.|Tôi không thích mua quần áo online vì có thể không vừa.
keep in touch (with)|v phr|giữ liên lạc|I keep in touch with my school friends through Facebook.|Tôi giữ liên lạc với bạn học cũ qua Facebook.|It's easy to keep in touch with relatives who live far away.|Giữ liên lạc với họ hàng ở xa giờ rất dễ dàng.
watch the news|v phr|xem tin tức|My father watches the news on TV every evening.|Tối nào bố tôi cũng xem thời sự trên TV.|I watch the news on my phone while I have breakfast.|Tôi xem tin tức trên điện thoại trong lúc ăn sáng.
post photos|v phr|đăng ảnh|I rarely post photos on Instagram.|Tôi hiếm khi đăng ảnh lên Instagram.|Some people post photos of every meal they eat.|Có người đăng ảnh mọi bữa ăn của họ.
charge my phone|v phr|sạc điện thoại|I charge my phone every night before I sleep.|Tối nào tôi cũng sạc điện thoại trước khi ngủ.|I always bring a power bank to charge my phone on trips.|Tôi luôn mang theo sạc dự phòng để sạc điện thoại khi đi xa.
a fast internet connection|n phr|kết nối mạng nhanh|I have a fast internet connection, so I can work from home.|Nhà tôi có mạng nhanh nên tôi có thể làm việc tại nhà.|I usually choose cafés with a fast internet connection.|Tôi thường chọn những quán cà phê có wifi mạnh.
make life easier|v phr|làm cuộc sống dễ dàng hơn|Smartphones make life easier for everyone.|Điện thoại thông minh giúp cuộc sống của mọi người dễ dàng hơn.|A washing machine makes life much easier.|Máy giặt giúp cuộc sống dễ dàng hơn rất nhiều.
spend hours on|v phr|dành hàng giờ cho|My nephew spends hours on his tablet every day.|Cháu tôi ngồi máy tính bảng hàng giờ mỗi ngày.|I can spend hours on a drawing without getting bored.|Tôi có thể ngồi vẽ một bức tranh hàng giờ mà không thấy chán.
search for information|v phr|tìm kiếm thông tin|I search for information on Google when I don't know something.|Khi không biết điều gì, tôi tìm thông tin trên Google.|Students often search for information online for their homework.|Học sinh thường tìm thông tin trên mạng để làm bài tập.
go viral|v phr|lan truyền rất nhanh trên mạng|A video of my friend's cat went viral last year.|Năm ngoái, một video về con mèo của bạn tôi đã nổi rần rần trên mạng.|Some songs go viral on TikTok very quickly.|Có những bài hát lan truyền trên TikTok rất nhanh.
take a selfie|v phr|chụp ảnh tự sướng|I don't like taking selfies very much.|Tôi không thích chụp ảnh tự sướng lắm.|Tourists often take selfies in front of famous buildings.|Du khách thường chụp ảnh selfie trước các công trình nổi tiếng.
make friends|v phr|kết bạn|I make friends quite easily because I like talking.|Tôi kết bạn khá dễ vì tôi thích nói chuyện.|I made a lot of new friends at university.|Tôi đã quen được nhiều bạn mới ở đại học.
get on well with|v phr|hòa hợp với|I get on well with my younger sister.|Tôi rất hợp với em gái mình.|I get on well with all my colleagues.|Tôi hòa hợp với tất cả đồng nghiệp.
a close friend|n phr|bạn thân|I have three close friends from high school.|Tôi có ba người bạn thân từ hồi cấp ba.|My close friend never forgets my birthday.|Bạn thân tôi chưa bao giờ quên sinh nhật tôi.
have a lot in common|v phr|có nhiều điểm chung|My best friend and I have a lot in common; we both love rock music.|Tôi và bạn thân có nhiều điểm chung; cả hai đều mê nhạc rock.|I don't have much in common with my neighbours.|Tôi không có nhiều điểm chung với hàng xóm.
extended family|n phr|đại gia đình (họ hàng)|I visit my extended family during Tet every year.|Năm nào tôi cũng về thăm họ hàng vào dịp Tết.|In my hometown, many people live with their extended family.|Ở quê tôi, nhiều người sống chung với đại gia đình.
look after|v phr|chăm sóc|I look after my sister's cat when she is away.|Tôi chăm con mèo của chị/em gái khi cô ấy đi vắng.|My grandmother looked after me when I was a baby.|Bà tôi đã chăm sóc tôi khi tôi còn bé.
give advice|v phr|cho lời khuyên|My friends often ask me to give them advice.|Bạn bè thường nhờ tôi cho lời khuyên.|My English teacher gave me good advice about speaking.|Giáo viên tiếng Anh đã cho tôi lời khuyên hay về kỹ năng nói.
keep a promise|v phr|giữ lời hứa|I think a good friend always keeps a promise.|Tôi nghĩ một người bạn tốt luôn giữ lời hứa.|My father kept his promise and took me to the zoo.|Bố tôi đã giữ lời hứa và đưa tôi đi sở thú.
a sense of humour|n phr|khiếu hài hước|I like people with a good sense of humour.|Tôi thích những người có khiếu hài hước.|My favourite teacher had a great sense of humour.|Thầy cô tôi yêu quý nhất rất hài hước.
celebrate a birthday|v phr|tổ chức sinh nhật|I usually celebrate my birthday with a small dinner.|Tôi thường tổ chức sinh nhật bằng một bữa tối nhỏ.|Many people celebrate birthdays at restaurants these days.|Ngày nay nhiều người tổ chức sinh nhật ở nhà hàng.
give a gift|v phr|tặng quà|I like to give handmade gifts to my close friends.|Tôi thích tặng quà tự làm cho bạn thân.|At Tet, we usually give gifts to our relatives.|Vào dịp Tết, chúng tôi thường tặng quà cho họ hàng.
throw a party|v phr|tổ chức tiệc|My friends threw a surprise party for me last year.|Năm ngoái bạn bè đã tổ chức một bữa tiệc bất ngờ cho tôi.|We threw a small party when we moved into our new flat.|Chúng tôi tổ chức một bữa tiệc nhỏ khi chuyển vào căn hộ mới.
lend a hand|v phr|giúp một tay|My neighbours always lend a hand when I need help.|Hàng xóm luôn giúp một tay khi tôi cần.|I lend a hand in the kitchen when my mum cooks for Tet.|Tôi phụ mẹ trong bếp khi mẹ nấu đồ ăn Tết.
lose touch (with)|v phr|mất liên lạc|I lost touch with most of my primary school friends.|Tôi đã mất liên lạc với hầu hết bạn bè thời tiểu học.|After my cousin moved abroad, we lost touch.|Sau khi anh/chị họ tôi ra nước ngoài, chúng tôi mất liên lạc.
a role model|n phr|hình mẫu, tấm gương|My mother is my role model because she works very hard.|Mẹ là tấm gương của tôi vì bà làm việc rất chăm chỉ.|Famous athletes are role models for many children.|Các vận động viên nổi tiếng là hình mẫu của nhiều trẻ em.
move house|v phr|chuyển nhà|I have moved house three times in my life.|Tôi đã chuyển nhà ba lần trong đời.|We moved house when I was ten years old.|Gia đình tôi chuyển nhà khi tôi mười tuổi.
rent a flat|v phr|thuê căn hộ|I rent a small flat near my office.|Tôi thuê một căn hộ nhỏ gần chỗ làm.|Many students rent a flat together to save money.|Nhiều sinh viên thuê chung căn hộ để tiết kiệm tiền.
a cosy room|n phr|căn phòng ấm cúng|I have a small but cosy room with a big window.|Tôi có một căn phòng nhỏ nhưng ấm cúng với cửa sổ lớn.|My favourite café feels like a cosy room at home.|Quán cà phê yêu thích của tôi tạo cảm giác như một căn phòng ấm cúng ở nhà.
decorate the house|v phr|trang trí nhà cửa|We always decorate the house with flowers before Tet.|Chúng tôi luôn trang trí nhà bằng hoa trước Tết.|Some families decorate their house with lights at Christmas.|Một số gia đình trang trí nhà bằng đèn vào dịp Giáng sinh.
keep (something) tidy|v phr|giữ gọn gàng|I try to keep my room tidy, but it's not easy.|Tôi cố giữ phòng gọn gàng, nhưng không dễ chút nào.|I keep my desk tidy so I can find things quickly.|Tôi giữ bàn làm việc gọn gàng để tìm đồ nhanh hơn.
grow up|v phr|lớn lên|I grew up in a small town in the countryside.|Tôi lớn lên ở một thị trấn nhỏ vùng quê.|I grew up with a lot of cousins around me.|Tôi lớn lên giữa rất nhiều anh chị em họ.
a friendly neighbourhood|n phr|khu phố thân thiện|I live in a friendly neighbourhood where people say hello to each other.|Tôi sống trong một khu phố thân thiện, nơi mọi người chào hỏi nhau.|A friendly neighbourhood is a good place for kids to grow up.|Một khu phố thân thiện là nơi tốt để trẻ con lớn lên.
a busy street|n phr|con phố đông đúc, nhộn nhịp|My house is on a busy street with many shops.|Nhà tôi nằm trên một con phố đông đúc với nhiều cửa hàng.|Living on a busy street can be noisy at night.|Sống trên phố đông có thể ồn ào vào ban đêm.
the local market|n phr|chợ địa phương|My mum buys vegetables at the local market every morning.|Sáng nào mẹ tôi cũng mua rau ở chợ gần nhà.|The local market is the busiest place in my hometown.|Chợ là nơi nhộn nhịp nhất ở quê tôi.
tall buildings|n phr|tòa nhà cao tầng|There are more and more tall buildings in my city.|Thành phố tôi ngày càng có nhiều nhà cao tầng.|I like looking at the lights of tall buildings at night.|Tôi thích ngắm ánh đèn của các tòa nhà cao tầng vào ban đêm.
have a view of|v phr|có tầm nhìn ra|My flat has a view of the river.|Căn hộ của tôi có view nhìn ra sông.|I prefer hotel rooms that have a view of the sea.|Tôi thích phòng khách sạn có view nhìn ra biển.
a sense of community|n phr|tinh thần cộng đồng|In my village, there is a strong sense of community.|Ở làng tôi, tinh thần cộng đồng rất mạnh.|Local festivals help build a sense of community.|Lễ hội địa phương giúp gắn kết cộng đồng.
change a lot|v phr|thay đổi nhiều|My hometown has changed a lot in the last ten years.|Quê tôi đã thay đổi nhiều trong mười năm qua.|Mobile phones have changed a lot since I was a child.|Điện thoại di động đã thay đổi rất nhiều kể từ khi tôi còn nhỏ.
feel at home|v phr|cảm thấy như ở nhà|I always feel at home when I'm with my family.|Tôi luôn thấy bình yên như ở nhà khi ở bên gia đình.|The owner of my favourite café makes everyone feel at home.|Chủ quán cà phê tôi thích làm ai cũng thấy thoải mái như ở nhà.
do the shopping|v phr|đi chợ, mua đồ dùng hằng ngày|My dad does the shopping on Sunday mornings.|Bố tôi đi chợ vào sáng Chủ nhật.|I prefer to do the shopping at a supermarket because it's clean.|Tôi thích mua đồ ở siêu thị hơn vì sạch sẽ.
heavy rain|n phr|mưa to|There is heavy rain almost every afternoon in the rainy season.|Vào mùa mưa, gần như chiều nào cũng mưa to.|Heavy rain sometimes floods the streets near my house.|Mưa to đôi khi làm ngập các con đường gần nhà tôi.
strong wind|n phr|gió mạnh|We don't often have strong winds in my area.|Khu tôi ở không hay có gió mạnh.|As a child, I loved flying kites when there was a strong wind.|Hồi nhỏ, tôi rất thích thả diều những hôm gió lớn.
a sunny day|n phr|ngày nắng đẹp|On sunny days, I like to go to the beach.|Vào những ngày nắng, tôi thích đi biển.|A sunny day is perfect for taking photos outside.|Ngày nắng đẹp rất hợp để chụp ảnh ngoài trời.
hot and humid|adj phr|nóng ẩm|The weather in the south is hot and humid most of the year.|Thời tiết miền Nam nóng ẩm gần như quanh năm.|It's hard to sleep well when it's hot and humid.|Rất khó ngủ ngon khi trời nóng ẩm.
the weather forecast|n phr|dự báo thời tiết|I check the weather forecast before I go out.|Tôi xem dự báo thời tiết trước khi ra ngoài.|The weather forecast helps me plan my trips.|Dự báo thời tiết giúp tôi lên kế hoạch cho chuyến đi.
fresh air|n phr|không khí trong lành|I go to the park in the morning to enjoy the fresh air.|Buổi sáng tôi ra công viên để tận hưởng không khí trong lành.|In the countryside, you can breathe fresh air every day.|Ở nông thôn, ngày nào bạn cũng được hít thở không khí trong lành.
protect the environment|v phr|bảo vệ môi trường|I think everyone should do something to protect the environment.|Tôi nghĩ ai cũng nên làm gì đó để bảo vệ môi trường.|I bring my own bag to the supermarket to protect the environment.|Tôi mang túi riêng khi đi siêu thị để bảo vệ môi trường.
air pollution|n phr|ô nhiễm không khí|Air pollution is a big problem in my city.|Ô nhiễm không khí là vấn đề lớn ở thành phố tôi.|Too many motorbikes cause air pollution.|Quá nhiều xe máy gây ô nhiễm không khí.
recycle rubbish|v phr|tái chế rác|My family recycles plastic bottles and paper.|Gia đình tôi tái chế chai nhựa và giấy.|Our school taught us how to recycle rubbish properly.|Trường học đã dạy chúng tôi cách tái chế rác đúng cách.
save energy|v phr|tiết kiệm năng lượng|I always turn off the lights to save energy.|Tôi luôn tắt đèn để tiết kiệm điện.|I set the air conditioner to 26 degrees to save energy.|Tôi để máy lạnh 26 độ để tiết kiệm điện.
throw away|v phr|vứt bỏ|I give my old clothes to charity instead of throwing them away.|Tôi đem quần áo cũ đi từ thiện thay vì vứt đi.|I hate throwing away food, so I only cook what I need.|Tôi ghét phải bỏ thức ăn nên chỉ nấu vừa đủ.
beautiful scenery|n phr|phong cảnh đẹp|Da Lat has beautiful scenery, especially in the early morning.|Đà Lạt có phong cảnh rất đẹp, nhất là vào sáng sớm.|I love hiking because of the beautiful scenery.|Tôi mê leo núi vì phong cảnh đẹp.
go swimming|v phr|đi bơi|I go swimming at the local pool every Sunday.|Chủ nhật nào tôi cũng đi bơi ở hồ bơi gần nhà.|When I go to the beach, I go swimming in the sea every day.|Khi đi biển, ngày nào tôi cũng tắm biển.
watch the sunset|v phr|ngắm hoàng hôn|I love watching the sunset from my balcony.|Tôi rất thích ngắm hoàng hôn từ ban công nhà mình.|My friends and I sometimes watch the sunset by the river.|Thỉnh thoảng tôi và bạn bè ngắm hoàng hôn bên bờ sông.
keep a pet|v phr|nuôi thú cưng|I keep a small cat, and she sleeps on my bed every night.|Tôi nuôi một con mèo nhỏ, đêm nào nó cũng ngủ trên giường tôi.|It's difficult to keep a pet in a small flat.|Rất khó nuôi thú cưng trong một căn hộ nhỏ.
save money|v phr|tiết kiệm tiền|I save money by cooking at home instead of eating out.|Tôi tiết kiệm tiền bằng cách nấu ăn ở nhà thay vì ăn ngoài.|Taking the bus helps me save money every month.|Đi xe buýt giúp tôi tiết kiệm tiền mỗi tháng.
spend money on|v phr|tiêu tiền vào|I spend most of my money on food and coffee.|Tôi tiêu phần lớn tiền vào đồ ăn và cà phê.|I don't mind spending money on good books.|Tôi không tiếc tiền mua sách hay.
get a good deal|v phr|mua được giá hời|I got a good deal on my laptop during a big sale.|Tôi mua được chiếc laptop với giá hời trong một đợt giảm giá lớn.|You can get a good deal if you bargain at the market.|Bạn có thể mua được giá tốt nếu trả giá ở chợ.
can't afford to|v phr|không đủ tiền để|I can't afford to buy a car right now.|Hiện giờ tôi không đủ tiền mua xe hơi.|Many students can't afford to travel abroad.|Nhiều sinh viên không đủ tiền đi du lịch nước ngoài.
pay in cash|v phr|trả bằng tiền mặt|At the local market, most people pay in cash.|Ở chợ, hầu hết mọi người trả bằng tiền mặt.|I rarely pay in cash now because I pay with my phone.|Giờ tôi hiếm khi dùng tiền mặt vì thanh toán bằng điện thoại.
go window shopping|v phr|đi ngắm đồ (không mua)|I like to go window shopping with my sister at the mall.|Tôi thích đi dạo ngắm đồ ở trung tâm thương mại với chị/em gái.|Window shopping is a cheap way to spend a weekend afternoon.|Đi ngắm đồ là cách rẻ để giết thời gian một buổi chiều cuối tuần.
a reasonable price|n phr|giá cả hợp lý|The restaurant near my office has good food at a reasonable price.|Nhà hàng gần chỗ làm của tôi có đồ ăn ngon với giá hợp lý.|I usually buy clothes online at a reasonable price.|Tôi thường mua quần áo online với giá hợp lý.
feel stressed|v phr|cảm thấy căng thẳng|I feel stressed when I have too much work.|Tôi thấy căng thẳng khi có quá nhiều việc.|Many students feel stressed before their exams.|Nhiều học sinh cảm thấy căng thẳng trước kỳ thi.
feel relaxed|v phr|cảm thấy thư giãn|Soft music makes me feel relaxed after a long day.|Nhạc nhẹ giúp tôi thấy thư giãn sau một ngày dài.|I feel really relaxed when I'm on holiday by the sea.|Tôi thấy rất thư thái khi đi nghỉ ở biển.
get bored|v phr|cảm thấy chán|I get bored easily if I stay at home all day.|Tôi dễ thấy chán nếu ở nhà cả ngày.|I get bored when a film is too long.|Tôi thấy chán khi phim quá dài.
lose interest in|v phr|mất hứng thú với|I lost interest in playing the piano when I was fifteen.|Tôi mất hứng thú với việc chơi piano khi mười lăm tuổi.|I lost interest in TV after I started using YouTube.|Tôi không còn hứng thú với TV kể từ khi dùng YouTube.
take a deep breath|v phr|hít thở sâu|Before I speak in front of people, I take a deep breath.|Trước khi nói trước đám đông, tôi hít một hơi thật sâu.|In my yoga class, we take deep breaths to relax.|Trong lớp yoga, chúng tôi hít thở sâu để thư giãn.
in a good mood|prep phr|tâm trạng vui vẻ|Sunny weather always puts me in a good mood.|Trời nắng đẹp luôn khiến tôi vui vẻ.|I'm in a good mood when I have a nice breakfast.|Tôi thấy vui khi có một bữa sáng ngon.
be crazy about|v phr|mê mẩn, cực kỳ thích|My brother is crazy about football.|Anh/em trai tôi mê bóng đá như điên.|I was crazy about K-pop when I was a teenager.|Hồi tuổi teen, tôi cực kỳ mê K-pop.
look forward to|v phr|mong chờ|I'm really looking forward to my next holiday.|Tôi rất mong đến kỳ nghỉ tiếp theo.|Children always look forward to Tet because they get lucky money.|Trẻ con luôn mong Tết vì được nhận lì xì.
`;

const seen = new Set();
const cards = [];
let noIpa = 0;
for (const line of DATA.split("\n").map((l) => l.trim()).filter(Boolean)) {
  const parts = line.split("|").map((p) => p.trim());
  if (parts.length !== 7 || parts.some((p) => !p)) throw new Error("Dòng lỗi: " + line);
  const [word, pos, vi, ex1, vi1, ex2, vi2] = parts;
  const key = word.toLowerCase();
  if (seen.has(key)) throw new Error("Trùng cụm: " + word);
  seen.add(key);
  const pron = phraseIpa(word);
  if (!pron) noIpa++;
  cards.push({
    id: `collocations-${String(cards.length + 1).padStart(4, "0")}`,
    word,
    meaning:
      `Phiên âm: (${pos})${pron ? " " + pron : ""}\n` +
      `Nghĩa: ${vi}\n` +
      `Ví dụ: "${ex1}" (${vi1})\n"${ex2}" (${vi2})`,
    deck: DECK,
    status: "new",
  });
}
console.log(`${cards.length} thẻ cho chủ đề "${DECK}" (${noIpa} thẻ không dựng được IPA).`);
cards.filter((c) => !c.meaning.split("\n")[0].includes("/")).forEach((c) => console.log("  thiếu IPA:", c.word));

const { data: existing, error: loadErr } = await supabase
  .from("cards")
  .select("id,word")
  .eq("deck", DECK);
if (loadErr) throw loadErr;
const existingIds = new Set(existing.map((c) => String(c.id)));
const existingWords = new Set(existing.map((c) => String(c.word).toLowerCase()));
const toInsert = cards.filter(
  (c) => !existingIds.has(c.id) && !existingWords.has(c.word.toLowerCase()),
);
console.log(`Chủ đề hiện có ${existing.length} thẻ → cần thêm ${toInsert.length}.`);
toInsert.slice(0, 2).forEach((c) => console.log(JSON.stringify(c)));

if (!APPLY) {
  console.log("\nDRY-RUN — chưa ghi gì. Chạy lại với --apply để ghi thật.");
  // --show: in dòng Phiên âm của mọi thẻ để soát IPA
  if (process.argv.includes("--show")) cards.forEach((c) => console.log(c.word, "→", c.meaning.split("\n")[0]));
  process.exit(0);
}
if (toInsert.length) {
  const { error } = await supabase.from("cards").insert(toInsert);
  if (error) throw error;
}
const { count } = await supabase
  .from("cards")
  .select("id", { count: "exact", head: true })
  .eq("deck", DECK);
console.log(`Xong. Chủ đề giờ có ${count} thẻ.`);
