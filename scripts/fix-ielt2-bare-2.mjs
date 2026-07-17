import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// IELT LỚP 2 - phần 2 (nốt các thẻ chỉ có mỗi nghĩa tiếng Việt).
// Nghĩa tiếng Việt gốc giữ nguyên; phiên âm (giọng Anh), loại từ và câu ví dụ do tôi soạn,
// bám ngữ cảnh bài đọc IELTS gốc (nước sạch, thư viện, năng lượng mặt trời).
// id -> [loại từ, phiên âm, ví dụ tiếng Anh, bản dịch]
const DATA = {
  "1783947327091-1":  ["n", "/kənˈteɪnə/", "She filled the container with water from the well.", "Cô ấy đổ đầy nước từ giếng vào chiếc bình chứa."],
  "1783947327091-2":  ["n", "/ˈdʒɜːni/", "The journey to the nearest river takes two hours on foot.", "Hành trình đến con sông gần nhất mất hai tiếng đi bộ."],
  "1783947327091-3":  ["n", "/ˈdɪstrɪkt/", "This district has no clean water supply at all.", "Khu vực này hoàn toàn không có nguồn nước sạch."],
  "1783947327091-4":  ["adj", "/ˌsaʊθ ˈwestən/", "The village lies in the south-western part of the country.", "Ngôi làng nằm ở phía tây nam của đất nước."],
  "1783947327091-5":  ["phr", "/ɪn ˈpɑːt/", "The problem is caused in part by the long dry season.", "Vấn đề một phần là do mùa khô kéo dài gây ra."],
  "1783947327091-6":  ["v phr", "/ˌfetʃ ˈwɔːtə/", "The children walk five kilometres to fetch water every morning.", "Bọn trẻ đi bộ năm ki-lô-mét để gánh nước mỗi sáng."],
  "1783947327091-7":  ["adj", "/ʌnˈseɪf/", "The river water is unsafe to drink without boiling.", "Nước sông không an toàn để uống nếu chưa đun sôi."],
  "1783947327091-8":  ["n", "/draʊt/", "The drought lasted for three months and the wells dried up.", "Đợt hạn hán kéo dài ba tháng và các giếng nước cạn khô."],
  "1783947327091-9":  ["v", "/kənˈtɪnjuː/", "The work will continue until the dam is finished.", "Công việc sẽ tiếp tục cho đến khi con đập hoàn thành."],
  "1783947327091-10": ["n", "/fləʊ/", "The flow of the river becomes very weak in summer.", "Dòng chảy của con sông trở nên rất yếu vào mùa hè."],
  "1783947327091-11": ["v", "/rɪˈdjuːs/", "The new pipes reduce the time spent collecting water.", "Những đường ống mới giảm bớt thời gian đi lấy nước."],
  "1783947327091-12": ["n phr", "/dɪˌveləpt ˈpɑːts/", "In the developed parts of the world, clean water is taken for granted.", "Ở các khu vực phát triển trên thế giới, nước sạch được coi là điều hiển nhiên."],
  "1783947327091-13": ["phr v", "/ˌtɜːn ˈɒn/", "You just turn on the tap and the water is there.", "Bạn chỉ cần mở vòi là có nước."],
  "1783947327091-14": ["n", "/tæp/", "There is no tap in the house; they carry every drop.", "Trong nhà không có vòi nước; họ phải xách từng giọt."],
  "1783947327091-15": ["v", "/pɔː/", "She poured the water carefully into the bottle.", "Cô ấy rót nước cẩn thận vào chai."],
  "1783947327091-16": ["adj", "/əˈbʌndənt/", "Water is abundant here during the rainy season.", "Nước dồi dào ở đây trong mùa mưa."],
  "1783947327091-17": ["n", "/ˈækses/", "Only half of the village has access to clean water.", "Chỉ một nửa ngôi làng được tiếp cận nước sạch."],
  "1783947327091-18": ["adv", "/ˌfɜːðəˈmɔː/", "Furthermore, dirty water causes many serious diseases.", "Hơn nữa, nước bẩn gây ra nhiều bệnh nghiêm trọng."],
  "1783947327091-19": ["phr v", "/ˌɡet ˈrɪd əv/", "The village needs a safe way to get rid of human waste.", "Ngôi làng cần một cách an toàn để loại bỏ chất thải của con người."],
  "1783947327091-20": ["n phr", "/ˌhjuːmən ˈweɪst/", "Human waste often pollutes the river near the village.", "Chất thải của con người thường làm ô nhiễm con sông gần làng."],
  "1783947327091-21": ["adj", "/pəˈluːtɪd/", "The only river nearby is badly polluted.", "Con sông duy nhất gần đó bị ô nhiễm nặng."],
  "1783947327091-22": ["phr", "/ˈlæk əv/", "The lack of clean water affects the children most.", "Sự thiếu hụt nước sạch ảnh hưởng đến trẻ em nhiều nhất."],
  "1783947327091-23": ["adj", "/ˈprɒpə/", "The village has no proper toilets or drains.", "Ngôi làng không có nhà vệ sinh hay cống rãnh đúng nghĩa."],
  "1783947327091-24": ["n", "/ˈhaɪdʒiːn/", "Good hygiene can prevent most of these illnesses.", "Vệ sinh tốt có thể ngăn ngừa phần lớn những căn bệnh này."],
  "1783947327091-25": ["n", "/ˌsænɪˈteɪʃn/", "Poor sanitation is the main cause of disease here.", "Hệ thống vệ sinh kém là nguyên nhân chính gây bệnh ở đây."],
  "1783947327091-26": ["v", "/kɔːz/", "Dirty water causes thousands of deaths every year.", "Nước bẩn gây ra hàng nghìn cái chết mỗi năm."],
  "1783947327091-27": ["n", "/dɪˈziːz/", "This disease spreads quickly where water is dirty.", "Căn bệnh này lây lan nhanh ở những nơi nước bẩn."],
  "1783947327091-28": ["adv", "/ˈænjuəli/", "The charity builds about twenty wells annually.", "Tổ chức từ thiện xây khoảng hai mươi cái giếng hàng năm."],
  "1783947327091-29": ["adj", "/əkˈsesəbl/", "The well is accessible to every family in the village.", "Cái giếng có thể tiếp cận được với mọi gia đình trong làng."],
  "1783947327091-30": ["adj", "/ˈplentɪfl/", "After the dam was built, water became plentiful.", "Sau khi con đập được xây, nước trở nên dồi dào."],
  "1783947327091-31": ["v", "/trænsˈfɔːm/", "Clean water can transform the life of a whole village.", "Nước sạch có thể thay đổi hoàn toàn cuộc sống của cả một ngôi làng."],
  "1783947327091-32": ["adv", "/ˈpriːviəsli/", "Previously, the women spent six hours a day carrying water.", "Trước đây, những người phụ nữ dành sáu tiếng mỗi ngày để gánh nước."],
  "1783947327091-33": ["n phr", "/ˈhɔːlɪŋ ˌwɔːtə/", "Hauling water left the women no time for other work.", "Việc kéo nước nặng nhọc khiến những người phụ nữ không còn thời gian làm việc khác."],
  "1783947327091-34": ["v", "/ˈkʌltɪveɪt/", "Now they can cultivate vegetables all year round.", "Giờ họ có thể trồng rau quanh năm."],
  "1783947327091-35": ["n", "/krɒps/", "The crops died because there was no rain.", "Mùa màng chết vì không có mưa."],
  "1783947327092-36": ["v phr", "/ˌreɪz ˈænɪmlz/", "With enough water, families can raise animals as well.", "Có đủ nước, các gia đình cũng có thể chăn nuôi động vật."],
  "1783947327092-37": ["adj", "/ʌnˈwel/", "Many children are unwell because of the dirty water.", "Nhiều đứa trẻ bị ốm vì nước bẩn."],
  "1783947327092-38": ["v", "/kəˈlekt/", "The girls collect water before going to school.", "Các bé gái đi lấy nước trước khi đến trường."],
  "1783947327092-39": ["n", "/ˈsɪblɪŋz/", "She looks after her younger siblings while her mother works.", "Cô bé chăm sóc các em ruột trong lúc mẹ đi làm."],
  "1783947327092-40": ["v", "/prɪˈvent/", "A clean water supply prevents many common diseases.", "Nguồn nước sạch ngăn ngừa nhiều bệnh thường gặp."],
  "1783947327092-41": ["n", "/ɪkˈspɪəriəns/", "Living in the village was a new experience for the engineers.", "Sống trong làng là một trải nghiệm mới với các kỹ sư."],
  "1783947327092-42": ["n", "/ˈtʃælɪndʒ/", "Finding water in the dry season is a real challenge.", "Tìm nước vào mùa khô là một thử thách thực sự."],
  "1783947327092-43": ["n phr", "/rɪˌməʊt ˈvɪlɪdʒ/", "The team travelled two days to reach the remote village.", "Nhóm đi hai ngày mới đến được ngôi làng hẻo lánh."],
  "1783947327092-44": ["adj", "/ˌəʊvəˈwelmɪŋ/", "The amount of work at first seemed overwhelming.", "Khối lượng công việc lúc đầu có vẻ quá sức."],
  "1783947327092-45": ["v", "/ləʊˈkeɪt/", "Experts use special tools to locate water underground.", "Các chuyên gia dùng công cụ đặc biệt để định vị nước dưới lòng đất."],
  "1783947327092-46": ["adj", "/ˈʌndəɡraʊnd/", "There is plenty of underground water in this valley.", "Có rất nhiều nước ngầm trong thung lũng này."],
  "1783947327092-48": ["n phr", "/ˌdiːp ˈwel/", "A deep well costs far more than a sand dam.", "Một cái giếng sâu tốn kém hơn nhiều so với đập cát."],
  "1783947327092-49": ["v", "/rɪˈkwaɪə/", "Deep wells require expensive machines and trained workers.", "Giếng sâu đòi hỏi máy móc đắt tiền và công nhân được đào tạo."],
  "1783947327092-50": ["n phr", "/ˌdʒiːəˈlɒdʒɪkl ˌekspɜːˈtiːz/", "Drilling a deep well needs geological expertise.", "Khoan một cái giếng sâu cần chuyên môn về địa chất."],
  "1783947327092-51": ["adj", "/ɪkˈspensɪv/", "The machines are far too expensive for the village.", "Những cỗ máy đó quá đắt đỏ đối với ngôi làng."],
  "1783947327092-52": ["n phr", "/ˌhevi məˈʃiːnz/", "Heavy machines cannot reach the village in the rainy season.", "Máy móc hạng nặng không thể vào làng trong mùa mưa."],
  "1783947327092-53": ["adj", "/əˈbændənd/", "The broken pump was abandoned after only two years.", "Chiếc bơm hỏng bị bỏ hoang chỉ sau hai năm."],
  "1783947327092-54": ["v", "/ˈlɪtə/", "Broken pumps litter the countryside across the region.", "Những chiếc bơm hỏng nằm rải rác khắp vùng nông thôn."],
  "1783947327092-55": ["n phr", "/dɪˌveləpɪŋ ˈwɜːld/", "Millions of people in the developing world have no clean water.", "Hàng triệu người ở thế giới đang phát triển không có nước sạch."],
  "1783947327092-56": ["n phr", "/ˈwɔːtə skiːm/", "The water scheme serves five villages at once.", "Hệ thống cấp nước phục vụ năm ngôi làng cùng lúc."],
  "1783947327092-57": ["phr v", "/ˌbreɪk ˈdaʊn/", "If the pump breaks down, nobody can repair it.", "Nếu máy bơm bị hỏng, không ai sửa được."],
  "1783947327092-58": ["phr v", "/ˌmuːv ˈɒn/", "The engineers move on once the work is done.", "Các kỹ sư rời đi khi công việc hoàn tất."],
  "1783947327092-59": ["v phr", "/rɪˌpeə ˈləʊkəli/", "The pump is simple enough to repair locally.", "Máy bơm đủ đơn giản để sửa chữa tại địa phương."],
  "1783947327092-60": ["n phr", "/ˌspeə ˈpɑːts/", "Spare parts are hard to find in remote areas.", "Linh kiện thay thế rất khó kiếm ở vùng sâu vùng xa."],
  "1783947327092-61": ["n", "/ˈkæpɪtl/", "The spare parts must be ordered from the capital.", "Linh kiện phải đặt mua từ thủ đô."],
  "1783947327092-62": ["n phr", "/ˌnɒn ˈprɒfɪt ˌɔːɡənaɪˈzeɪʃn/", "A non-profit organisation paid for the whole project.", "Một tổ chức phi lợi nhuận đã chi trả cho toàn bộ dự án."],
  "1783947327092-63": ["v", "/ˈtækl/", "The charity tries to tackle the water problem at its root.", "Tổ chức từ thiện cố gắng giải quyết vấn đề nước từ gốc rễ."],
  "1783947327092-64": ["n", "/əˈprəʊtʃ/", "Their approach is to let the village lead the work.", "Phương pháp tiếp cận của họ là để ngôi làng dẫn dắt công việc."],
  "1783947327092-66": ["phr", "/ˌpruːvn tə ˈlɑːst/", "Sand dams are simple and proven to last for decades.", "Đập cát đơn giản và được chứng minh là bền vững hàng chục năm."],
  "1783947327092-67": ["n phr", "/ˈsænd dæm/", "A sand dam stores water inside the sand behind it.", "Đập cát trữ nước ngay bên trong lớp cát phía sau nó."],
  "1783947327092-68": ["v", "/ˈkæptʃə/", "The dam captures rainwater before it runs away.", "Con đập giữ lại nước mưa trước khi nó chảy đi mất."],
  "1783947327092-69": ["v", "/ˈfɪltə/", "The sand filters the water and keeps it clean.", "Cát lọc nước và giữ cho nước sạch."],
  "1783947327092-70": ["n", "/ˈreɪnwɔːtə/", "Rainwater is stored in the sand for the dry months.", "Nước mưa được trữ trong cát để dùng cho những tháng khô hạn."],
  "1783947327092-197": ["v phr", "/ˌtʃɑːdʒ nəʊ ˈfiː/", "The library charges no fee for borrowing books.", "Thư viện không thu phí khi mượn sách."],
  "1783947327092-198": ["n", "/ˈsɜːvɪs/", "The library offers a free service to all residents.", "Thư viện cung cấp một dịch vụ miễn phí cho mọi cư dân."],
  "1783947327092-199": ["adj", "/əˈveɪləbl/", "These books are available in the reading room only.", "Những cuốn sách này chỉ có sẵn trong phòng đọc."],
  "1783947327092-200": ["phr", "/wɪˌðɪn ðə ˈlɪmɪts əv/", "The library buys new books within the limits of its budget.", "Thư viện mua sách mới trong giới hạn ngân sách của mình."],
  "1783947327092-201": ["n", "/ˈbʌdʒɪt/", "The library has a small budget for new books each year.", "Thư viện có một khoản ngân sách nhỏ để mua sách mới mỗi năm."],
  "1783947327092-202": ["phr", "/ə ˌwaɪd vəˈraɪəti əv/", "The library holds a wide variety of magazines and maps.", "Thư viện lưu giữ vô số loại tạp chí và bản đồ khác nhau."],
  "1783947327092-203": ["n", "/məˈtɪəriəlz/", "Students can borrow study materials for two weeks.", "Sinh viên có thể mượn tài liệu học trong hai tuần."],
  "1783947327092-204": ["v", "/ˈbɒrəʊ/", "You can borrow up to six books at a time.", "Bạn có thể mượn tối đa sáu cuốn sách một lần."],
  "1783947327092-205": ["phr", "/ˌteɪkən ˈaʊt/", "Reference books cannot be taken out of the library.", "Sách tra cứu không được mang ra khỏi thư viện."],
  "1783947327092-206": ["n phr", "/spəˌsɪfɪk ˈtaɪm/", "Books must be returned within a specific time.", "Sách phải được trả trong một thời gian cụ thể."],
  "1783947327092-207": ["pron", "/ˈeniwʌn/", "Anyone living in the town can join the library.", "Bất cứ ai sống trong thị trấn đều có thể đăng ký thư viện."],
  "1783947327092-208": ["v/n", "/ləʊn/", "The library will loan you the book for three weeks.", "Thư viện sẽ cho bạn mượn cuốn sách trong ba tuần."],
  "1783947327092-210": ["n phr", "/ˈsəʊlə kəˌlektə/", "The solar collector turns sunlight into useful heat.", "Bộ thu năng lượng mặt trời biến ánh nắng thành nhiệt hữu ích."],
  "1783947327092-212": ["n", "/hiːt/", "The panel traps the heat from the sun.", "Tấm pin giữ lại sức nóng từ mặt trời."],
  "1783947327092-213": ["n phr", "/ˈsʌnz reɪz/", "The sun's rays fall directly on the flat plate.", "Các tia nắng mặt trời chiếu trực tiếp vào tấm phẳng."],
  "1783947327092-214": ["adv", "/ɪˈfektɪvli/", "The system heats water effectively even on cloudy days.", "Hệ thống làm nóng nước một cách hiệu quả ngay cả những ngày nhiều mây."],
  "1783947327092-215": ["v phr", "/ˌkuːl ˈbɪldɪŋz/", "Solar energy can also be used to cool buildings.", "Năng lượng mặt trời cũng có thể được dùng để làm mát các tòa nhà."],
  "1783947327092-216": ["n phr", "/ˌməʊst kɒmən ˈtaɪp/", "The flat plate is the most common type of collector.", "Tấm phẳng là loại bộ thu phổ biến nhất."],
  "1783947327092-217": ["n phr", "/ˈspeɪs ˌhiːtɪŋ/", "Solar panels are often used for space heating in winter.", "Các tấm pin mặt trời thường được dùng để sưởi ấm không gian vào mùa đông."],
  "1783947327092-218": ["n phr", "/ˌflæt ˈpleɪt/", "The flat plate absorbs the heat from the sun.", "Tấm phẳng hấp thụ nhiệt từ mặt trời."],
  "1783947327092-219": ["phr", "/dɪˈzaɪnd tuː/", "The collector is designed to absorb as much heat as possible.", "Bộ thu được thiết kế để hấp thụ càng nhiều nhiệt càng tốt."],
  "1783947327092-221": ["phr", "/ˌfɔːl dɪˈrektli ɒn/", "The sunlight must fall directly on the panel.", "Ánh nắng phải chiếu trực tiếp vào tấm pin."],
  "1783947327092-222": ["phr", "/əz ˈwel əz/", "The plate absorbs direct light as well as scattered light.", "Tấm hấp thụ ánh sáng trực tiếp cũng như ánh sáng bị phân tán."],
  "1783947327092-223": ["adj", "/ˈskætəd/", "Some light is scattered by clouds before it reaches the panel.", "Một phần ánh sáng bị mây làm phân tán trước khi tới tấm pin."],
  "1783947327092-224": ["n", "/ˈætməsfɪə/", "The atmosphere scatters part of the sunlight.", "Bầu khí quyển làm phân tán một phần ánh nắng."],
  "1783947327092-226": ["n", "/ˌæljəˈmɪniəm/", "The plate is usually made of aluminium or copper.", "Tấm thường được làm bằng nhôm hoặc đồng."],
  "1783947327092-227": ["n", "/ˈkɒpə/", "Copper carries heat better than most other metals.", "Đồng dẫn nhiệt tốt hơn phần lớn các kim loại khác."],
  "1783947327092-228": ["n", "/stiːl/", "Steel is cheaper but heavier than aluminium.", "Thép rẻ hơn nhưng nặng hơn nhôm."],
  "1783947327092-229": ["n", "/peɪnt/", "A layer of black paint helps the plate absorb more heat.", "Một lớp sơn đen giúp tấm hấp thụ nhiệt nhiều hơn."],
  "1783947327092-230": ["n", "/ˈkʌlərɪŋ/", "The black colouring of the plate is not just for looks.", "Màu đen của tấm không chỉ để cho đẹp."],
  "1783947327092-232": ["n", "/rɪˈflekʃn/", "A dark surface reduces reflection and keeps the heat.", "Bề mặt sẫm màu làm giảm sự phản xạ và giữ lại nhiệt."],
  "1783947327092-233": ["v", "/ɪnˈkʌrɪdʒ/", "The black coating encourages the plate to absorb heat.", "Lớp phủ đen thúc đẩy tấm hấp thụ nhiệt."],
  "1783947327092-234": ["n", "/əbˈzɔːpʃn/", "The absorption of heat is highest when the plate is black.", "Sự hấp thụ nhiệt cao nhất khi tấm có màu đen."],
  "1783947327092-236": ["v phr", "/ˌpleɪs bɪˈhaɪnd/", "Insulation is placed behind the plate to stop heat loss.", "Vật liệu cách nhiệt được đặt ở phía sau tấm để chặn thất thoát nhiệt."],
  "1783947327092-237": ["n phr", "/ˈhiːt lɒs/", "Insulation reduces heat loss through the back of the collector.", "Vật liệu cách nhiệt làm giảm sự thất thoát nhiệt qua mặt sau của bộ thu."],
};

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

