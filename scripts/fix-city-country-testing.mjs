import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// Chuẩn hóa 3 deck City (93), Tên quốc gia (54), testing (15) về chuẩn 3 dòng.
// Dữ liệu gốc 3 deck này gần như không có phiên âm lẫn ví dụ -> phiên âm (giọng Anh,
// theo quy ước sẵn có của các deck khác) và câu ví dụ đều do tôi soạn.
// Chỗ nào dữ liệu gốc đã có sẵn câu ví dụ tiếng Anh thì dùng lại, không viết mới.

// --- City: mặt sau gốc chỉ có tên nước -> giữ tên nước trong phần Nghĩa ---
const CITY = {
  "1783308042490-0":   ["New York", "/ˌnjuː ˈjɔːk/", "New York — thành phố lớn nhất nước Mỹ", "New York never sleeps; there is always something to do.", "New York không bao giờ ngủ; lúc nào cũng có việc gì đó để làm."],
  "1783308042490-1":   ["Los Angeles", "/lɒs ˈændʒəliːz/", "Los Angeles — thành phố của Mỹ, trung tâm điện ảnh Hollywood", "Most Hollywood studios are based in Los Angeles.", "Phần lớn các hãng phim Hollywood đặt tại Los Angeles."],
  "1783308042490-2":   ["Chicago", "/ʃɪˈkɑːɡəʊ/", "Chicago — thành phố của Mỹ, nổi tiếng nhiều gió", "Chicago is famous for its windy weather and tall buildings.", "Chicago nổi tiếng với thời tiết nhiều gió và những tòa nhà cao tầng."],
  "1783308042490-3":   ["San Francisco", "/ˌsæn frənˈsɪskəʊ/", "San Francisco — thành phố của Mỹ, có cầu Cổng Vàng", "The Golden Gate Bridge is the symbol of San Francisco.", "Cầu Cổng Vàng là biểu tượng của San Francisco."],
  "1783308042490-4":   ["Las Vegas", "/læs ˈveɪɡəs/", "Las Vegas — thành phố của Mỹ, nổi tiếng về sòng bạc", "People go to Las Vegas for its casinos and shows.", "Người ta đến Las Vegas vì các sòng bạc và show diễn ở đó."],
  "1783308042490-5":   ["Washington, D.C.", "/ˈwɒʃɪŋtən ˌdiː ˈsiː/", "Washington, D.C. — thủ đô của nước Mỹ", "The President lives in Washington, D.C.", "Tổng thống sống ở Washington, D.C."],
  "1783308042490-6":   ["Miami", "/maɪˈæmi/", "Miami — thành phố biển của Mỹ", "Miami has warm weather all year round.", "Miami có thời tiết ấm áp quanh năm."],
  "1783308042490-7":   ["Boston", "/ˈbɒstən/", "Boston — thành phố của Mỹ, nổi tiếng về giáo dục", "Boston is home to many famous universities.", "Boston là nơi có nhiều trường đại học nổi tiếng."],
  "1783308042490-8":   ["Seattle", "/siˈætl/", "Seattle — thành phố của Mỹ, hay mưa", "It rains a lot in Seattle during the winter.", "Seattle mưa rất nhiều vào mùa đông."],
  "1783308042490-9":   ["London", "/ˈlʌndən/", "London — thủ đô của nước Anh", "London is the capital of England.", "London là thủ đô của nước Anh."],
  "1783308042490-10":  ["Manchester", "/ˈmæntʃɪstə/", "Manchester — thành phố của Anh, nổi tiếng về bóng đá", "Manchester is famous for its football clubs.", "Manchester nổi tiếng với các câu lạc bộ bóng đá."],
  "1783308042490-11":  ["Liverpool", "/ˈlɪvəpuːl/", "Liverpool — thành phố cảng của Anh, quê hương ban nhạc The Beatles", "The Beatles came from Liverpool.", "Ban nhạc The Beatles xuất thân từ Liverpool."],
  "1783308042490-12":  ["Edinburgh", "/ˈedɪnbərə/", "Edinburgh — thủ đô của Scotland", "Edinburgh is the capital of Scotland.", "Edinburgh là thủ đô của Scotland."],
  "1783308042490-13":  ["Birmingham", "/ˈbɜːmɪŋəm/", "Birmingham — thành phố lớn của Anh", "Birmingham is one of the largest cities in England.", "Birmingham là một trong những thành phố lớn nhất nước Anh."],
  "1783308042490-15":  ["Paris", "/ˈpærɪs/", "Paris — thủ đô của nước Pháp", "Paris is the capital of France.", "Paris là thủ đô của nước Pháp."],
  "1783308042490-16":  ["Lyon", "/liˈɒn/", "Lyon — thành phố của Pháp, nổi tiếng về ẩm thực", "Lyon is known as the food capital of France.", "Lyon được biết đến là kinh đô ẩm thực của nước Pháp."],
  "1783308042490-17":  ["Marseille", "/mɑːˈseɪ/", "Marseille — thành phố cảng của Pháp", "Marseille is a busy port city in the south of France.", "Marseille là một thành phố cảng sầm uất ở miền nam nước Pháp."],
  "1783308042490-19":  ["Rome", "/rəʊm/", "Rome — thủ đô của nước Ý", "Rome is the capital of Italy.", "Rome là thủ đô của nước Ý."],
  "1783308042490-20":  ["Milan", "/mɪˈlæn/", "Milan — thành phố của Ý, kinh đô thời trang", "Milan is one of the fashion capitals of the world.", "Milan là một trong những kinh đô thời trang của thế giới."],
  "1783308042490-21":  ["Venice", "/ˈvenɪs/", "Venice — thành phố của Ý, nổi tiếng với kênh đào", "In Venice, people travel by boat instead of by car.", "Ở Venice, người ta đi lại bằng thuyền thay vì bằng ô tô."],
  "1783308042490-22":  ["Florence", "/ˈflɒrəns/", "Florence — thành phố nghệ thuật của Ý", "Florence is full of beautiful art and old churches.", "Florence có rất nhiều tác phẩm nghệ thuật đẹp và nhà thờ cổ."],
  "1783308042490-24":  ["Madrid", "/məˈdrɪd/", "Madrid — thủ đô của Tây Ban Nha", "Madrid is the capital of Spain.", "Madrid là thủ đô của Tây Ban Nha."],
  "1783308042490-25":  ["Barcelona", "/ˌbɑːsəˈləʊnə/", "Barcelona — thành phố biển của Tây Ban Nha", "We spent a week in Barcelona last summer.", "Mùa hè năm ngoái chúng tôi đã ở Barcelona một tuần."],
  "1783308042490-26":  ["Seville", "/səˈvɪl/", "Seville — thành phố của Tây Ban Nha, nổi tiếng với múa flamenco", "Seville is the best place to watch flamenco dancing.", "Seville là nơi tuyệt nhất để xem múa flamenco."],
  "1783308042490-28":  ["Berlin", "/bɜːˈlɪn/", "Berlin — thủ đô của nước Đức", "Berlin is the capital of Germany.", "Berlin là thủ đô của nước Đức."],
  "1783308042490-29":  ["Munich", "/ˈmjuːnɪk/", "Munich — thành phố của Đức, nổi tiếng với lễ hội bia", "Munich is famous for its beer festival every autumn.", "Munich nổi tiếng với lễ hội bia vào mỗi mùa thu."],
  "1783308042490-30":  ["Hamburg", "/ˈhæmbɜːɡ/", "Hamburg — thành phố cảng của Đức", "Hamburg has one of the biggest ports in Europe.", "Hamburg có một trong những cảng lớn nhất châu Âu."],
  "1783308042490-31":  ["Frankfurt", "/ˈfræŋkfɜːt/", "Frankfurt — thành phố của Đức, trung tâm tài chính", "Many banks have their offices in Frankfurt.", "Nhiều ngân hàng đặt văn phòng ở Frankfurt."],
  "1783308042490-33":  ["Amsterdam", "/ˈæmstədæm/", "Amsterdam — thủ đô của Hà Lan", "Amsterdam is the capital of the Netherlands.", "Amsterdam là thủ đô của Hà Lan."],
  "1783308042490-34":  ["Rotterdam", "/ˈrɒtədæm/", "Rotterdam — thành phố cảng của Hà Lan", "Rotterdam is a major port city in the Netherlands.", "Rotterdam là một thành phố cảng lớn của Hà Lan."],
  "1783308042490-36":  ["Brussels", "/ˈbrʌslz/", "Brussels — thủ đô của Bỉ", "Brussels is the capital of Belgium.", "Brussels là thủ đô của Bỉ."],
  "1783308042490-37":  ["Vienna", "/viˈenə/", "Vienna — thủ đô của Áo, thành phố âm nhạc", "Vienna is the capital of Austria and a city of music.", "Vienna là thủ đô của Áo và là thành phố của âm nhạc."],
  "1783308042490-38":  ["Prague", "/prɑːɡ/", "Prague — thủ đô của Cộng hòa Séc", "Prague is the capital of the Czech Republic.", "Prague là thủ đô của Cộng hòa Séc."],
  "1783308042490-39":  ["Warsaw", "/ˈwɔːsɔː/", "Warsaw — thủ đô của Ba Lan", "Warsaw is the capital of Poland.", "Warsaw là thủ đô của Ba Lan."],
  "1783308042490-40":  ["Athens", "/ˈæθɪnz/", "Athens — thủ đô của Hy Lạp", "Athens is the capital of Greece.", "Athens là thủ đô của Hy Lạp."],
  "1783308042490-41":  ["Zurich", "/ˈzjʊərɪk/", "Zurich — thành phố lớn nhất Thụy Sĩ", "Zurich is the largest city in Switzerland.", "Zurich là thành phố lớn nhất Thụy Sĩ."],
  "1783308042490-42":  ["Geneva", "/dʒɪˈniːvə/", "Geneva — thành phố của Thụy Sĩ, nơi đặt nhiều tổ chức quốc tế", "Many international organisations have their headquarters in Geneva.", "Nhiều tổ chức quốc tế đặt trụ sở tại Geneva."],
  "1783308042490-43":  ["Stockholm", "/ˈstɒkhəʊm/", "Stockholm — thủ đô của Thụy Điển", "Stockholm is the capital of Sweden.", "Stockholm là thủ đô của Thụy Điển."],
  "1783308042490-44":  ["Oslo", "/ˈɒzləʊ/", "Oslo — thủ đô của Na Uy", "Oslo is the capital of Norway.", "Oslo là thủ đô của Na Uy."],
  "1783308042490-45":  ["Copenhagen", "/ˌkəʊpənˈheɪɡən/", "Copenhagen — thủ đô của Đan Mạch", "Copenhagen is the capital of Denmark.", "Copenhagen là thủ đô của Đan Mạch."],
  "1783308042490-46":  ["Helsinki", "/ˈhelsɪŋki/", "Helsinki — thủ đô của Phần Lan", "Helsinki is the capital of Finland.", "Helsinki là thủ đô của Phần Lan."],
  "1783308042490-47":  ["Dublin", "/ˈdʌblɪn/", "Dublin — thủ đô của Ireland", "Dublin is the capital of Ireland.", "Dublin là thủ đô của Ireland."],
  "1783308042490-48":  ["Lisbon", "/ˈlɪzbən/", "Lisbon — thủ đô của Bồ Đào Nha", "Lisbon is the capital of Portugal.", "Lisbon là thủ đô của Bồ Đào Nha."],
  "1783308042490-50":  ["Moscow", "/ˈmɒskəʊ/", "Moscow — thủ đô của nước Nga", "Moscow is the capital of Russia.", "Moscow là thủ đô của nước Nga."],
  "1783308042490-51":  ["Saint Petersburg", "/ˌseɪnt ˈpiːtəzbɜːɡ/", "Saint Petersburg — thành phố của Nga, nổi tiếng về kiến trúc", "Saint Petersburg is known for its beautiful old buildings.", "Saint Petersburg nổi tiếng với những tòa nhà cổ tuyệt đẹp."],
  "1783308042490-53":  ["Tokyo", "/ˈtəʊkiəʊ/", "Tokyo — thủ đô của Nhật Bản", "Tokyo is the capital of Japan.", "Tokyo là thủ đô của Nhật Bản."],
  "1783308042490-54":  ["Osaka", "/əʊˈsɑːkə/", "Osaka — thành phố của Nhật, nổi tiếng về đồ ăn", "Osaka is famous for its street food.", "Osaka nổi tiếng với đồ ăn đường phố."],
  "1783308042490-55":  ["Kyoto", "/kiˈəʊtəʊ/", "Kyoto — cố đô của Nhật Bản", "Kyoto has hundreds of old temples.", "Kyoto có hàng trăm ngôi đền cổ."],
  "1783308042490-56":  ["Nagoya", "/nəˈɡɔɪə/", "Nagoya — thành phố công nghiệp của Nhật", "Nagoya is an important industrial city in Japan.", "Nagoya là một thành phố công nghiệp quan trọng của Nhật Bản."],
  "1783308042490-58":  ["Seoul", "/səʊl/", "Seoul — thủ đô của Hàn Quốc", "Seoul is the capital of South Korea.", "Seoul là thủ đô của Hàn Quốc."],
  "1783308042490-59":  ["Busan", "/ˈbuːsɑːn/", "Busan — thành phố biển của Hàn Quốc", "Busan is a port city with popular beaches.", "Busan là thành phố cảng có những bãi biển nổi tiếng."],
  "1783308042490-60":  ["Incheon", "/ˈɪntʃɒn/", "Incheon — thành phố của Hàn Quốc, có sân bay quốc tế lớn", "We landed at Incheon airport in the morning.", "Chúng tôi hạ cánh xuống sân bay Incheon vào buổi sáng."],
  "1783308042490-62":  ["Beijing", "/ˌbeɪˈdʒɪŋ/", "Beijing — thủ đô của Trung Quốc", "Beijing is the capital of China.", "Beijing là thủ đô của Trung Quốc."],
  "1783308042490-63":  ["Shanghai", "/ˌʃæŋˈhaɪ/", "Shanghai — thành phố lớn nhất Trung Quốc", "Shanghai is the largest city in China.", "Shanghai là thành phố lớn nhất Trung Quốc."],
  "1783308042490-64":  ["Guangzhou", "/ˌɡwæŋˈdʒəʊ/", "Guangzhou — thành phố thương mại của Trung Quốc", "Guangzhou holds a huge trade fair every year.", "Guangzhou tổ chức một hội chợ thương mại lớn mỗi năm."],
  "1783308042490-65":  ["Shenzhen", "/ˌʃenˈdʒen/", "Shenzhen — thành phố công nghệ của Trung Quốc", "Shenzhen is often called China's technology city.", "Shenzhen thường được gọi là thành phố công nghệ của Trung Quốc."],
  "1783308042490-66":  ["Hong Kong", "/ˌhɒŋ ˈkɒŋ/", "Hong Kong — đặc khu hành chính của Trung Quốc", "Hong Kong is a special administrative region of China.", "Hong Kong là một đặc khu hành chính của Trung Quốc."],
  "1783308042490-68":  ["Taipei", "/ˌtaɪˈpeɪ/", "Taipei — thủ đô của Đài Loan", "Taipei is the capital of Taiwan.", "Taipei là thủ đô của Đài Loan."],
  "1783308042490-70":  ["Bangkok", "/ˌbæŋˈkɒk/", "Bangkok — thủ đô của Thái Lan", "Bangkok is the capital of Thailand.", "Bangkok là thủ đô của Thái Lan."],
  "1783308042490-71":  ["Chiang Mai", "/ˌtʃjæŋ ˈmaɪ/", "Chiang Mai — thành phố miền núi phía bắc Thái Lan", "Chiang Mai is quieter and cooler than Bangkok.", "Chiang Mai yên tĩnh và mát mẻ hơn Bangkok."],
  "1783308042490-72":  ["Phuket", "/puːˈket/", "Phuket — đảo du lịch của Thái Lan", "Phuket is a popular island for beach holidays.", "Phuket là hòn đảo được ưa chuộng để đi nghỉ biển."],
  "1783308042490-74":  ["Singapore", "/ˌsɪŋəˈpɔː/", "Singapore — đảo quốc ở Đông Nam Á, vừa là nước vừa là thành phố", "Singapore is both a city and a country.", "Singapore vừa là một thành phố vừa là một quốc gia."],
  "1783308042490-76":  ["Kuala Lumpur", "/ˌkwɑːlə ˈlʊmpʊə/", "Kuala Lumpur — thủ đô của Malaysia", "Kuala Lumpur is the capital of Malaysia.", "Kuala Lumpur là thủ đô của Malaysia."],
  "1783308042490-77":  ["Penang", "/pəˈnæŋ/", "Penang — đảo của Malaysia, nổi tiếng về ẩm thực", "Penang is well known for its delicious street food.", "Penang nổi tiếng với đồ ăn đường phố ngon."],
  "1783308042490-79":  ["Jakarta", "/dʒəˈkɑːtə/", "Jakarta — thủ đô của Indonesia", "Jakarta is the capital of Indonesia.", "Jakarta là thủ đô của Indonesia."],
  "1783308042490-80":  ["Bali", "/ˈbɑːli/", "Bali — hòn đảo du lịch nổi tiếng của Indonesia", "Many tourists visit Bali for its beaches and temples.", "Nhiều du khách đến Bali vì những bãi biển và ngôi đền ở đó."],
  "1783308042490-82":  ["Manila", "/məˈnɪlə/", "Manila — thủ đô của Philippines", "Manila is the capital of the Philippines.", "Manila là thủ đô của Philippines."],
  "1783308042490-83":  ["Cebu", "/seɪˈbuː/", "Cebu — thành phố biển của Philippines", "Cebu is a popular place for diving.", "Cebu là một nơi được ưa chuộng để lặn biển."],
  "1783308042490-84":  ["New Delhi", "/ˌnjuː ˈdeli/", "New Delhi — thủ đô của Ấn Độ", "New Delhi is the capital of India.", "New Delhi là thủ đô của Ấn Độ."],
  "1783308042490-85":  ["Mumbai", "/mʊmˈbaɪ/", "Mumbai — thành phố lớn nhất Ấn Độ, trung tâm điện ảnh", "Mumbai is the centre of the Indian film industry.", "Mumbai là trung tâm của ngành điện ảnh Ấn Độ."],
  "1783308042490-86":  ["Bengaluru", "/ˌbeŋɡəˈlʊruː/", "Bengaluru — thành phố công nghệ của Ấn Độ", "Many software companies are based in Bengaluru.", "Nhiều công ty phần mềm đặt trụ sở tại Bengaluru."],
  "1783308042490-88":  ["Dubai", "/duːˈbaɪ/", "Dubai — thành phố lớn nhất của UAE", "Dubai has the tallest building in the world.", "Dubai có tòa nhà cao nhất thế giới."],
  "1783308042490-89":  ["Abu Dhabi", "/ˌæbuː ˈdɑːbi/", "Abu Dhabi — thủ đô của UAE", "Abu Dhabi is the capital of the United Arab Emirates.", "Abu Dhabi là thủ đô của Các Tiểu vương quốc Ả Rập Thống nhất."],
  "1783308042490-90":  ["Doha", "/ˈdəʊhə/", "Doha — thủ đô của Qatar", "Doha is the capital of Qatar.", "Doha là thủ đô của Qatar."],
  "1783308042490-92":  ["Cairo", "/ˈkaɪrəʊ/", "Cairo — thủ đô của Ai Cập", "Cairo is the capital of Egypt.", "Cairo là thủ đô của Ai Cập."],
  "1783308042490-93":  ["Cape Town", "/ˌkeɪp ˈtaʊn/", "Cape Town — thành phố cảng nổi tiếng của Nam Phi", "Cape Town sits between the mountains and the sea.", "Cape Town nằm giữa núi và biển."],
  "1783308042490-94":  ["Johannesburg", "/dʒəʊˈhænɪsbɜːɡ/", "Johannesburg — thành phố lớn nhất Nam Phi", "Johannesburg is the largest city in South Africa.", "Johannesburg là thành phố lớn nhất Nam Phi."],
  "1783308042490-95":  ["Marrakech", "/ˌmærəˈkeʃ/", "Marrakech — thành phố cổ của Morocco", "Marrakech is famous for its busy old markets.", "Marrakech nổi tiếng với những khu chợ cổ nhộn nhịp."],
  "1783308042490-97":  ["Sydney", "/ˈsɪdni/", "Sydney — thành phố lớn nhất Úc, có nhà hát Opera nổi tiếng", "The Opera House is the symbol of Sydney.", "Nhà hát Opera là biểu tượng của Sydney."],
  "1783308042490-98":  ["Melbourne", "/ˈmelbən/", "Melbourne — thành phố của Úc, nổi tiếng về cà phê và nghệ thuật", "Melbourne is known for its coffee culture.", "Melbourne nổi tiếng với văn hóa cà phê."],
  "1783308042490-99":  ["Brisbane", "/ˈbrɪzbən/", "Brisbane — thành phố nắng ấm của Úc", "Brisbane has warm, sunny weather most of the year.", "Brisbane có thời tiết ấm áp, nắng đẹp gần như quanh năm."],
  "1783308042490-100": ["Perth", "/pɜːθ/", "Perth — thành phố miền tây nước Úc", "Perth is on the west coast of Australia.", "Perth nằm ở bờ tây nước Úc."],
  "1783308042490-102": ["Auckland", "/ˈɔːklənd/", "Auckland — thành phố lớn nhất New Zealand", "Auckland is the largest city in New Zealand.", "Auckland là thành phố lớn nhất New Zealand."],
  "1783308042490-103": ["Wellington", "/ˈwelɪŋtən/", "Wellington — thủ đô của New Zealand", "Wellington is the capital of New Zealand.", "Wellington là thủ đô của New Zealand."],
  "1783308042490-105": ["Toronto", "/təˈrɒntəʊ/", "Toronto — thành phố lớn nhất Canada", "Toronto is the largest city in Canada.", "Toronto là thành phố lớn nhất Canada."],
  "1783308042490-106": ["Vancouver", "/vænˈkuːvə/", "Vancouver — thành phố biển của Canada", "Vancouver is surrounded by mountains and the ocean.", "Vancouver được bao quanh bởi núi và đại dương."],
  "1783308042490-107": ["Montreal", "/ˌmɒntriˈɔːl/", "Montreal — thành phố nói tiếng Pháp của Canada", "People in Montreal speak both French and English.", "Người dân ở Montreal nói cả tiếng Pháp lẫn tiếng Anh."],
  "1783308042490-109": ["Mexico City", "/ˌmeksɪkəʊ ˈsɪti/", "Mexico City — thủ đô của Mexico", "Mexico City is the capital of Mexico.", "Mexico City là thủ đô của Mexico."],
  "1783308042490-110": ["Rio de Janeiro", "/ˌriːəʊ də dʒəˈnɪərəʊ/", "Rio de Janeiro — thành phố biển của Brazil, nổi tiếng với lễ hội Carnival", "Rio de Janeiro is famous for its carnival.", "Rio de Janeiro nổi tiếng với lễ hội carnival."],
  "1783308042490-111": ["São Paulo", "/ˌsaʊ ˈpaʊləʊ/", "São Paulo — thành phố lớn nhất Brazil", "São Paulo is the largest city in Brazil.", "São Paulo là thành phố lớn nhất Brazil."],
  "1783308042490-112": ["Buenos Aires", "/ˌbwenəs ˈaɪriːz/", "Buenos Aires — thủ đô của Argentina", "Buenos Aires is the capital of Argentina.", "Buenos Aires là thủ đô của Argentina."],
  "1783308042490-113": ["Lima", "/ˈliːmə/", "Lima — thủ đô của Peru", "Lima is the capital of Peru.", "Lima là thủ đô của Peru."],
  "1783308042490-114": ["Santiago", "/ˌsæntiˈɑːɡəʊ/", "Santiago — thủ đô của Chile", "Santiago is the capital of Chile.", "Santiago là thủ đô của Chile."],
};

