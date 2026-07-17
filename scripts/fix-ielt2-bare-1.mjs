import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// IELT LỚP 2 - các thẻ dữ liệu gốc CHỈ có mỗi nghĩa tiếng Việt, không phiên âm, không
// ví dụ (phần 1). Nghĩa tiếng Việt gốc được giữ nguyên; phiên âm (giọng Anh), loại từ
// và câu ví dụ (cả tiếng Anh lẫn bản dịch) đều do tôi soạn.
// Các từ này đến từ bài đọc IELTS về nước sạch / chim di cư / năng lượng mặt trời nên
// câu ví dụ được viết bám theo đúng ngữ cảnh đó.
// id -> [loại từ, phiên âm, ví dụ tiếng Anh, bản dịch]
const DATA = {
  "1783947327092-137": ["n", "/ˌɔːnɪˈθɒlədʒɪst/", "The ornithologist has studied these birds for twenty years.", "Nhà điểu học đã nghiên cứu những loài chim này suốt hai mươi năm."],
  "1783947327092-142": ["n", "/ˈrɪvəbæŋk/", "We sat on the riverbank and watched the boats go by.", "Chúng tôi ngồi trên bờ sông và ngắm những chiếc thuyền trôi qua."],
  "1783947327092-160": ["n", "/ˈlæŋɡwɪdʒ/", "English is the language most widely used in business.", "Tiếng Anh là ngôn ngữ được dùng rộng rãi nhất trong kinh doanh."],
  "1783947327092-96":  ["n", "/trentʃ/", "The workers dug a deep trench to lay the water pipes.", "Công nhân đào một cái mương sâu để đặt đường ống nước."],
  "1783947327092-159": ["phr", "/ə ˌwaɪd ˈreɪndʒ əv/", "The library offers a wide range of books for children.", "Thư viện cung cấp một loạt các đầu sách dành cho trẻ em."],
  "1783947327092-97":  ["v phr", "/ˌleɪ ˈpaɪps/", "The village had to lay pipes to bring water from the well.", "Ngôi làng phải đặt đường ống để dẫn nước từ giếng về."],
  "1783947327092-98":  ["n phr", "/ˌfrʌnt ˈdɔː/", "Someone is knocking at the front door.", "Có ai đó đang gõ cửa trước."],
  "1783947327092-161": ["adj", "/ˈkɒmən/", "This bird is very common in the north of the country.", "Loài chim này rất phổ biến ở miền bắc đất nước."],
  "1783947327092-162": ["v phr", "/ˌhæv ˈfʌn/", "The children have fun playing by the river every afternoon.", "Bọn trẻ chơi vui vẻ bên bờ sông mỗi buổi chiều."],
  "1783947327092-163": ["v", "/ɪkˈspleɪn/", "Can you explain how this machine works?", "Bạn có thể giải thích cái máy này hoạt động thế nào không?"],
  "1783947327092-99":  ["n", "/ˈbɜːdn/", "Carrying water every day is a heavy burden for the women.", "Việc gánh nước mỗi ngày là một gánh nặng lớn đối với những người phụ nữ."],
  "1783947327092-100": ["n", "/θɜːst/", "After the long walk, nothing could stop his thirst.", "Sau chặng đường dài, không gì làm dịu được cơn khát của anh ấy."],
  "1783947327092-164": ["phr", "/ˌteɪk jɔː ˈtaɪm/", "Take your time; there is no need to hurry.", "Cứ thong thả; không cần phải vội đâu."],
  "1783947327092-165": ["n", "/spiːd/", "The birds fly at an amazing speed during migration.", "Những con chim bay với tốc độ đáng kinh ngạc trong lúc di cư."],
  "1783947327092-101": ["n", "/ˈstɑːlaɪt/", "The birds use starlight to find their way at night.", "Những con chim dùng ánh sao để tìm đường vào ban đêm."],
  "1783947327092-102": ["n phr", "/ˌstiːp ˈmaʊntɪn/", "They had to climb a steep mountain to reach the village.", "Họ phải leo một ngọn núi dốc để đến được ngôi làng."],
  "1783947327092-168": ["n phr", "/ˌtəʊtl ˌpɒpjuˈleɪʃn/", "The total population of the village is about two thousand.", "Tổng dân số của ngôi làng khoảng hai nghìn người."],
  "1783947327092-169": ["v", "/kəˈmjuːnɪkeɪt/", "Bees communicate with each other by dancing.", "Ong giao tiếp với nhau bằng cách nhảy múa."],
  "1783947327092-104": ["adj", "/ˈbrɪliənt/", "The stars were brilliant in the clear night sky.", "Những vì sao rực rỡ trên bầu trời đêm quang đãng."],
  "1783947327092-105": ["n", "/ˈmuːvmənt/", "Scientists tracked the movement of the birds across the desert.", "Các nhà khoa học theo dõi sự di chuyển của đàn chim qua sa mạc."],
  "1783947327092-170": ["adv", "/haʊˈevə/", "The plan looked simple; however, it was hard to carry out.", "Kế hoạch trông có vẻ đơn giản; tuy nhiên, nó rất khó thực hiện."],
  "1783947327092-171": ["adj", "/ˈlaɪkli/", "It is likely to rain this afternoon.", "Chiều nay có khả năng sẽ mưa."],
  "1783947327092-172": ["n", "/ˈtiːneɪdʒə/", "As a teenager, she spent every summer in her grandparents' village.", "Khi còn là thiếu niên, cô ấy dành mọi mùa hè ở làng của ông bà."],
  "1783947327092-107": ["phr", "/ˌtruː tə ðeə ˈneɪm/", "True to their name, weaver birds build nests that look woven.", "Đúng như tên gọi, chim dệt xây những chiếc tổ trông như được đan."],
  "1783947327092-108": ["n", "/ˈdaɪət/", "The diet of these birds is mainly insects and seeds.", "Chế độ ăn của những loài chim này chủ yếu là côn trùng và hạt."],
  "1783947327092-173": ["v phr", "/ˌhəʊld ə ˌkɒnvəˈseɪʃn/", "After one year of study, he could hold a conversation in English.", "Sau một năm học, anh ấy đã có thể duy trì một cuộc hội thoại bằng tiếng Anh."],
  "1783947327092-174": ["adj", "/ˈpɜːfɪkt/", "The weather was perfect for a long walk.", "Thời tiết hoàn hảo cho một chuyến đi bộ dài."],
  "1783947327092-175": ["v", "/dɪˈskʌs/", "The committee met to discuss the new water project.", "Ủy ban họp để thảo luận về dự án nước mới."],
  "1783947327092-176": ["n", "/ˈtɒpɪk/", "Climate change is a common topic in the exam.", "Biến đổi khí hậu là một chủ đề thường gặp trong kỳ thi."],
  "1783947327092-109": ["n phr", "/ˌflaɪɪŋ ˈɪnsekt/", "Swallows catch flying insects while moving through the air.", "Chim én bắt côn trùng bay ngay khi đang lướt trong không trung."],
  "1783947327092-111": ["adv", "/ɪˈfɪʃntli/", "The new pump moves water more efficiently than the old one.", "Chiếc bơm mới đẩy nước hiệu quả hơn cái cũ."],
  "1783947327092-177": ["v", "/ˈtrævl/", "These birds travel thousands of kilometres every year.", "Những con chim này di chuyển hàng nghìn ki-lô-mét mỗi năm."],
  "1783947327092-178": ["n phr", "/əˌnʌðə ˈkʌntri/", "Moving to another country can be a difficult experience.", "Chuyển đến một quốc gia khác có thể là một trải nghiệm khó khăn."],
  "1783947327092-112": ["n", "/brɑːntʃ/", "The bird built its nest on a high branch.", "Con chim làm tổ trên một cành cây cao."],
  "1783947327092-113": ["v", "/rʌb/", "The birds rub their beaks against the branch to clean them.", "Những con chim cọ mỏ vào cành cây để làm sạch mỏ."],
  "1783947327092-179": ["n", "/ˌdɪsədˈvɑːntɪdʒ/", "The main disadvantage of this method is its high cost.", "Nhược điểm chính của phương pháp này là chi phí cao."],
  "1783947327092-180": ["v phr", "/ˌnevə ˈrest/", "During the migration, the birds almost never rest.", "Trong suốt chuyến di cư, những con chim gần như không bao giờ nghỉ."],
  "1783947327092-181": ["adv", "/kənˈtɪnjuəsli/", "The pump works continuously throughout the day.", "Máy bơm hoạt động liên tục suốt cả ngày."],
  "1783947327092-182": ["v phr", "/ˌpʊt ɪn ˈefət/", "If you put in effort every day, your English will improve.", "Nếu bạn bỏ công sức mỗi ngày, tiếng Anh của bạn sẽ tiến bộ."],
  "1783947327092-183": ["v", "/rɪˈmembə/", "It is hard to remember new words without practice.", "Rất khó ghi nhớ từ mới nếu không luyện tập."],
  "1783947327092-184": ["n", "/breɪn/", "The brain needs rest to store what you have learned.", "Bộ não cần nghỉ ngơi để lưu lại những gì bạn đã học."],
  "1783947327092-116": ["v", "/briːd/", "These birds breed in the north and fly south for the winter.", "Những con chim này sinh sản ở phía bắc rồi bay xuống phía nam vào mùa đông."],
  "1783947327092-117": ["v", "/ɪkˈstend/", "The farmers extended the canal to reach the new fields.", "Nông dân kéo dài con kênh để dẫn tới những cánh đồng mới."],
  "1783947327092-185": ["v", "/fəˈɡet/", "Write it down so that you do not forget it.", "Hãy ghi lại để bạn không quên."],
  "1783947327092-186": ["v phr", "/ˌɡet ˈbetə/", "My listening skills get better every week.", "Kỹ năng nghe của tôi tốt lên mỗi tuần."],
  "1783947327092-118": ["n", "/ˈfɑːmlænd/", "Much of the farmland dries out during the long summer.", "Phần lớn đất canh tác khô cằn trong suốt mùa hè dài."],
  "1783947327092-187": ["v phr", "/ˌmeɪk ˈprəʊɡres/", "You will make progress if you practise a little every day.", "Bạn sẽ tiến bộ nếu luyện tập một chút mỗi ngày."],
  "1783947327092-188": ["phr", "/əz ˈɒfn əz aɪ kæn/", "I speak English with my friends as often as I can.", "Tôi nói tiếng Anh với bạn bè thường xuyên nhất có thể."],
  "1783947327092-119": ["n phr", "/ˈrɪvə ˌvæli/", "The village lies in a green river valley.", "Ngôi làng nằm trong một thung lũng sông xanh mướt."],
  "1783947327092-120": ["v", "/prəˈvaɪd/", "The new well provides clean water for the whole village.", "Cái giếng mới cung cấp nước sạch cho cả làng."],
  "1783947327092-121": ["n phr", "/ˌhjuːdʒ ˈnʌmbə/", "A huge number of birds gather here every spring.", "Một số lượng chim khổng lồ tụ về đây mỗi mùa xuân."],
  "1783947327092-122": ["n", "/flɒk/", "A flock of birds landed on the field.", "Một đàn chim đáp xuống cánh đồng."],
  "1783947327092-189": ["n", "/freɪz/", "Try to learn whole phrases, not just single words.", "Hãy cố học cả cụm từ, không chỉ từ đơn lẻ."],
  "1783947327092-190": ["n", "/ˈkʌltʃə/", "Learning a language also means learning its culture.", "Học một ngôn ngữ cũng có nghĩa là học văn hóa của nó."],
  "1783947327092-123": ["n", "/ˈtræktə/", "The farmer uses a tractor to prepare the field.", "Người nông dân dùng máy kéo để làm đất."],
  "1783947327092-191": ["n", "/aɪˈdɪə/", "That is a good idea for saving water.", "Đó là một ý tưởng hay để tiết kiệm nước."],
  "1783947327092-124": ["n", "/rɪˈsɜːtʃə/", "A researcher from the university visited the village.", "Một nhà nghiên cứu từ trường đại học đã đến thăm ngôi làng."],
  "1783947327092-125": ["n", "/ˈstʌmək/", "The bird stores food in its stomach for the long flight.", "Con chim trữ thức ăn trong dạ dày cho chuyến bay dài."],
  "1783947327092-126": ["n", "/haɪv/", "The bees returned to the hive before dark.", "Đàn ong trở về tổ trước khi trời tối."],
  "1783947327092-127": ["v phr", "/ˌpɑːs ðə ˈwɪntə/", "These birds pass the winter in warmer countries.", "Những con chim này trải qua mùa đông ở các nước ấm hơn."],
  "1783947327092-128": ["phr v", "/ˌkʌt ˈɒf/", "Heavy rain cut off the village for three days.", "Mưa lớn đã cô lập ngôi làng suốt ba ngày."],
  "1783947327092-129": ["n phr", "/ˌmeɪn ˈsɔːs/", "The river is the main source of water for the village.", "Con sông là nguồn nước chính của ngôi làng."],
  "1783947327092-131": ["v", "/krɒs/", "The birds must cross the desert without stopping.", "Đàn chim phải băng qua sa mạc mà không dừng lại."],
  "1783947327092-132": ["n", "/ˈdezət/", "Crossing the desert is the hardest part of the journey.", "Băng qua sa mạc là phần khó khăn nhất của hành trình."],
  "1783947327092-133": ["n phr", "/ˈwɪntərɪŋ ɡraʊndz/", "The birds reach their wintering grounds in October.", "Đàn chim đến nơi trú đông vào tháng Mười."],
  "1783947327092-134": ["phr", "/ɪkˌstriːmli ˈrɪski/", "Flying across the sea at night is extremely risky.", "Bay qua biển vào ban đêm là cực kỳ rủi ro."],
  "1783947327092-192": ["phr", "/ənd ˈsəʊ ɒn/", "We studied nouns, verbs, adjectives and so on.", "Chúng tôi đã học danh từ, động từ, tính từ, vân vân."],
  "1783947327092-135": ["n", "/ˈstrætədʒəm/", "Flying at night is a clever stratagem to avoid predators.", "Bay vào ban đêm là một mưu mẹo khôn ngoan để tránh kẻ săn mồi."],
  "1783947327092-194": ["adj", "/ˈpʌblɪk/", "The library is a public place open to everyone.", "Thư viện là nơi công cộng mở cửa cho tất cả mọi người."],
  "1783947327092-136": ["n", "/maɪˈɡreɪʃn/", "The migration of these birds takes about six weeks.", "Cuộc di cư của những con chim này mất khoảng sáu tuần."],
  "1783947327092-140": ["n phr", "/ˌfɒləʊɪŋ ˈsprɪŋ/", "The birds return to the same nest the following spring.", "Đàn chim quay về đúng chiếc tổ cũ vào mùa xuân năm sau."],
  "1783947327092-143": ["n", "/sɔɪl/", "The soil here is too dry to grow rice.", "Đất ở đây quá khô để trồng lúa."],
  "1783947327092-155": ["n phr", "/ˌkɒŋkriːt wɔːld kəˈnæl/", "The water runs to the fields through a concrete-walled canal.", "Nước chảy ra đồng qua một con kênh có tường bê tông."],
  "1783947327092-144": ["n", "/weɪt/", "The bird loses half its weight during the long flight.", "Con chim mất một nửa trọng lượng trong chuyến bay dài."],
  "1783947327092-145": ["n phr", "/ˈnestɪŋ ˌsiːzn/", "During the nesting season, the birds become very active.", "Vào mùa làm tổ, những con chim trở nên rất năng động."],
  "1783947327092-158": ["v phr", "/ˈpræktɪs skɪlz/", "You need to practise skills like speaking and writing every day.", "Bạn cần luyện tập các kỹ năng như nói và viết mỗi ngày."],
  "1783947327092-146": ["n", "/tʃɪk/", "The parents feed the chick many times a day.", "Chim bố mẹ cho chim non ăn nhiều lần trong ngày."],
  "1783947327092-147": ["v", "/ˈbenɪfɪt/", "The whole village benefits from the new water scheme.", "Cả ngôi làng được hưởng lợi từ hệ thống cấp nước mới."],
  "1783947327092-148": ["v phr", "/kənˌtɪnjuː ðə ˈfæməli laɪn/", "Animals must breed to continue the family line.", "Động vật phải sinh sản để duy trì nòi giống."],
  "1783947327092-150": ["v", "/əˈvɔɪd/", "The birds fly at night to avoid the heat.", "Đàn chim bay vào ban đêm để tránh cái nóng."],
  "1783947327092-151": ["v", "/əˈfekt/", "Pesticides affect the number of insects the birds can eat.", "Thuốc trừ sâu ảnh hưởng đến lượng côn trùng mà chim có thể ăn."],
  "1783947327092-152": ["n", "/ˈpestɪsaɪd/", "Farmers spray pesticide on the crops to kill insects.", "Nông dân phun thuốc trừ sâu lên mùa màng để diệt côn trùng."],
  "1783947327092-153": ["n phr", "/ˈbriːdɪŋ saɪt/", "This lake is an important breeding site for water birds.", "Cái hồ này là một địa điểm sinh sản quan trọng của các loài chim nước."],
  "1783947327092-71":  ["adv", "/ˈʌðəwaɪz/", "Take a map with you; otherwise you may get lost.", "Hãy mang theo bản đồ; nếu không bạn có thể bị lạc."],
  "1783947327092-72":  ["phr v", "/ˌdreɪn əˈweɪ/", "Without a dam, the rainwater simply drains away.", "Không có đập, nước mưa chỉ đơn giản là chảy đi mất."],
  "1783947327092-73":  ["n", "/ˌɪnəˈveɪʃn/", "The sand dam is a simple but clever innovation.", "Đập cát là một sáng kiến đơn giản nhưng khôn ngoan."],
  "1783947327092-74":  ["n", "/səˈluːʃn/", "The villagers needed a cheap solution to the water problem.", "Dân làng cần một giải pháp rẻ tiền cho vấn đề nước."],
  "1783947327092-75":  ["v", "/ɪnˈvɒlv/", "The project involves the whole community from the start.", "Dự án lôi kéo cả cộng đồng tham gia ngay từ đầu."],
  "1783947327092-154": ["v", "/ˌdɪsəˈpɪə/", "The river disappears completely in the dry season.", "Con sông biến mất hoàn toàn vào mùa khô."],
  "1783947327092-195": ["v", "/ˈmiːnɪŋ/", "The sign is red, meaning you must stop.", "Biển báo màu đỏ, có nghĩa là bạn phải dừng lại."],
  "1783947327092-76":  ["n phr", "/ˌləʊkl kəˈmjuːnəti/", "The local community built the dam without outside help.", "Cộng đồng địa phương đã xây con đập mà không cần trợ giúp từ bên ngoài."],
  "1783947327092-77":  ["v", "/dɪˈzaɪn/", "Engineers design the dam to hold sand as well as water.", "Các kỹ sư thiết kế con đập để giữ cả cát lẫn nước."],
  "1783947327092-78":  ["v", "/meɪnˈteɪn/", "The villagers can maintain the pump themselves.", "Dân làng có thể tự bảo dưỡng máy bơm."],
  "1783947327092-79":  ["n", "/kəˈmɪti/", "A local committee decides how the water is shared.", "Một ủy ban địa phương quyết định cách chia nước."],
  "1783947327092-196": ["n", "/kəˈmjuːnəti/", "The whole community came together to build the school.", "Cả cộng đồng cùng chung tay xây ngôi trường."],
  "1783947327092-80":  ["n", "/kənˈstrʌkʃn/", "The construction of the dam took only three months.", "Việc xây dựng con đập chỉ mất ba tháng."],
  "1783947327092-81":  ["v phr", "/ˌrʌn ðə ˈprɒdʒekt/", "The villagers themselves run the project after it is finished.", "Chính dân làng vận hành dự án sau khi nó hoàn thành."],
  "1783947327092-82":  ["n", "/ˈterəsɪz/", "The farmers grow rice on terraces along the hillside.", "Nông dân trồng lúa trên những ruộng bậc thang dọc sườn đồi."],
  "1783947327092-83":  ["v", "/dɪɡ/", "They dug a well by hand to reach the water.", "Họ đào giếng bằng tay để lấy được nước."],
  "1783947327092-84":  ["phr", "/ˈfeɪməs fɔː/", "This region is famous for its rice terraces.", "Vùng này nổi tiếng về những thửa ruộng bậc thang."],
  "1783947327092-85":  ["n", "/ˈrezɪdənt/", "Every resident of the village helped to dig the canal.", "Mọi cư dân trong làng đều góp sức đào con kênh."],
  "1783947327092-86":  ["v", "/kənˈstrʌkt/", "They constructed the dam using local sand and stone.", "Họ xây con đập bằng cát và đá tại địa phương."],
  "1783947327092-87":  ["n phr", "/ˈdrɪlɪŋ məˌʃiːnəri/", "Deep wells need expensive drilling machinery.", "Giếng sâu cần máy móc khoan đục đắt tiền."],
  "1783947327092-88":  ["v", "/ɪnˈstɔːl/", "The team installed a hand pump next to the well.", "Nhóm đã lắp đặt một chiếc bơm tay bên cạnh giếng."],
  "1783947327092-89":  ["adj", "/ˈməʊtəraɪzd/", "A motorised pump is faster but harder to repair.", "Máy bơm gắn động cơ thì nhanh hơn nhưng khó sửa hơn."],
  "1783947327092-90":  ["n", "/ˈrezəvwɑː/", "The dam creates a reservoir that lasts through the dry season.", "Con đập tạo ra một hồ chứa nước đủ dùng suốt mùa khô."],
  "1783947327092-91":  ["n", "/ˈɡrævəti/", "Gravity carries the water down to the village.", "Trọng lực đưa nước xuống tới ngôi làng."],
  "1783947327092-92":  ["n", "/paɪp/", "A long pipe brings water from the spring to the school.", "Một đường ống dài dẫn nước từ con suối về trường học."],
  "1783947327092-93":  ["v", "/fʌnd/", "A charity helped to fund the new water project.", "Một tổ chức từ thiện đã giúp tài trợ cho dự án nước mới."],
  "1783947327092-95":  ["n", "/ˈstrʌktʃə/", "The dam is a simple structure made of concrete.", "Con đập là một công trình đơn giản làm bằng bê tông."],
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

async function run() {
  const apply = process.argv.includes("--apply");
  const cards = await loadAll();
  const byId = new Map(cards.map((c) => [c.id, c]));
  const updates = [];
  const problems = [];

  for (const [id, [pos, ipa, exEn, exVi]] of Object.entries(DATA)) {
    const c = byId.get(id);
    if (!c) { problems.push(`Không tìm thấy ${id}`); continue; }
    if (/^Phiên âm:/m.test(c.meaning)) { problems.push(`${id} (${c.word}) đã chuẩn rồi, không ghi đè`); continue; }
    const vi = (c.meaning || "").trim();          // giữ nguyên nghĩa tiếng Việt gốc
    if (!vi) { problems.push(`${id} (${c.word}): nghĩa gốc rỗng`); continue; }
    if (vi.includes("\n")) { problems.push(`${id} (${c.word}): nghĩa gốc nhiều dòng, cần xem tay -> ${JSON.stringify(vi)}`); continue; }
    // câu ví dụ phải thật sự chứa từ đang học (bắt lỗi soạn nhầm thẻ)
    const head = c.word.toLowerCase().split(/[\s/(]/)[0].replace(/[^a-z]/g, "").slice(0, 4);
    if (head.length >= 4 && !exEn.toLowerCase().includes(head)) problems.push(`${id} (${c.word}): ví dụ không chứa từ này -> "${exEn}"`);
    updates.push({ id, word: c.word, meaning: fmt(pos, ipa, vi, exEn, exVi), deck: c.deck, status: c.status });
  }

  console.log(`Sẽ ghi ${updates.length}/${Object.keys(DATA).length} thẻ.`);
  if (problems.length) { console.log("VẤN ĐỀ:"); problems.forEach((p) => console.log("   -", p)); }

  console.log("\n--- XEM TRƯỚC 3 THẺ ---");
  updates.slice(0, 3).forEach((u) => { console.log("MẶT TRƯỚC: " + u.word); console.log(u.meaning); console.log("---"); });

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