const isStd = (m) => /^Phiên âm:/m.test(m || "");

async function run() {
  const apply = process.argv.includes("--apply");
  const cards = await loadAll();
  const byId = new Map(cards.map((c) => [c.id, c]));
  const updates = [];
  const problems = [];

  for (const [id, [pos, ipa, exEn, exVi]] of Object.entries(DATA)) {
    const c = byId.get(id);
    if (!c) { problems.push(`Không tìm thấy ${id}`); continue; }
    if (isStd(c.meaning)) { problems.push(`${id} (${c.word}) đã chuẩn rồi, không ghi đè`); continue; }
    const vi = (c.meaning || "").trim();
    if (!vi) { problems.push(`${id} (${c.word}): nghĩa gốc rỗng`); continue; }
    if (vi.includes("\n")) { problems.push(`${id} (${c.word}): nghĩa gốc nhiều dòng -> ${JSON.stringify(vi)}`); continue; }
    // So khớp sau khi bỏ hết ký tự không phải chữ cái ở CẢ HAI VẾ, nếu không
    // "non-profit" / "sun's" sẽ báo nhầm là ví dụ không chứa từ.
    const head = c.word.toLowerCase().split(/[\s/(]/)[0].replace(/[^a-z]/g, "").slice(0, 4);
    const exFlat = exEn.toLowerCase().replace(/[^a-z]/g, "");
    if (head.length >= 4 && !exFlat.includes(head)) problems.push(`${id} (${c.word}): ví dụ không chứa từ này -> "${exEn}"`);
    updates.push({ id, word: c.word, meaning: fmt(pos, ipa, vi, exEn, exVi), deck: c.deck, status: c.status });
  }

  // sau đợt này deck IELT LỚP 2 phải sạch hoàn toàn
  const left = cards.filter((c) => c.deck === "IELT LỚP 2" && !isStd(c.meaning) && !DATA[c.id]);
  if (left.length) problems.push(`Còn ${left.length} thẻ IELT LỚP 2 chưa soạn: ${left.map((c) => c.id + " " + c.word).join(", ")}`);

  console.log(`Sẽ ghi ${updates.length}/${Object.keys(DATA).length} thẻ. Thẻ IELT LỚP 2 còn sót: ${left.length}`);
  if (problems.length) { console.log("VẤN ĐỀ:"); problems.forEach((p) => console.log("   -", p)); }

  console.log("\n--- XEM TRƯỚC 2 THẺ ---");
  updates.slice(0, 2).forEach((u) => { console.log("MẶT TRƯỚC: " + u.word); console.log(u.meaning); console.log("---"); });

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