// --- Tên quốc gia: mặt trước là cặp "Nước - người nước đó", phiên âm cho cả 2 ---
const COUNTRY = {
  "1783305066726-0":  ["/ˌvjetˈnæm - ˌvjetnəˈmiːz/", "She is Vietnamese; she was born in Vietnam.", "Cô ấy là người Việt Nam; cô ấy sinh ra ở Việt Nam."],
  "1783305066726-1":  ["/ˈɪŋɡlənd - ˈɪŋɡlɪʃ/", "He is English; he comes from England.", "Anh ấy là người Anh; anh ấy đến từ nước Anh."],
  "1783305066726-2":  ["/ˈskɒtlənd - ˈskɒtɪʃ/", "She is Scottish; she grew up in Scotland.", "Cô ấy là người Scotland; cô ấy lớn lên ở Scotland."],
  "1783305066726-3":  ["/weɪlz - welʃ/", "He is Welsh; his family still lives in Wales.", "Anh ấy là người Wales; gia đình anh ấy vẫn sống ở xứ Wales."],
  "1783305066726-4":  ["/ˈaɪələnd - ˈaɪrɪʃ/", "She is Irish; she flew back to Ireland last week.", "Cô ấy là người Ireland; tuần trước cô ấy bay về Ireland."],
  "1783305066726-5":  ["/juˌnaɪtɪd ˈkɪŋdəm - ˈbrɪtɪʃ/", "He holds a British passport from the United Kingdom.", "Anh ấy có hộ chiếu Anh do Vương quốc Anh cấp."],
  "1783305066726-6":  ["/juˌnaɪtɪd ˈsteɪts - əˈmerɪkən/", "She is American; she lives in the United States.", "Cô ấy là người Mỹ; cô ấy sống ở Hoa Kỳ."],
  "1783305066726-7":  ["/ˈkænədə - kəˈneɪdiən/", "He is Canadian; he was born in Canada.", "Anh ấy là người Canada; anh ấy sinh ra ở Canada."],
  "1783305066726-8":  ["/ɒˈstreɪliə - ɒˈstreɪliən/", "She is Australian; she studies in Australia.", "Cô ấy là người Úc; cô ấy học ở Úc."],
  "1783305066726-9":  ["/ˌnjuː ˈziːlənd - ˌnjuː ˈziːləndə/", "He is a New Zealander; he works in New Zealand.", "Anh ấy là người New Zealand; anh ấy làm việc ở New Zealand."],
  "1783305066726-10": ["/ˈtʃaɪnə - ˌtʃaɪˈniːz/", "She is Chinese; her family is from China.", "Cô ấy là người Trung Quốc; gia đình cô ấy đến từ Trung Quốc."],
  "1783305066726-11": ["/dʒəˈpæn - ˌdʒæpəˈniːz/", "He is Japanese; he moved back to Japan last year.", "Anh ấy là người Nhật; năm ngoái anh ấy chuyển về Nhật Bản."],
  "1783305066726-12": ["/ˌsaʊθ kəˈriːə - kəˈriːən/", "She is Korean; she comes from South Korea.", "Cô ấy là người Hàn Quốc; cô ấy đến từ Hàn Quốc."],
  "1783305066726-13": ["/ˌnɔːθ kəˈriːə - ˌnɔːθ kəˈriːən/", "North Korean students rarely travel outside North Korea.", "Học sinh Triều Tiên hiếm khi ra khỏi Triều Tiên."],
  "1783305066726-14": ["/ˈtaɪlænd - taɪ/", "She is Thai; she was born in Thailand.", "Cô ấy là người Thái; cô ấy sinh ra ở Thái Lan."],
  "1783305066726-15": ["/ˌsɪŋəˈpɔː - ˌsɪŋəˈpɔːriən/", "He is Singaporean; he has lived in Singapore all his life.", "Anh ấy là người Singapore; anh ấy sống ở Singapore cả đời."],
  "1783305066726-16": ["/məˈleɪziə - məˈleɪziən/", "She is Malaysian; she flew home to Malaysia for Tet.", "Cô ấy là người Malaysia; cô ấy bay về Malaysia dịp Tết."],
  "1783305066726-17": ["/ˌɪndəˈniːʒə - ˌɪndəˈniːʒən/", "He is Indonesian; he grew up in Indonesia.", "Anh ấy là người Indonesia; anh ấy lớn lên ở Indonesia."],
  "1783305066726-18": ["/ˈfɪlɪpiːnz - ˌfɪlɪˈpiːnəʊ/", "She is Filipino; her parents still live in the Philippines.", "Cô ấy là người Philippines; bố mẹ cô ấy vẫn sống ở Philippines."],
  "1783305066726-19": ["/ˈɪndiə - ˈɪndiən/", "He is Indian; he was born in India.", "Anh ấy là người Ấn Độ; anh ấy sinh ra ở Ấn Độ."],
  "1783305066726-20": ["/ˌpɑːkɪˈstɑːn - ˌpɑːkɪˈstɑːni/", "She is Pakistani; she comes from Pakistan.", "Cô ấy là người Pakistan; cô ấy đến từ Pakistan."],
  "1783305066726-21": ["/ˌbæŋɡləˈdeʃ - ˌbæŋɡləˈdeʃi/", "He is Bangladeshi; his home is in Bangladesh.", "Anh ấy là người Bangladesh; quê anh ấy ở Bangladesh."],
  "1783305066726-22": ["/nɪˈpɔːl - ˌnepəˈliːz/", "She is Nepalese; she was born in Nepal.", "Cô ấy là người Nepal; cô ấy sinh ra ở Nepal."],
  "1783305066726-23": ["/ˌsriː ˈlæŋkə - ˌsriː ˈlæŋkən/", "He is Sri Lankan; he grew up in Sri Lanka.", "Anh ấy là người Sri Lanka; anh ấy lớn lên ở Sri Lanka."],
  "1783305066726-24": ["/frɑːns - frentʃ/", "She is French; she studies in France.", "Cô ấy là người Pháp; cô ấy học ở Pháp."],
  "1783305066726-25": ["/ˈdʒɜːməni - ˈdʒɜːmən/", "He is German; he works in Germany.", "Anh ấy là người Đức; anh ấy làm việc ở Đức."],
  "1783305066726-26": ["/ˈɪtəli - ɪˈtæliən/", "She is Italian; her family is from Italy.", "Cô ấy là người Ý; gia đình cô ấy đến từ Ý."],
  "1783305066726-27": ["/speɪn - ˈspænɪʃ/", "He is Spanish; he was born in Spain.", "Anh ấy là người Tây Ban Nha; anh ấy sinh ra ở Tây Ban Nha."],
  "1783305066726-28": ["/ˈpɔːtʃʊɡl - ˌpɔːtʃʊˈɡiːz/", "She is Portuguese; she comes from Portugal.", "Cô ấy là người Bồ Đào Nha; cô ấy đến từ Bồ Đào Nha."],
  "1783305066726-29": ["/ˈneðələndz - dʌtʃ/", "He is Dutch; he cycles to work in the Netherlands.", "Anh ấy là người Hà Lan; anh ấy đạp xe đi làm ở Hà Lan."],
  "1783305066726-30": ["/ˈbeldʒəm - ˈbeldʒən/", "She is Belgian; she was born in Belgium.", "Cô ấy là người Bỉ; cô ấy sinh ra ở Bỉ."],
  "1783305066726-31": ["/ˈswɪtsələnd - swɪs/", "He is Swiss; he lives in Switzerland.", "Anh ấy là người Thụy Sĩ; anh ấy sống ở Thụy Sĩ."],
  "1783305066726-32": ["/ˈɒstriə - ˈɒstriən/", "She is Austrian; she grew up in Austria.", "Cô ấy là người Áo; cô ấy lớn lên ở Áo."],
  "1783305066726-33": ["/ˈswiːdn - ˈswiːdɪʃ/", "He is Swedish; he comes from Sweden.", "Anh ấy là người Thụy Điển; anh ấy đến từ Thụy Điển."],
  "1783305066726-34": ["/ˈnɔːweɪ - nɔːˈwiːdʒən/", "She is Norwegian; she was born in Norway.", "Cô ấy là người Na Uy; cô ấy sinh ra ở Na Uy."],
  "1783305066726-35": ["/ˈdenmɑːk - ˈdeɪnɪʃ/", "He is Danish; his family lives in Denmark.", "Anh ấy là người Đan Mạch; gia đình anh ấy sống ở Đan Mạch."],
  "1783305066726-36": ["/ˈfɪnlənd - ˈfɪnɪʃ/", "She is Finnish; she comes from Finland.", "Cô ấy là người Phần Lan; cô ấy đến từ Phần Lan."],
  "1783305066726-37": ["/ˈpəʊlənd - ˈpəʊlɪʃ/", "He is Polish; he was born in Poland.", "Anh ấy là người Ba Lan; anh ấy sinh ra ở Ba Lan."],
  "1783305066726-38": ["/ˌtʃek rɪˈpʌblɪk - tʃek/", "She is Czech; she grew up in the Czech Republic.", "Cô ấy là người Séc; cô ấy lớn lên ở Cộng hòa Séc."],
  "1783305066726-39": ["/ɡriːs - ɡriːk/", "He is Greek; he comes from Greece.", "Anh ấy là người Hy Lạp; anh ấy đến từ Hy Lạp."],
  "1783305066726-40": ["/ˈrʌʃə - ˈrʌʃn/", "She is Russian; she was born in Russia.", "Cô ấy là người Nga; cô ấy sinh ra ở Nga."],
  "1783305066726-41": ["/juːˈkreɪn - juːˈkreɪniən/", "He is Ukrainian; his family is from Ukraine.", "Anh ấy là người Ukraine; gia đình anh ấy đến từ Ukraine."],
  "1783305066726-42": ["/ˈtɜːki - ˈtɜːkɪʃ/", "She is Turkish; she comes from Turkey.", "Cô ấy là người Thổ Nhĩ Kỳ; cô ấy đến từ Thổ Nhĩ Kỳ."],
  "1783305066726-43": ["/ˌsaʊdi əˈreɪbiə - ˈsaʊdi/", "He is Saudi; he works in Saudi Arabia.", "Anh ấy là người Ả Rập Xê Út; anh ấy làm việc ở Ả Rập Xê Út."],
  "1783305066726-44": ["/juˌnaɪtɪd ˌærəb ˈemɪrəts - ˌemɪˈrɑːti/", "She is Emirati; she lives in the United Arab Emirates.", "Cô ấy là người Emirati; cô ấy sống ở Các Tiểu vương quốc Ả Rập Thống nhất."],
  "1783305066726-45": ["/ˈiːdʒɪpt - iˈdʒɪpʃn/", "He is Egyptian; he was born in Egypt.", "Anh ấy là người Ai Cập; anh ấy sinh ra ở Ai Cập."],
  "1783305066726-46": ["/ˌsaʊθ ˈæfrɪkə - ˌsaʊθ ˈæfrɪkən/", "She is South African; she grew up in South Africa.", "Cô ấy là người Nam Phi; cô ấy lớn lên ở Nam Phi."],
  "1783305066726-47": ["/naɪˈdʒɪəriə - naɪˈdʒɪəriən/", "He is Nigerian; he comes from Nigeria.", "Anh ấy là người Nigeria; anh ấy đến từ Nigeria."],
  "1783305066726-48": ["/ˈkenjə - ˈkenjən/", "She is Kenyan; she was born in Kenya.", "Cô ấy là người Kenya; cô ấy sinh ra ở Kenya."],
  "1783305066726-49": ["/brəˈzɪl - brəˈzɪliən/", "He is Brazilian; he plays football in Brazil.", "Anh ấy là người Brazil; anh ấy chơi bóng đá ở Brazil."],
  "1783305066726-50": ["/ˌɑːdʒənˈtiːnə - ˌɑːdʒənˈtɪniən/", "She is Argentinian; she comes from Argentina.", "Cô ấy là người Argentina; cô ấy đến từ Argentina."],
  "1783305066726-51": ["/ˈmeksɪkəʊ - ˈmeksɪkən/", "He is Mexican; he was born in Mexico.", "Anh ấy là người Mexico; anh ấy sinh ra ở Mexico."],
  "1783305066726-52": ["/ˈtʃɪli - ˈtʃɪliən/", "She is Chilean; her family lives in Chile.", "Cô ấy là người Chile; gia đình cô ấy sống ở Chile."],
  "1783305066726-53": ["/pəˈruː - pəˈruːviən/", "He is Peruvian; he grew up in Peru.", "Anh ấy là người Peru; anh ấy lớn lên ở Peru."],
};

