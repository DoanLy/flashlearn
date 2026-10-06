// Nạp chủ đề "Từ vựng hay gặp trong Listening" — từ 11 ảnh từ vựng IELTS Listening
// (ielts-fighter.com): Travel & Transport (×3), University & Campus, Booking & Services (×2),
// Equipment & Outdoor Items, Technology & Communication, People & Jobs, Shopping & Money,
// Daily Life & Home.
//
// Từ/IPA/nghĩa lấy theo ảnh (sửa vài lỗi gõ IPA trong ảnh); câu ví dụ + bản dịch soạn tay
// theo ngữ cảnh IELTS Listening. Từ lặp giữa các ảnh (headphones, microphone, receipt,
// discount) chỉ giữ 1 thẻ.
//
// Mỗi dòng DATA: word | loại từ | /ipa/ | nghĩa | câu ví dụ | dịch câu ví dụ
// id = "listening-common-0001"… (deterministic ⇒ chạy lại không tạo thẻ trùng).
// Mặc định DRY-RUN; thêm --apply để ghi thật lên Supabase.
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const DECK = "Từ vựng hay gặp trong Listening";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

const DATA = `
platform|n|/ˈplætfɔːm/|sân ga|The train to London leaves from platform 4.|Tàu đi London khởi hành từ sân ga số 4.
bus stop|n phr|/ˈbʌs stɒp/|trạm xe buýt|The nearest bus stop is just outside the library.|Trạm xe buýt gần nhất ở ngay bên ngoài thư viện.
coach station|n phr|/ˈkəʊtʃ steɪʃn/|bến xe khách|The coach to Oxford departs from Victoria Coach Station.|Xe khách đi Oxford khởi hành từ bến xe Victoria.
taxi rank|n phr|/ˈtæksi ræŋk/|điểm đón taxi|You'll find a taxi rank at the main exit of the station.|Bạn sẽ thấy điểm đón taxi ở lối ra chính của nhà ga.
ferry terminal|n phr|/ˈferi ˈtɜːmɪnl/|bến phà|Please arrive at the ferry terminal 30 minutes before departure.|Vui lòng có mặt ở bến phà 30 phút trước giờ khởi hành.
check-in desk|n phr|/ˈtʃek ɪn desk/|quầy làm thủ tục|The check-in desk opens two hours before the flight.|Quầy làm thủ tục mở cửa hai tiếng trước chuyến bay.
boarding gate|n phr|/ˈbɔːdɪŋ ɡeɪt/|cửa lên máy bay|Passengers should go to boarding gate A1 now.|Hành khách vui lòng đến cửa lên máy bay A1 ngay bây giờ.
departure lounge|n phr|/dɪˈpɑːtʃə laʊndʒ/|phòng chờ khởi hành|There are several cafés in the departure lounge.|Có vài quán cà phê trong phòng chờ khởi hành.
passport control|n phr|/ˈpɑːspɔːt kənˈtrəʊl/|khu kiểm tra hộ chiếu|We queued for twenty minutes at passport control.|Chúng tôi xếp hàng hai mươi phút ở khu kiểm tra hộ chiếu.
baggage reclaim|n phr|/ˈbæɡɪdʒ rɪˈkleɪm/|khu nhận hành lý|Collect your suitcase from baggage reclaim belt 3.|Hãy lấy va li của bạn ở băng chuyền nhận hành lý số 3.
luggage trolley|n phr|/ˈlʌɡɪdʒ ˈtrɒli/|xe đẩy hành lý|Luggage trolleys are free to use in the arrivals area.|Xe đẩy hành lý được dùng miễn phí ở khu đến.
departure board|n phr|/dɪˈpɑːtʃə bɔːd/|bảng giờ khởi hành|Check the departure board to see if your flight is delayed.|Hãy xem bảng giờ khởi hành để biết chuyến bay có bị hoãn không.
shuttle bus|n phr|/ˈʃʌtl bʌs/|xe buýt trung chuyển|A free shuttle bus runs between the airport and the hotel.|Có xe buýt trung chuyển miễn phí chạy giữa sân bay và khách sạn.
cycle lane|n phr|/ˈsaɪkl leɪn/|làn đường xe đạp|The new cycle lane makes it safer to ride to campus.|Làn đường xe đạp mới giúp đạp xe đến trường an toàn hơn.
one-way street|n phr|/ˌwʌn weɪ ˈstriːt/|đường một chiều|You can't turn left here because it's a one-way street.|Bạn không thể rẽ trái ở đây vì đây là đường một chiều.
motorway|n|/ˈməʊtəweɪ/|đường cao tốc|Take the M1 motorway and leave at junction 15.|Đi theo đường cao tốc M1 và ra ở nút giao số 15.
carriage|n|/ˈkærɪdʒ/|toa tàu|The quiet carriage is at the front of the train.|Toa yên tĩnh nằm ở đầu tàu.
luggage rack|n phr|/ˈlʌɡɪdʒ ræk/|giá để hành lý|Please put large bags on the luggage rack at the end of the carriage.|Vui lòng đặt túi lớn lên giá để hành lý ở cuối toa.
overhead locker|n phr|/ˌəʊvəhed ˈlɒkə(r)/|ngăn hành lý phía trên|Store your hand luggage in the overhead locker.|Hãy cất hành lý xách tay vào ngăn hành lý phía trên.
aisle seat|n phr|/ˈaɪl siːt/|ghế cạnh lối đi|I'd prefer an aisle seat so I can stretch my legs.|Tôi muốn ghế cạnh lối đi để có thể duỗi chân.
window seat|n phr|/ˈwɪndəʊ siːt/|ghế cạnh cửa sổ|She always books a window seat to enjoy the view.|Cô ấy luôn đặt ghế cạnh cửa sổ để ngắm cảnh.
return ticket|n phr|/rɪˈtɜːn ˈtɪkɪt/|vé khứ hồi|A return ticket to Manchester costs £45.|Vé khứ hồi đi Manchester giá 45 bảng.
single ticket|n phr|/ˈsɪŋɡl ˈtɪkɪt/|vé một chiều|I only need a single ticket because I'm driving back.|Tôi chỉ cần vé một chiều vì tôi sẽ lái xe về.
timetable|n|/ˈtaɪmteɪbl/|thời gian biểu / lịch chạy tàu xe|According to the timetable, the next train is at 9:30.|Theo lịch chạy tàu, chuyến tiếp theo lúc 9 giờ 30.
boarding pass|n phr|/ˈbɔːdɪŋ pɑːs/|thẻ lên máy bay|Please show your boarding pass and passport at the gate.|Vui lòng xuất trình thẻ lên máy bay và hộ chiếu tại cửa.
ticket machine|n phr|/ˈtɪkɪt məʃiːn/|máy bán vé tự động|You can buy a day pass from the ticket machine.|Bạn có thể mua vé ngày ở máy bán vé tự động.
ticket barrier|n phr|/ˈtɪkɪt ˌbæriə(r)/|cổng soát vé|Insert your ticket to open the ticket barrier.|Đưa vé vào để mở cổng soát vé.
baggage drop|n phr|/ˈbæɡɪdʒ drɒp/|quầy gửi hành lý|If you checked in online, go straight to the baggage drop.|Nếu đã làm thủ tục trực tuyến, hãy đến thẳng quầy gửi hành lý.
security check|n phr|/sɪˈkjʊərəti tʃek/|khu kiểm tra an ninh|Liquids must be removed from your bag at the security check.|Phải lấy chất lỏng ra khỏi túi ở khu kiểm tra an ninh.
customs|n|/ˈkʌstəmz/|hải quan|You must declare these goods at customs.|Bạn phải khai báo những hàng hóa này ở hải quan.
arrival hall|n phr|/əˈraɪvl hɔːl/|sảnh đến|I'll meet you in the arrival hall next to the café.|Tôi sẽ đón bạn ở sảnh đến cạnh quán cà phê.
car rental desk|n phr|/kɑː ˈrentl desk/|quầy thuê xe|The car rental desk is on the ground floor of Terminal 2.|Quầy thuê xe ở tầng trệt của Nhà ga 2.
route map|n phr|/ˈruːt mæp/|bản đồ tuyến đường|Look at the route map to find the quickest line.|Xem bản đồ tuyến đường để tìm tuyến nhanh nhất.
hand luggage|n phr|/ˈhænd ˈlʌɡɪdʒ/|hành lý xách tay|Each passenger may take one piece of hand luggage.|Mỗi hành khách được mang một kiện hành lý xách tay.
suitcase|n|/ˈsuːtkeɪs/|va li|My suitcase was too heavy, so I had to pay extra.|Va li của tôi quá nặng nên tôi phải trả thêm tiền.
travel card|n phr|/ˈtrævl kɑːd/|thẻ đi lại / thẻ giao thông|A weekly travel card covers all buses and trains in the city.|Thẻ đi lại theo tuần dùng được cho mọi xe buýt và tàu trong thành phố.
lecture theatre|n phr|/ˈlektʃə θɪətə(r)/|giảng đường lớn|The talk will be held in Lecture Theatre B.|Buổi nói chuyện sẽ diễn ra ở giảng đường B.
tutorial room|n phr|/tjuːˈtɔːriəl ruːm/|phòng học hướng dẫn (nhóm nhỏ)|Our seminar has moved to tutorial room 12.|Buổi thảo luận của chúng ta đã chuyển sang phòng 12.
study area|n phr|/ˈstʌdi ˌeəriə/|khu tự học|The quiet study area on the second floor is open 24 hours.|Khu tự học yên tĩnh ở tầng hai mở cửa 24 giờ.
student union|n phr|/ˌstjuːdnt ˈjuːniən/|khu sinh viên / hội sinh viên|The student union organises social events every Friday.|Hội sinh viên tổ chức các sự kiện giao lưu vào mỗi thứ Sáu.
dormitory|n|/ˈdɔːmətri/|ký túc xá|First-year students usually live in a dormitory on campus.|Sinh viên năm nhất thường sống trong ký túc xá ở trường.
administration office|n phr|/ədˌmɪnɪˈstreɪʃn ˈɒfɪs/|phòng hành chính|Hand in the form at the administration office.|Hãy nộp đơn ở phòng hành chính.
registrar's office|n phr|/ˈredʒɪstrɑːz ˈɒfɪs/|phòng đăng ký học vụ|Ask the registrar's office for a copy of your transcript.|Hãy xin phòng đăng ký học vụ một bản sao bảng điểm.
language centre|n phr|/ˈlæŋɡwɪdʒ ˈsentə(r)/|trung tâm ngoại ngữ|The language centre offers free English classes for international students.|Trung tâm ngoại ngữ có lớp tiếng Anh miễn phí cho sinh viên quốc tế.
research centre|n phr|/rɪˈsɜːtʃ ˈsentə(r)/|trung tâm nghiên cứu|She works at the university's marine research centre.|Cô ấy làm việc ở trung tâm nghiên cứu biển của trường.
sports hall|n phr|/ˈspɔːts hɔːl/|nhà thi đấu|Basketball practice is in the sports hall on Tuesdays.|Buổi tập bóng rổ diễn ra ở nhà thi đấu vào các thứ Ba.
campus map|n phr|/ˈkæmpəs mæp/|bản đồ khuôn viên trường|Check the campus map to find the science building.|Xem bản đồ khuôn viên để tìm tòa nhà khoa học.
noticeboard|n|/ˈnəʊtɪsbɔːd/|bảng thông báo|The exam timetable is on the noticeboard outside the library.|Lịch thi được dán trên bảng thông báo bên ngoài thư viện.
reservation|n|/ˌrezəˈveɪʃn/|sự đặt chỗ|I'd like to make a reservation for two people on Saturday.|Tôi muốn đặt chỗ cho hai người vào thứ Bảy.
available|adj|/əˈveɪləbl/|còn chỗ / có sẵn|Do you have any rooms available next weekend?|Cuối tuần sau còn phòng trống không?
fully booked|adj phr|/ˌfʊli ˈbʊkt/|hết chỗ|I'm sorry, the hotel is fully booked in August.|Xin lỗi, khách sạn đã kín chỗ vào tháng Tám.
deposit|n|/dɪˈpɒzɪt/|tiền đặt cọc|You need to pay a 20% deposit to secure the booking.|Bạn cần đặt cọc 20% để giữ chỗ.
refund|n|/ˈriːfʌnd/|tiền hoàn lại|If you cancel a week in advance, you'll get a full refund.|Nếu hủy trước một tuần, bạn sẽ được hoàn lại toàn bộ tiền.
receipt|n|/rɪˈsiːt/|biên lai / hóa đơn|Keep your receipt in case you need to return the item.|Hãy giữ hóa đơn phòng khi cần trả lại món hàng.
membership card|n phr|/ˈmembəʃɪp kɑːd/|thẻ thành viên|Show your membership card to get into the gym.|Xuất trình thẻ thành viên để vào phòng tập.
registration form|n phr|/ˌredʒɪˈstreɪʃn fɔːm/|phiếu đăng ký|Please fill in the registration form before the course starts.|Vui lòng điền phiếu đăng ký trước khi khóa học bắt đầu.
application form|n phr|/ˌæplɪˈkeɪʃn fɔːm/|đơn đăng ký / đơn xin|Send the completed application form by 15th March.|Gửi đơn đăng ký đã điền đầy đủ trước ngày 15 tháng Ba.
discount|n|/ˈdɪskaʊnt/|giảm giá|Students get a 10% discount with a valid ID card.|Sinh viên được giảm 10% khi có thẻ hợp lệ.
entrance fee|n phr|/ˈentrəns fiː/|phí vào cửa|The entrance fee is £10 for adults and free for children.|Phí vào cửa là 10 bảng cho người lớn và miễn phí cho trẻ em.
booking reference|n phr|/ˈbʊkɪŋ ˈrefrəns/|mã đặt chỗ|Your booking reference is AB123CD.|Mã đặt chỗ của bạn là AB123CD.
cancellation|n|/ˌkænsəˈleɪʃn/|sự hủy đặt chỗ|There is a £15 fee for late cancellations.|Hủy muộn sẽ mất phí 15 bảng.
meeting point|n phr|/ˈmiːtɪŋ pɔɪnt/|điểm tập trung|The meeting point for the tour is in front of the museum.|Điểm tập trung của chuyến tham quan ở trước bảo tàng.
ID card|n phr|/ˌaɪ ˈdiː kɑːd/|thẻ căn cước / thẻ nhận dạng|Please bring your ID card when you collect the tickets.|Vui lòng mang theo thẻ căn cước khi đến nhận vé.
admission ticket|n phr|/ədˈmɪʃn ˈtɪkɪt/|vé vào cửa|An admission ticket includes entry to all exhibitions.|Vé vào cửa bao gồm quyền vào tất cả các khu triển lãm.
confirmation email|n phr|/ˌkɒnfəˈmeɪʃn ˈiːmeɪl/|email xác nhận|You'll receive a confirmation email within 24 hours.|Bạn sẽ nhận được email xác nhận trong vòng 24 giờ.
customer service desk|n phr|/ˈkʌstəmə ˈsɜːvɪs desk/|quầy chăm sóc khách hàng|Lost property is kept at the customer service desk.|Đồ thất lạc được giữ ở quầy chăm sóc khách hàng.
waiting list|n phr|/ˈweɪtɪŋ lɪst/|danh sách chờ|The class is full, but I can put you on the waiting list.|Lớp đã đủ người, nhưng tôi có thể cho bạn vào danh sách chờ.
online booking|n phr|/ˌɒnlaɪn ˈbʊkɪŋ/|đặt chỗ trực tuyến|Online booking is cheaper than paying at the door.|Đặt chỗ trực tuyến rẻ hơn trả tiền tại cửa.
self-service kiosk|n phr|/ˌself ˈsɜːvɪs ˈkiːɒsk/|ki-ốt tự phục vụ|You can print your tickets at the self-service kiosk.|Bạn có thể in vé ở ki-ốt tự phục vụ.
help desk|n phr|/ˈhelp desk/|quầy hỗ trợ|If you have any problems, ask at the help desk.|Nếu gặp vấn đề gì, hãy hỏi ở quầy hỗ trợ.
opening hours|n phr|/ˈəʊpənɪŋ aʊəz/|giờ mở cửa|The library's opening hours are 9 a.m. to 6 p.m. on weekdays.|Giờ mở cửa của thư viện là 9 giờ sáng đến 6 giờ chiều các ngày trong tuần.
queue|n|/kjuː/|hàng chờ|There was a long queue outside the ticket office.|Có một hàng dài người chờ bên ngoài phòng bán vé.
headphones|n|/ˈhedfəʊnz/|tai nghe|Please use headphones when listening to audio in the library.|Vui lòng dùng tai nghe khi nghe âm thanh trong thư viện.
microphone|n|/ˈmaɪkrəfəʊn/|micro (thiết bị thu âm)|Speak clearly into the microphone so everyone can hear.|Hãy nói rõ vào micro để mọi người đều nghe thấy.
projector|n|/prəˈdʒektə(r)/|máy chiếu|The projector in Room 5 isn't working.|Máy chiếu ở phòng 5 bị hỏng.
whiteboard|n|/ˈwaɪtbɔːd/|bảng trắng|The teacher wrote the key points on the whiteboard.|Giáo viên viết các ý chính lên bảng trắng.
safety helmet|n phr|/ˈseɪfti ˈhelmɪt/|mũ bảo hộ|Visitors must wear a safety helmet on the building site.|Khách tham quan phải đội mũ bảo hộ ở công trường.
life jacket|n phr|/ˈlaɪf dʒækɪt/|áo phao|Everyone must wear a life jacket on the boat trip.|Mọi người phải mặc áo phao trong chuyến đi thuyền.
walking boots|n phr|/ˈwɔːkɪŋ buːts/|giày đi bộ đường dài|Bring a pair of strong walking boots for the hike.|Hãy mang một đôi giày đi bộ chắc chắn cho chuyến leo núi.
tent|n|/tent/|lều|We put up the tent next to the lake.|Chúng tôi dựng lều cạnh hồ.
sleeping bag|n phr|/ˈsliːpɪŋ bæɡ/|túi ngủ|It gets cold at night, so bring a warm sleeping bag.|Ban đêm trời lạnh, nên hãy mang theo túi ngủ ấm.
torch|n|/tɔːtʃ/|đèn pin|Don't forget a torch — there are no lights at the campsite.|Đừng quên mang đèn pin — khu cắm trại không có đèn.
brochure|n|/ˈbrəʊʃə(r)/|tờ giới thiệu / sách quảng cáo|You can find more details in the holiday brochure.|Bạn có thể xem thêm chi tiết trong cuốn quảng cáo du lịch.
leaflet|n|/ˈliːflət/|tờ rơi|They handed out leaflets about the new recycling scheme.|Họ phát tờ rơi về chương trình tái chế mới.
phone call|n phr|/ˈfəʊn kɔːl/|cuộc gọi điện thoại|I need to make a quick phone call to the hotel.|Tôi cần gọi nhanh một cuộc điện thoại tới khách sạn.
text message|n phr|/ˈtekst ˈmesɪdʒ/|tin nhắn văn bản|We'll send you a text message when your order is ready.|Chúng tôi sẽ nhắn tin cho bạn khi đơn hàng sẵn sàng.
email|n|/ˈiːmeɪl/|thư điện tử|Please send your assignment by email before Friday.|Vui lòng gửi bài tập qua email trước thứ Sáu.
Wi-Fi|n|/ˈwaɪ faɪ/|mạng không dây|Free Wi-Fi is available in all rooms.|Tất cả các phòng đều có Wi-Fi miễn phí.
website|n|/ˈwebsaɪt/|trang web|You can find the full timetable on our website.|Bạn có thể xem toàn bộ lịch trình trên trang web của chúng tôi.
video call|n phr|/ˈvɪdiəʊ kɔːl/|cuộc gọi video|We had a video call with our tutor last night.|Tối qua chúng tôi có cuộc gọi video với gia sư.
app / application|n|/æp/|ứng dụng|Download the app to check bus times in real time.|Tải ứng dụng để xem giờ xe buýt theo thời gian thực.
charger|n|/ˈtʃɑːdʒə(r)/|bộ sạc|I left my phone charger in the hotel room.|Tôi để quên bộ sạc điện thoại trong phòng khách sạn.
power bank|n phr|/ˈpaʊə bæŋk/|sạc dự phòng|Take a power bank in case your phone runs out of battery.|Mang theo sạc dự phòng phòng khi điện thoại hết pin.
printer|n|/ˈprɪntə(r)/|máy in|The printer on the first floor is out of paper.|Máy in ở tầng một hết giấy.
USB drive|n phr|/ˌjuː es ˈbiː draɪv/|USB (thiết bị lưu trữ)|Save a copy of your presentation on a USB drive.|Hãy lưu một bản bài thuyết trình vào USB.
computer|n|/kəmˈpjuːtə(r)/|máy tính|All students can use the computers in the library.|Mọi sinh viên đều có thể dùng máy tính trong thư viện.
laptop|n|/ˈlæptɒp/|máy tính xách tay|You can borrow a laptop from the IT office for a week.|Bạn có thể mượn máy tính xách tay ở phòng IT trong một tuần.
tablet|n|/ˈtæblət/|máy tính bảng|Children can use a tablet to play learning games.|Trẻ em có thể dùng máy tính bảng để chơi trò chơi học tập.
smartphone|n|/ˈsmɑːtfəʊn/|điện thoại thông minh|Most visitors now pay using their smartphone.|Hầu hết du khách giờ đây thanh toán bằng điện thoại thông minh.
camera|n|/ˈkæmərə/|máy ảnh|You're not allowed to use a camera inside the gallery.|Bạn không được dùng máy ảnh bên trong phòng trưng bày.
speaker|n|/ˈspiːkə(r)/|loa|The sound from the speaker was too quiet to hear.|Âm thanh từ loa quá nhỏ, không nghe được.
television (TV)|n|/ˈtelɪvɪʒn/|ti vi|Every room has a television and a mini fridge.|Mỗi phòng đều có ti vi và tủ lạnh mini.
radio|n|/ˈreɪdiəʊ/|đài phát thanh|I heard about the road closure on the radio.|Tôi nghe tin đóng đường trên đài.
satellite|n|/ˈsætəlaɪt/|vệ tinh|The weather forecast uses images from a satellite.|Dự báo thời tiết sử dụng hình ảnh từ vệ tinh.
signal|n|/ˈsɪɡnəl/|tín hiệu|There's no mobile signal in the mountains.|Trên núi không có sóng điện thoại.
cloud storage|n phr|/ˈklaʊd ˈstɔːrɪdʒ/|lưu trữ đám mây|All your files are backed up to cloud storage.|Tất cả tệp của bạn được sao lưu lên lưu trữ đám mây.
doctor|n|/ˈdɒktə(r)/|bác sĩ|You should see a doctor if the pain continues.|Bạn nên đi khám bác sĩ nếu cơn đau còn kéo dài.
nurse|n|/nɜːs/|y tá|The nurse will take your blood pressure first.|Y tá sẽ đo huyết áp cho bạn trước.
teacher|n|/ˈtiːtʃə(r)/|giáo viên|Our teacher gave us extra homework this week.|Tuần này giáo viên giao thêm bài tập về nhà cho chúng tôi.
student|n|/ˈstjuːdnt/|học sinh, sinh viên|Students can borrow up to ten books at a time.|Sinh viên được mượn tối đa mười cuốn sách một lần.
professor|n|/prəˈfesə(r)/|giáo sư|Professor Smith will give the opening lecture.|Giáo sư Smith sẽ giảng bài khai mạc.
engineer|n|/ˌendʒɪˈnɪə(r)/|kỹ sư|An engineer is coming to repair the heating system.|Một kỹ sư sẽ đến sửa hệ thống sưởi.
architect|n|/ˈɑːkɪtekt/|kiến trúc sư|The architect designed the new library building.|Kiến trúc sư đã thiết kế tòa nhà thư viện mới.
construction worker|n phr|/kənˈstrʌkʃn ˈwɜːkə(r)/|công nhân xây dựng|Construction workers are building a new bridge.|Công nhân xây dựng đang xây một cây cầu mới.
mechanic|n|/məˈkænɪk/|thợ sửa xe|The mechanic said the car needs new brakes.|Thợ sửa xe nói xe cần thay phanh mới.
electrician|n|/ɪˌlekˈtrɪʃn/|thợ điện|We called an electrician to fix the lights.|Chúng tôi gọi thợ điện đến sửa đèn.
chef|n|/ʃef/|đầu bếp|The chef prepares a special dish every Friday.|Đầu bếp chuẩn bị một món đặc biệt vào mỗi thứ Sáu.
waiter / waitress|n|/ˈweɪtə(r)/ /ˈweɪtrəs/|nhân viên phục vụ (nam / nữ)|The waiter brought us the menu and some water.|Người phục vụ mang thực đơn và ít nước cho chúng tôi.
receptionist|n|/rɪˈsepʃənɪst/|lễ tân|Leave your key with the receptionist when you go out.|Hãy gửi chìa khóa cho lễ tân khi bạn ra ngoài.
manager|n|/ˈmænɪdʒə(r)/|quản lý|I'd like to speak to the manager, please.|Tôi muốn nói chuyện với quản lý.
colleague|n|/ˈkɒliːɡ/|đồng nghiệp|One of my colleagues will show you around the office.|Một đồng nghiệp của tôi sẽ dẫn bạn đi tham quan văn phòng.
boss|n|/bɒs/|sếp|My boss let me leave early on Friday.|Sếp cho tôi về sớm vào thứ Sáu.
employee|n|/ɪmˈplɔɪiː/|nhân viên|The company has over 200 employees.|Công ty có hơn 200 nhân viên.
customer|n|/ˈkʌstəmə(r)/|khách hàng|The shop is offering free gifts to its first 50 customers.|Cửa hàng tặng quà miễn phí cho 50 khách hàng đầu tiên.
client|n|/ˈklaɪənt/|khách hàng (doanh nghiệp)|She's meeting an important client this afternoon.|Chiều nay cô ấy gặp một khách hàng quan trọng.
interviewer|n|/ˈɪntəvjuːə(r)/|người phỏng vấn|The interviewer asked about my previous experience.|Người phỏng vấn hỏi về kinh nghiệm trước đây của tôi.
applicant|n|/ˈæplɪkənt/|ứng viên|All applicants must send a CV and a cover letter.|Tất cả ứng viên phải gửi CV và thư xin việc.
journalist|n|/ˈdʒɜːnəlɪst/|nhà báo|A journalist from the local newspaper interviewed us.|Một nhà báo của tờ báo địa phương đã phỏng vấn chúng tôi.
police officer|n phr|/pəˈliːs ˈɒfɪsə(r)/|cảnh sát|A police officer helped us find the way back to the hotel.|Một cảnh sát đã giúp chúng tôi tìm đường về khách sạn.
firefighter|n|/ˈfaɪəfaɪtə(r)/|lính cứu hỏa|Firefighters arrived within ten minutes.|Lính cứu hỏa đã đến trong vòng mười phút.
security guard|n phr|/sɪˈkjʊərəti ɡɑːd/|nhân viên bảo vệ|Ask the security guard at the entrance for a visitor pass.|Hãy xin thẻ khách ở nhân viên bảo vệ tại lối vào.
supermarket|n|/ˈsuːpəmɑːkɪt/|siêu thị|There's a large supermarket five minutes from the campus.|Có một siêu thị lớn cách trường năm phút.
shopping mall|n phr|/ˈʃɒpɪŋ mɔːl/|trung tâm mua sắm|The new shopping mall has over 100 shops.|Trung tâm mua sắm mới có hơn 100 cửa hàng.
shop / store|n|/ʃɒp/ /stɔː(r)/|cửa hàng|The shop on the corner sells fresh bread.|Cửa hàng ở góc phố bán bánh mì tươi.
market|n|/ˈmɑːkɪt/|chợ|The farmers' market is held every Saturday morning.|Chợ nông sản họp vào mỗi sáng thứ Bảy.
shopping basket|n phr|/ˈʃɒpɪŋ ˈbɑːskɪt/|giỏ hàng|Grab a shopping basket if you're only buying a few things.|Lấy một giỏ hàng nếu bạn chỉ mua vài món.
shopping trolley|n phr|/ˈʃɒpɪŋ ˈtrɒli/|xe đẩy hàng|You need a £1 coin to use a shopping trolley.|Bạn cần một đồng 1 bảng để dùng xe đẩy hàng.
checkout|n|/ˈtʃekaʊt/|quầy thanh toán|There's a long queue at the checkout.|Có một hàng dài ở quầy thanh toán.
pay (by card)|v phr|/peɪ baɪ kɑːd/|thanh toán (bằng thẻ)|Can I pay by card, or is it cash only?|Tôi có thể thanh toán bằng thẻ không, hay chỉ nhận tiền mặt?
cash|n|/kæʃ/|tiền mặt|The café only accepts cash.|Quán cà phê chỉ nhận tiền mặt.
credit card|n phr|/ˈkredɪt kɑːd/|thẻ tín dụng|You can book the tickets by credit card over the phone.|Bạn có thể đặt vé bằng thẻ tín dụng qua điện thoại.
price tag|n phr|/ˈpraɪs tæɡ/|mác giá|The price tag says £20, but it's on sale.|Mác giá ghi 20 bảng, nhưng món này đang giảm giá.
sale|n|/seɪl/|đợt giảm giá / bán hạ giá|All winter coats are in the sale this week.|Tất cả áo khoác mùa đông đang giảm giá trong tuần này.
fitting room|n phr|/ˈfɪtɪŋ ruːm/|phòng thử đồ|The fitting rooms are at the back of the shop.|Phòng thử đồ ở phía sau cửa hàng.
size|n|/saɪz/|kích cỡ|Do you have this jacket in a smaller size?|Áo khoác này có cỡ nhỏ hơn không?
shopping bag|n phr|/ˈʃɒpɪŋ bæɡ/|túi mua hàng|Bring your own shopping bag to avoid paying for plastic ones.|Hãy mang túi riêng để khỏi trả tiền túi nhựa.
return / exchange|v|/rɪˈtɜːn/ /ɪksˈtʃeɪndʒ/|trả lại / đổi hàng|You can return or exchange items within 30 days.|Bạn có thể trả lại hoặc đổi hàng trong vòng 30 ngày.
bill|n|/bɪl/|hóa đơn thanh toán|Could we have the bill, please?|Cho chúng tôi xin hóa đơn được không?
wallet|n|/ˈwɒlɪt/|ví tiền|I think I left my wallet on the bus.|Tôi nghĩ tôi để quên ví trên xe buýt.
gift|n|/ɡɪft/|quà tặng|Every new member receives a free gift.|Mỗi thành viên mới nhận được một món quà miễn phí.
voucher|n|/ˈvaʊtʃə(r)/|phiếu quà tặng / phiếu mua hàng|She gave me a £50 gift voucher for my birthday.|Cô ấy tặng tôi phiếu quà tặng 50 bảng nhân dịp sinh nhật.
customer service|n phr|/ˈkʌstəmə ˈsɜːvɪs/|dịch vụ khách hàng|Please contact customer service if your order doesn't arrive.|Vui lòng liên hệ dịch vụ khách hàng nếu đơn hàng không đến.
shop online|v phr|/ʃɒp ˈɒnlaɪn/|mua sắm trực tuyến|More people shop online than ever before.|Ngày càng nhiều người mua sắm trực tuyến hơn bao giờ hết.
house|n|/haʊs/|ngôi nhà|They rent a house with three bedrooms.|Họ thuê một ngôi nhà ba phòng ngủ.
apartment|n|/əˈpɑːtmənt/|căn hộ|The apartment is on the fourth floor, but there's a lift.|Căn hộ ở tầng bốn, nhưng có thang máy.
key|n|/kiː/|chìa khóa|You can collect the keys from the landlord on Monday.|Bạn có thể nhận chìa khóa từ chủ nhà vào thứ Hai.
lock|n|/lɒk/|ổ khóa|The lock on the back door is broken.|Ổ khóa cửa sau bị hỏng.
bedroom|n|/ˈbedruːm/|phòng ngủ|Each bedroom has its own desk and wardrobe.|Mỗi phòng ngủ đều có bàn học và tủ quần áo riêng.
bathroom|n|/ˈbɑːθruːm/|phòng tắm|Two students share one bathroom.|Hai sinh viên dùng chung một phòng tắm.
kitchen|n|/ˈkɪtʃɪn/|phòng bếp|The kitchen is shared by everyone on the floor.|Phòng bếp dùng chung cho mọi người trên tầng.
living room|n phr|/ˈlɪvɪŋ ruːm/|phòng khách|The living room gets a lot of sunlight in the afternoon.|Phòng khách đón nhiều nắng vào buổi chiều.
dining room|n phr|/ˈdaɪnɪŋ ruːm/|phòng ăn|Breakfast is served in the dining room from 7 to 10.|Bữa sáng được phục vụ ở phòng ăn từ 7 đến 10 giờ.
garden|n|/ˈɡɑːdn/|khu vườn|There's a small garden at the back of the house.|Có một khu vườn nhỏ phía sau nhà.
garage|n|/ˈɡærɑːʒ/|nhà để xe|You can park your car in the garage.|Bạn có thể đỗ xe trong nhà để xe.
balcony|n|/ˈbælkəni/|ban công|The flat has a balcony with a view of the river.|Căn hộ có ban công nhìn ra sông.
washing machine|n phr|/ˈwɒʃɪŋ məʃiːn/|máy giặt|The washing machine is in the basement.|Máy giặt ở tầng hầm.
fridge / refrigerator|n|/frɪdʒ/ /rɪˈfrɪdʒəreɪtə(r)/|tủ lạnh|Please label your food before putting it in the fridge.|Vui lòng ghi tên lên đồ ăn trước khi cho vào tủ lạnh.
air conditioner|n phr|/ˈeə kəndɪʃənə(r)/|điều hòa|The air conditioner in my room is too noisy.|Điều hòa trong phòng tôi quá ồn.
heater|n|/ˈhiːtə(r)/|máy sưởi|Turn off the heater when you leave the room.|Hãy tắt máy sưởi khi rời phòng.
sofa|n|/ˈsəʊfə/|ghế sofa|The living room has a large sofa and a TV.|Phòng khách có một chiếc sofa lớn và một ti vi.
wardrobe|n|/ˈwɔːdrəʊb/|tủ quần áo|There's plenty of space in the wardrobe for your clothes.|Tủ quần áo có nhiều chỗ để quần áo của bạn.
rubbish bin|n phr|/ˈrʌbɪʃ bɪn/|thùng rác|The rubbish bins are collected every Tuesday.|Thùng rác được thu gom vào mỗi thứ Ba.
vacuum cleaner|n phr|/ˈvækjuːm ˌkliːnə(r)/|máy hút bụi|You can borrow a vacuum cleaner from reception.|Bạn có thể mượn máy hút bụi ở quầy lễ tân.
`;

const seen = new Set();
const cards = [];
for (const line of DATA.split("\n").map((l) => l.trim()).filter(Boolean)) {
  const parts = line.split("|").map((p) => p.trim());
  if (parts.length !== 6 || parts.some((p) => !p)) throw new Error("Dòng lỗi: " + line);
  const [word, pos, ipa, vi, ex, exVi] = parts;
  const key = word.toLowerCase();
  if (seen.has(key)) throw new Error("Trùng từ: " + word);
  seen.add(key);
  cards.push({
    id: `listening-common-${String(cards.length + 1).padStart(4, "0")}`,
    word,
    meaning: `Phiên âm: (${pos}) ${ipa}\nNghĩa: ${vi}\nVí dụ: "${ex}" (${exVi})`,
    deck: DECK,
    status: "new",
  });
}
console.log(`${cards.length} thẻ cho chủ đề "${DECK}".`);

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