// --- testing: giữ lại câu ví dụ tiếng Anh nào dữ liệu gốc đã có sẵn ---
const TESTING = {
  "1775868314558":   ["consecutive", "adj", "/kənˈsekjətɪv/", "liên tiếp", "The build failed three consecutive times.", "Bản build hỏng ba lần liên tiếp."],
  "1778045836147":   ["Variance", "n", "/ˈveəriəns/", "Sự khác biệt, độ chênh lệch", "There is a large variance between the estimated and actual effort.", "Có độ chênh lệch lớn giữa công sức ước tính và thực tế."],
  // ví dụ "Water is essential for life" là của dữ liệu gốc
  "1778046339255":   ["Essential", "adj", "/ɪˈsenʃl/", "Rất cần thiết", "Water is essential for life.", "Nước là thứ thiết yếu cho sự sống."],
  // dữ liệu gốc chỉ có mỗi câu tiếng Anh này, không có nghĩa -> nghĩa do tôi soạn
  "1778046559268":   ["Effective", "adj", "/ɪˈfektɪv/", "Hiệu quả", "An effective test plan helps to identify risk effectively.", "Một kế hoạch kiểm thử hiệu quả giúp xác định rủi ro một cách hiệu quả."],
  "1778046768930":   ["Crucial", "adj", "/ˈkruːʃl/", "Rất quan trọng", "Effective communication is crucial for successful test management.", "Giao tiếp hiệu quả là điều rất quan trọng để quản lý kiểm thử thành công."],
  "1779719270282":   ["retrieving", "v", "/rɪˈtriːvɪŋ/", "truy xuất, lấy ra (dạng V-ing của retrieve)", "The report is slow because retrieving the data takes too long.", "Báo cáo chạy chậm vì việc truy xuất dữ liệu mất quá nhiều thời gian."],
  "1779890167783-0": ["automated tests", "n phr", "/ˈɔːtəmeɪtɪd tests/", "những bài kiểm thử tự động", "We run the automated tests after every commit.", "Chúng tôi chạy các bài kiểm thử tự động sau mỗi lần commit."],
  "1779890339967-0": ["path", "n", "/pɑːθ/", "luồng chạy, đường đi (của chương trình)", "Each path through the code needs its own test case.", "Mỗi luồng chạy trong code cần có một test case riêng."],
  "1779890470188-0": ["blind", "adj", "/blaɪnd/", "mù, không thấy đường; (nghĩa bóng) không nhìn thấy được", "Without logs, we are blind to what happens in production.", "Không có log thì chúng ta mù tịt về những gì đang xảy ra trên production."],
  "1779890622036-0": ["a real user is lost", "phr", "/ə rɪəl ˈjuːzə ɪz lɒst/", "người dùng thật bị lạc lối, không biết phải làm gì tiếp", "If the error message is unclear, a real user is lost.", "Nếu thông báo lỗi không rõ ràng, người dùng thật sẽ không biết phải làm gì tiếp."],
  "1779891260560-0": ["Practically", "adv", "/ˈpræktɪkli/", "về mặt thực tế, trên thực tế", "Practically, we cannot test every possible input.", "Trên thực tế, chúng ta không thể kiểm thử mọi input có thể có."],
  "1779891394588-0": ["No automation at all", "phr", "/nəʊ ˌɔːtəˈmeɪʃn ət ɔːl/", "không có tự động hóa nào cả", "The team does everything by hand; there is no automation at all.", "Cả nhóm làm mọi thứ thủ công; không có tự động hóa nào cả."],
  "1779891539273-0": ["invent", "v", "/ɪnˈvent/", "phát minh, nghĩ ra", "Do not invent test data; use realistic values.", "Đừng bịa ra dữ liệu test; hãy dùng những giá trị thực tế."],
  "1781162103691":   ["deprecated", "adj", "/ˈdeprəkeɪtɪd/", "bị lỗi thời, không còn được khuyến khích dùng", "This API is deprecated and will be removed next year.", "API này đã lỗi thời và sẽ bị gỡ bỏ vào năm sau."],
  // thẻ này dữ liệu gốc đã gần đúng chuẩn, chỉ sắp lại; phiên âm gốc /ˈsuː.t̬ə.bəl/ là
  // ký hiệu giọng Mỹ -> đổi về giọng Anh cho khớp các deck khác
  "1783920247453-0": ["Suitable", "adj", "/ˈsuːtəbl/", "Phù hợp", "Find a suitable time for the meeting.", "Hãy tìm một thời gian phù hợp để họp nhé."],
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

const isStd = (m) => /^Phiên âm:/m.test(m || "") && /^Nghĩa:/m.test(m || "") && /^Ví dụ:/m.test(m || "");

async function run() {
  const apply = process.argv.includes("--apply");
  const cards = await loadAll();
  const byId = new Map(cards.map((c) => [c.id, c]));
  const updates = [];
  const problems = [];

  for (const [id, [word, ipa, vi, exEn, exVi]] of Object.entries(CITY)) {
    const c = byId.get(id);
    if (!c) { problems.push(`City: không tìm thấy ${id}`); continue; }
    if (c.word !== word) problems.push(`City ${id}: mặt trước lệch (DB "${c.word}" vs soạn "${word}")`);
    updates.push({ id, word: c.word, meaning: fmt("n", ipa, vi, exEn, exVi), deck: c.deck, status: c.status });
  }
  for (const [id, [ipa, exEn, exVi]] of Object.entries(COUNTRY)) {
    const c = byId.get(id);
    if (!c) { problems.push(`Country: không tìm thấy ${id}`); continue; }
    // Nghĩa giữ nguyên phần tiếng Việt gốc "<Nước> - người <nước>"
    updates.push({ id, word: c.word, meaning: fmt("n/adj", ipa, c.meaning.trim(), exEn, exVi), deck: c.deck, status: c.status });
  }
  for (const [id, [word, pos, ipa, vi, exEn, exVi]] of Object.entries(TESTING)) {
    const c = byId.get(id);
    if (!c) { problems.push(`testing: không tìm thấy ${id}`); continue; }
    if (c.word !== word) problems.push(`testing ${id}: mặt trước lệch (DB "${c.word}" vs soạn "${word}")`);
    updates.push({ id, word: c.word, meaning: fmt(pos, ipa, vi, exEn, exVi), deck: c.deck, status: c.status });
  }

  // Phải phủ hết thẻ chưa chuẩn của 3 deck này
  for (const deck of ["City", "Tên quốc gia", "testing"]) {
    const left = cards.filter((c) => c.deck === deck && !isStd(c.meaning) && !updates.some((u) => u.id === c.id));
    if (left.length) problems.push(`${deck}: còn ${left.length} thẻ chưa soạn -> ${left.map((c) => c.id + " " + c.word).join(", ")}`);
  }

  console.log(`Sẽ ghi ${updates.length} thẻ (City ${Object.keys(CITY).length}, Tên quốc gia ${Object.keys(COUNTRY).length}, testing ${Object.keys(TESTING).length}).`);
  if (problems.length) { console.log("VẤN ĐỀ:"); problems.forEach((p) => console.log("   -", p)); }

  console.log("\n--- XEM TRƯỚC ---");
  for (const id of ["1783308042490-92", "1783305066726-0", "1778046339255"]) {
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
