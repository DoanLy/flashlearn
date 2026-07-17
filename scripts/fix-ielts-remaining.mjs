import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

// 157 thẻ IELTS còn lại ở định dạng cũ "nghĩa (/phiên âm/). Ví dụ - câu".
// Đưa về đúng chuẩn 3 dòng của 3071 thẻ kia:
//   Phiên âm: (loại từ) /ipa/
//   Nghĩa: ...
//   Ví dụ: "câu tiếng Anh" (bản dịch)
// Câu ví dụ tiếng Anh giữ nguyên gốc; loại từ + bản dịch tiếng Việt do tôi soạn.

// pos + bản dịch ví dụ, theo id.
const DATA = {
  "1781706271934-1": { pos: "v phr", exVi: "Tôi thường đi dã ngoại với gia đình vào cuối tuần vì chúng tôi muốn thư giãn sau một tuần bận rộn." },
  "1781705929548-0": { pos: "v phr", exVi: "Mùa hè năm ngoái, chúng tôi ra biển và đắp một bức tượng bằng cát." },
  "1781705929548-4": { pos: "v", exVi: "Khi cảm thấy căng thẳng hay mệt mỏi, tôi thường ngồi trong một căn phòng yên tĩnh và thiền để thư giãn đầu óc." },
  "1781705929548-7": { pos: "n phr", exVi: "Ăn uống cân bằng là điều thiết yếu để giữ gìn sức khỏe tốt." },
  "1781705929548-8": { pos: "n", exVi: "Béo phì đang trở thành một vấn đề sức khỏe lớn ở nhiều quốc gia phát triển." },
  "1781705929548-9": { pos: "adj", exVi: "Anh ấy hơi thừa cân nên bác sĩ khuyên anh ấy tập thể dục nhiều hơn." },
  "1781705929548-10": { pos: "n phr", exVi: "Trẻ em nên tránh ăn quá nhiều đồ ăn vặt." },
  "1781705929548-11": { pos: "n phr", exVi: "Tôi thích nước có ga hơn bất kỳ loại nước ngọt nào." },
  "1781705929548-12": { pos: "n phr", exVi: "Lối sống ít vận động có thể dẫn đến nhiều vấn đề sức khỏe lâu dài." },
  "1781705929548-13": { pos: "phr v", exVi: "Tôi đang cố cắt giảm cà phê vì nó ảnh hưởng đến giấc ngủ của tôi." },
  "1781705929549-14": { pos: "v phr", exVi: "Tôi luôn tăng cân trong kỳ nghỉ đông." },
  "1781705929549-15": { pos: "v phr", exVi: "Cô ấy đã giảm cân được nhờ chạy bộ và nhảy dây mỗi sáng." },
  "1781705929549-16": { pos: "v phr", exVi: "Bạn cần chú ý đến hướng dẫn của giáo viên trong giờ học." },
  "1781705929549-17": { pos: "n", exVi: "Bảo tàng thành phố lưu giữ một bộ sưu tập tiền xu cổ quý hiếm." },
  "1781705929549-18": { pos: "n", exVi: "Chúng tôi leo lên đỉnh tháp để ngắm toàn cảnh Paris từ trên cao." },
  "1781705929549-19": { pos: "n", exVi: "Đài tưởng niệm này được xây để tưởng nhớ những người lính đã hy sinh trong chiến tranh." },
  "1781705929549-20": { pos: "n", exVi: "Phòng triển lãm nghệ thuật trưng bày tác phẩm của các nghệ sĩ đương đại địa phương." },
  "1781705929549-21": { pos: "n phr", exVi: "Gia đình tôi rất thích dành cuối tuần ở công viên giải trí gần nhà." },
  "1781705929549-22": { pos: "v phr", exVi: "Chúng tôi quyết định đi tham quan khu trung tâm lịch sử của thành phố." },
  "1781705929549-23": { pos: "v phr", exVi: "Khi đến Rome, phần lớn du khách đi ngắm cảnh cả ngày." },
  "1781705929549-24": { pos: "v phr", exVi: "Họ tiết kiệm nhiều năm để đi du thuyền hạng sang vòng quanh vùng Caribe." },
  "1781705929549-25": { pos: "v phr", exVi: "Chúng tôi thường đi thuyền buồm trên hồ khi trời có gió." },
  "1781705929549-26": { pos: "v phr", exVi: "Nếu bạn thích thiên nhiên, bạn nên đi bộ đường dài trong vườn quốc gia." },
  "1781705929549-27": { pos: "n phr", exVi: "Công việc mơ ước của tôi là trở thành trưởng nhóm QA." },
  "1781705929549-28": { pos: "v phr", exVi: "Tôi có đam mê với việc kiểm thử phần mềm." },
  "1781705929549-29": { pos: "v phr", exVi: "Tôi làm việc chăm chỉ để đạt được mục tiêu của mình." },
  "1781705929549-30": { pos: "v phr", exVi: "Tôi muốn kiếm được nhiều tiền trong tương lai." },
  "1781705929549-31": { pos: "v phr", exVi: "Tôi đặt mục tiêu cải thiện tiếng Anh trong năm nay." },
  "1781705929549-32": { pos: "v phr", exVi: "Tôi muốn có thêm kiến thức trong ngành công nghệ thông tin." },
  "1781705929549-33": { pos: "v phr", exVi: "Tôi có thể tích lũy kinh nghiệm bằng cách làm các dự án thật." },
  "1781705929549-34": { pos: "v phr", exVi: "Cô ấy làm việc chăm chỉ mỗi ngày." },
  "1781705929549-35": { pos: "v phr", exVi: "Tôi muốn phát triển những kỹ năng mới cho công việc của mình." },
  "1781705929549-36": { pos: "v phr", exVi: "Anh ấy được thăng chức sau hai năm." },
  "1781705929549-37": { pos: "v phr", exVi: "Một người lãnh đạo giỏi cần giao tiếp tốt." },
  "1781705929549-38": { pos: "n phr", exVi: "Hổ là loài có nguy cơ tuyệt chủng do mất môi trường sống và nạn săn bắt trái phép." },
  "1781705929549-39": { pos: "n phr", exVi: "Nạn phá rừng hủy hoại môi trường sống tự nhiên của nhiều loài động vật hoang dã." },
  "1781705929549-40": { pos: "n", exVi: "Ô nhiễm không khí ở các thành phố lớn đã trở thành một vấn đề nghiêm trọng." },
  "1781705929549-41": { pos: "n", exVi: "Mọi người nên bị phạt nặng nếu vứt rác ra đường." },
  "1781705929549-42": { pos: "n", exVi: "Nạn phá rừng góp phần đáng kể vào biến đổi khí hậu." },
  "1781705929549-43": { pos: "n phr", exVi: "Săn bắt trái phép đe dọa sự sống còn của loài tê giác quý hiếm." },
  "1781705929549-44": { pos: "n phr", exVi: "Các hiện tượng thời tiết cực đoan là dấu hiệu rõ ràng của biến đổi khí hậu." },
  "1781705929549-45": { pos: "n phr", exVi: "Băng tan ở hai cực là hậu quả trực tiếp của sự nóng lên toàn cầu." },
  "1781705929549-46": { pos: "n phr", exVi: "Mất môi trường sống là nguyên nhân chính khiến nhiều loài chim đang biến mất." },
  "1781705929549-47": { pos: "n phr", exVi: "Vụ tràn dầu gần đây đã gây thiệt hại nặng nề cho các hệ sinh thái biển." },
  "1781705929549-48": { pos: "n", exVi: "Chúng ta nên bảo vệ động vật hoang dã bằng cách chấm dứt nạn săn bắt trái phép." },
  "1781705929549-49": { pos: "n", exVi: "Tòa nhà đã trải qua những thay đổi lớn để xe lăn có thể tiếp cận được." },
  "1781705929549-50": { pos: "n", exVi: "Các chiến dịch giúp nâng cao nhận thức của công chúng về bảo vệ môi trường." },
  "1781705929549-51": { pos: "n", exVi: "Chính phủ đang nỗ lực rất nhiều trong việc bảo tồn động vật hoang dã." },
  "1781705929549-52": { pos: "n", exVi: "Bộ lọc được dùng để loại bỏ các chất gây ô nhiễm có hại khỏi nước uống." },
  "1781705929549-53": { pos: "n", exVi: "Các nhà máy thải ra rất nhiều khí thải mỗi ngày." },
  "1781705929549-54": { pos: "adj", exVi: "Biến đổi khí hậu có tác động đáng kể lên các loài động vật." },
  "1781705929549-55": { pos: "adv", exVi: "Vấn đề này chủ yếu do các hoạt động của con người gây ra." },
  "1781705929549-56": { pos: "n phr", exVi: "Ô nhiễm là mối đe dọa đối với các loài sinh vật biển." },
  "1781705929549-57": { pos: "n", exVi: "Một số công ty quan tâm đến lợi nhuận hơn là môi trường." },
  "1781705929549-58": { pos: "n", exVi: "Nhiều người đến các vườn quốc gia để giải trí." },
  "1781705929549-59": { pos: "prep", exVi: "Chúng ta nên hành động chống lại nạn săn bắt động vật hoang dã." },
  "1781705929549-60": { pos: "v", exVi: "Chúng ta cần bảo tồn rừng." },
  "1781705929549-61": { pos: "n phr", exVi: "Nhiều loài động vật hoang dã đang đối mặt với nguy cơ tuyệt chủng." },
  "1781705929549-62": { pos: "v", exVi: "Các loài động vật chịu khổ khi môi trường sống của chúng bị phá hủy." },
  "1781705929549-63": { pos: "n phr", exVi: "Một con voi có thể nặng vài tấn." },
  "1781705929549-64": { pos: "n", exVi: "Nước sạch rất quan trọng đối với sự sống còn của nhiều loài." },
  "1781705929549-65": { pos: "adv", exVi: "Một số loài vật không còn nơi nào để sống sau khi rừng bị chặt phá." },
  "1781705929549-66": { pos: "n", exVi: "Kim loại nặng là một chất gây ô nhiễm nguy hiểm trong các hệ thống sông ngòi." },
  "1781705929549-67": { pos: "n", exVi: "Chính sách mới sẽ có tác động rất lớn đến môi trường." },
  "1781705929549-69": { pos: "v", exVi: "Dự án hướng đến việc thả những con chim bị bắt trở lại tự nhiên." },
  "1781705929549-71": { pos: "adj", exVi: "Việc tái chế có tác động tích cực đến việc giảm rác thải đô thị." },
  "1781705929549-73": { pos: "v", exVi: "Chúng ta nên đầu tư nhiều tiền hơn vào các công nghệ xanh." },
  "1781705929549-75": { pos: "adj", exVi: "Dùng túi vải là một lựa chọn thân thiện với môi trường." },
  "1781705929549-76": { pos: "v phr", exVi: "Tôi thường lên lớp vào buổi sáng và kết thúc giờ học vào buổi trưa." },
  "1781705929549-77": { pos: "v phr", exVi: "Hãy nghỉ giải lao mười phút trước khi tiếp tục cuộc họp." },
  "1781705929549-78": { pos: "v phr", exVi: "Tối qua tôi thức khuya để hoàn thành một bài tập." },
  "1781705929549-79": { pos: "phr v", exVi: "Tôi dự định gặp gỡ những người bạn cũ vào cuối tuần này." },
  "1781705929549-80": { pos: "v phr", exVi: "Nếu bạn học chăm chỉ, chắc chắn bạn sẽ đậu kỳ thi." },
  "1781705929549-81": { pos: "v phr", exVi: "Sinh viên được khuyến khích tham gia vào công tác cộng đồng." },
  "1781705929549-82": { pos: "n phr", exVi: "Tham gia các hoạt động ngoại khóa giúp bạn xây dựng kỹ năng mềm." },
  "1781705929549-83": { pos: "n phr", exVi: "Làm công việc tình nguyện là một cách tuyệt vời để giúp đỡ cộng đồng." },
  "1781705929549-84": { pos: "v phr", exVi: "Ngày mai tôi có một kỳ thi quan trọng nên tối nay tôi phải học bài chăm chỉ." },
  "1781705929549-85": { pos: "v phr", exVi: "Tôi tham gia một lớp học kèm vào mỗi thứ Sáu để cải thiện kỹ năng toán." },
  "1781705929549-86": { pos: "n phr", exVi: "Nhiều học sinh tốt nghiệp trung học chọn theo đuổi giáo dục đại học." },
  "1781705929549-87": { pos: "n", exVi: "Cô ấy có bằng cử nhân ngành khoa học máy tính." },
  "1781705929549-88": { pos: "n", exVi: "Có chứng chỉ sư phạm sẽ giúp bạn tìm việc dễ dàng." },
  "1781705929549-89": { pos: "v", exVi: "Bạn cần ít nhất 50% tổng số điểm để đạt." },
  "1781705929549-90": { pos: "v phr", exVi: "Chúng tôi phải làm một bài kiểm tra vào cuối mỗi học kỳ." },
  "1781705929549-91": { pos: "n", exVi: "Cậu ấy đạt điểm cao nhất trong bài luận tiếng Anh." },
  "1781705929549-92": { pos: "n", exVi: "Cô ấy đã giành giải nhất trong cuộc thi viết toàn quốc." },
  "1781705929549-93": { pos: "n", exVi: "Cuộc thi bơi sẽ diễn ra vào Chủ nhật này." },
  "1781705929549-94": { pos: "adj", exVi: "Du học cho bạn cơ hội gặp gỡ các sinh viên quốc tế." },
  "1781705929549-95": { pos: "n", exVi: "Khi còn là sinh viên đại học, anh ấy dành rất nhiều thời gian nghiên cứu." },
  "1781705929549-96": { pos: "v", exVi: "Rất khó tập trung học khi bên ngoài ồn ào." },
  "1781705929549-97": { pos: "n", exVi: "Đồng hồ thông minh là một thiết bị điện tử rất phổ biến ngày nay." },
  "1781705929549-98": { pos: "adj", exVi: "Việc sửa một chiếc laptop cũ đôi khi khá tốn kém." },
  "1781705929549-99": { pos: "n", exVi: "Ứng dụng điện thoại này có một chức năng theo dõi số bước chân hằng ngày của bạn." },
  "1781705929549-100": { pos: "n phr", exVi: "Phần lớn điện thoại hiện đại có màn hình cảm ứng rất nhạy." },
  "1781705929549-101": { pos: "v phr", exVi: "Tôi dùng lịch trực tuyến để theo dõi các cuộc hẹn của mình." },
  "1781705929549-102": { pos: "adj", exVi: "Phòng thí nghiệm được trang bị công nghệ tiên tiến nhất." },
  "1781705929549-103": { pos: "adj", exVi: "Một cục sạc dự phòng là thứ thiết yếu khi bạn đi cả ngày." },
  "1781705929549-104": { pos: "adj", exVi: "Máy ảnh này chụp được ảnh độ phân giải cao ngay cả trong điều kiện thiếu sáng." },
  "1781705929549-105": { pos: "v", exVi: "Tôi muốn dùng chiếc điện thoại mới để ghi lại những kỷ niệm của chuyến đi." },
  "1781705929549-106": { pos: "adj", exVi: "Một chiếc laptop đáng tin cậy là thứ thiết yếu với bất kỳ ai làm việc từ xa." },
  "1781705929549-117": { pos: "n", exVi: "Tết Trung thu là một dịp đặc biệt dành cho trẻ em." },
  "1781705929549-118": { pos: "n", exVi: "Đi thăm họ hàng vào ngày mùng một Tết là một phong tục." },
  "1781705929549-119": { pos: "n", exVi: "Mọi người đều mặc trang phục hóa trang sặc sỡ đến bữa tiệc Halloween." },
  "1781705929549-120": { pos: "n", exVi: "Chúng tôi đứng trên phố xem đoàn diễu hành lễ hội đi qua." },
  "1781705929549-121": { pos: "n", exVi: "Trẻ em rước những chiếc đèn lồng rực rỡ trong dịp tết Trung thu." },
  "1781705929549-122": { pos: "n", exVi: "Màn trình diễn pháo hoa ngoạn mục bắt đầu đúng lúc nửa đêm." },
  "1781705929549-123": { pos: "v", exVi: "Các nghệ sĩ địa phương sẽ trình diễn những điệu múa truyền thống trên sân khấu." },
  "1781705929549-124": { pos: "v", exVi: "Mọi người thích trang trí nhà cửa bằng hoa đào." },
  "1781705929549-125": { pos: "v", exVi: "Các gia đình quây quần bên nhau để đón mừng năm mới." },
  "1781705929549-126": { pos: "phr v", exVi: "Bọn trẻ thích hóa trang thành những siêu anh hùng yêu thích của chúng." },
  "1781705929549-127": { pos: "n", exVi: "Bảo tàng trưng bày một hiện vật lịch sử quý hiếm từ Ai Cập." },
  "1781705929549-128": { pos: "adj", exVi: "Rome nổi tiếng với những công trình lịch sử cổ xưa." },
  "1781705929549-129": { pos: "v", exVi: "Các nhà khoa học tiếp tục khám phá những sự thật mới về vũ trụ." },
  "1781705929549-130": { pos: "n", exVi: "Nhiều du khách đến Hy Lạp để chiêm ngưỡng những tàn tích cổ xưa." },
  "1781705929549-131": { pos: "v", exVi: "Một trận mưa lớn có thể phá hỏng kế hoạch dã ngoại ngoài trời của chúng tôi." },
  "1781705929549-132": { pos: "n phr", exVi: "Bản tuyên ngôn độc lập là một sự kiện lịch sử trọng đại." },
  "1781705929549-133": { pos: "v phr", exVi: "Việt Nam giành được độc lập sau nhiều năm đấu tranh gian khổ." },
  "1781705929549-134": { pos: "n phr", exVi: "Các lễ hội truyền thống đóng vai trò thiết yếu trong việc gìn giữ văn hóa dân tộc." },
  "1781705929549-135": { pos: "n", exVi: "Tốt nghiệp đại học là một cột mốc lớn trong cuộc đời tôi." },
  "1781705929549-136": { pos: "n phr", exVi: "Phố cổ Hội An là một di tích lịch sử nổi tiếng ở Việt Nam." },
  "1781705929549-137": { pos: "v/n", exVi: "Quân đội đã đánh bại quân xâm lược và giành chiến thắng trong cuộc chiến." },
  "1781705929549-138": { pos: "n", exVi: "Làm đèn lồng giấy là một nghề thủ công truyền thống ở ngôi làng này." },
  "1781705929549-139": { pos: "n phr", exVi: "Truyền hình vẫn là hình thức truyền thông phát tin chủ đạo trên toàn thế giới." },
  "1781705929549-140": { pos: "n phr", exVi: "Giới trẻ thích truyền thông kỹ thuật số hơn báo giấy truyền thống." },
  "1781705929549-141": { pos: "n phr", exVi: "Đọc báo điện tử giúp tôi cập nhật các sự kiện toàn cầu." },
  "1781705929549-142": { pos: "n phr", exVi: "Tôi đã đăng ký dài hạn một tạp chí hàng tháng về công nghệ." },
  "1781705929549-143": { pos: "n phr", exVi: "Mẩu quảng cáo truyền hình hài hước đó lập tức thu hút sự chú ý của tôi." },
  "1781705929549-144": { pos: "n", exVi: "Đọc sách điện tử trên máy tính bảng rất tiện lợi khi đi du lịch." },
  "1781705929549-145": { pos: "n phr", exVi: "Chương trình TV yêu thích của tôi được phát sóng vào tối thứ Bảy hằng tuần." },
  "1781705929549-146": { pos: "n", exVi: "Có một biển quảng cáo kỹ thuật số khổng lồ ở ngã tư thành phố." },
  "1781705929549-147": { pos: "n phr", exVi: "Ông tôi vẫn đọc báo hàng ngày vào mỗi buổi sáng." },
  "1781705929549-148": { pos: "n phr", exVi: "Kênh truyền hình đã ngắt chương trình để phát tin nóng về cơn bão." },
  "1781705929549-149": { pos: "phr v", exVi: "Tôi cần cập nhật tin tức mới nhất vì tôi đã ngoại tuyến cả ngày." },
  "1781705929549-150": { pos: "phr v", exVi: "Cô ấy phải giải trình về số tiền bị thiếu trong hộp tiền mặt lặt vặt." },
  "1781705929549-151": { pos: "phr v", exVi: "Xe của chúng tôi bị hỏng giữa đường cao tốc, gây ra ùn tắc giao thông." },
  "1781705929549-152": { pos: "phr v", exVi: "Các sinh viên được yêu cầu tiến hành một cuộc khảo sát như một phần của dự án nghiên cứu." },
  "1781705929549-153": { pos: "phr v", exVi: "Sau khi bị ốm, cô ấy phải cố gắng rất nhiều để bắt kịp với phần còn lại của lớp." },
  "1781705929549-154": { pos: "phr v", exVi: "Công ty phải ngừng hoạt động do thua lỗ tài chính nặng nề." },
  "1781705929549-155": { pos: "phr v", exVi: "Một vấn đề mới đã nảy sinh trong cuộc đàm phán giữa hai bên." },
  "1781705929549-156": { pos: "phr v", exVi: "Để cải thiện sức khỏe, cô ấy quyết định cắt giảm đồ ăn vặt và ăn nhiều rau hơn." },
  "1781705929549-157": { pos: "phr v", exVi: "Cô ấy cảm thấy chán nản khi nhận ra mình đã lỡ buổi hòa nhạc của ban nhạc yêu thích." },
  "1781705929549-158": { pos: "phr v", exVi: "Cô ấy có mối quan hệ rất tốt với đồng nghiệp, điều đó khiến công việc thú vị hơn." },
  "1781705929549-159": { pos: "phr v", exVi: "Cô ấy không thể vượt qua nỗi sợ độ cao, ngay cả sau nhiều buổi trị liệu." },
  "1781705929549-160": { pos: "phr v", exVi: "Anh ấy sẽ tiếp quản vị trí quản lý bắt đầu từ tháng sau." },
  "1781705929549-161": { pos: "phr v", exVi: "Cô ấy rất giống mẹ mình; họ có cùng một nụ cười." },
  "1781705929549-162": { pos: "phr v", exVi: "Tôi đã quyết định bắt đầu học bơi để giữ dáng." },
  "1781705929549-163": { pos: "phr v", exVi: "Máy bay dự kiến cất cánh lúc 8 giờ sáng." },
  "1781705929549-164": { pos: "phr v", exVi: "Bạn có thể chăm sóc con mèo của tôi trong lúc tôi đi nghỉ không?" },
  "1781705929549-165": { pos: "phr v", exVi: "Tôi thực sự đang rất mong chờ kỳ nghỉ sắp tới của chúng ta." },
  "1781705929549-166": { pos: "phr v", exVi: "Mọi người đều kính trọng cô ấy vì sự tận tụy và chăm chỉ." },
  "1781705929549-167": { pos: "phr v", exVi: "Tôi đang tìm chìa khóa của mình; bạn có thấy chúng ở đâu không?" },
  "1781705929549-168": { pos: "phr v", exVi: "Hôm qua tôi tình cờ tìm thấy một tấm ảnh cũ của bạn trên gác mái." },
  "1781705929549-169": { pos: "phr v", exVi: "Ẩu đả nổ ra giữa hai nhóm ngay sau khi trận đấu kết thúc." },
  "1781706271934-0": { pos: "v phr", exVi: "Mỗi chiều Chủ nhật, tôi thường đi mát-xa để nạp lại năng lượng cho tuần mới." },
  "1781706271934-2": { pos: "v phr", exVi: "Vào thời gian rảnh, tôi thích tham dự một buổi workshop về nhiếp ảnh vì tôi muốn chụp ảnh đẹp hơn." },
  "1781706271934-3": { pos: "v", exVi: "Khi cảm thấy căng thẳng hay mệt mỏi, tôi thường ngồi trong một căn phòng yên tĩnh và thiền để thư giãn đầu óc." },
  "1781706271934-4": { pos: "adj", exVi: "Tôi nghĩ tham quan bảo tàng rất bổ ích với học sinh vì các em có thể học về lịch sử." },
  "1781706271934-5": { pos: "n", exVi: "Khi tôi đến Huế mùa hè năm ngoái, tôi đã thấy nhiều hiện vật đẹp trong cung điện cổ." },
};

// 5 thẻ dữ liệu gốc thiếu hẳn phần nghĩa tiếng Việt (chỉ có phiên âm + ví dụ) -> tự soạn.
// 5 thẻ còn lại: nghĩa cũ sai/hụt so với câu ví dụ đang dùng -> chỉnh cho khớp.
const VI_OVERRIDE = {
  "1781706271934-1": "đi dã ngoại (ăn uống ngoài trời)",   // thiếu
  "1781706271934-0": "đi mát-xa",                            // thiếu
  "1781706271934-2": "tham dự buổi hội thảo / lớp thực hành", // thiếu
  "1781706271934-4": "mang tính giáo dục, bổ ích",           // thiếu
  "1781706271934-5": "hiện vật (cổ)",                        // thiếu
  "1781705929549-48": "động vật hoang dã",                   // cũ: "Hoang dã" (wildlife là danh từ)
  "1781705929549-97": "thiết bị nhỏ tiện dụng, đồ công nghệ", // cũ: "tiện ích"
  "1781705929549-105": "ghi lại, chụp lại",                  // cũ: "chụp" (ví dụ là capture memories)
  "1781705929549-138": "nghề thủ công",                      // cũ: "Thủ công"
  "1781705929549-69": "thả, phóng thích (ra tự nhiên)",      // cũ: "giải phóng"
};

// Phiên âm gốc bị sai hoặc lẫn ký tự không phải IPA ("sth"/"sb", dấu / lồng nhau).
const IPA_OVERRIDE = {
  "1781705929549-71": "/ˈpɒzətɪv/",                 // cũ: /ˈpɒvətɪv/ - sai phụ âm
  "1781705929549-86": "/ˈhaɪər ˌedʒuˈkeɪʃn/",       // cũ: /ˌedʒuˈgoʊʃn/ - sai
  "1781705929549-76": "/hæv, ˈfɪnɪʃ ˈklɑːsɪz/",     // cũ: dấu / lồng nhau
  "1781705929549-80": "/pɑːs, feɪl ði ɪɡˈzæm/",     // cũ: dấu / lồng nhau
  "1781705929549-142": "/ˈwiːkli, ˈmʌnθli ˌmæɡəˈziːn/", // cũ: lồng nhau + 2 dấu trọng âm
  "1781705929549-147": "/ˈdeɪli, ˈwiːkli ˈnjuːzpeɪpər/", // cũ: lồng nhau
  "1781705929549-160": "/teɪk ˈəʊvər/",             // bỏ "sth" khỏi phiên âm
  "1781705929549-161": "/teɪk ˈɑːftər/",            // bỏ "sb"
  "1781705929549-162": "/teɪk ʌp/",                 // bỏ "sth"
  "1781705929549-164": "/lʊk ˈɑːftər/",             // bỏ "sth/sb"
  "1781705929549-165": "/lʊk ˈfɔːwəd tuː/",         // bỏ "sth"
  "1781705929549-166": "/lʊk ʌp tuː/",              // bỏ "sb"
  "1781705929549-167": "/lʊk fɔː/",                 // bỏ "sth"
  "1781705929549-168": "/kʌm əˈkrɒs/",              // bỏ "sb/sth"
};

// Tách "nghĩa (/phiên âm/). Ví dụ - câu" -> { vi, ipa, exEn }
function parseOld(meaning) {
  const exSplit = (meaning || "").split(/\.\s*Ví dụ\s*[-:]\s*/i);
  const head = exSplit[0];
  const exEn = (exSplit[1] || "").trim().replace(/^"|"$/g, "");
  const ipaMatch = head.match(/\((\/[^)]*\/)\)\s*$/);
  const ipa = ipaMatch ? ipaMatch[1].trim() : null;
  const vi = head.replace(/\s*\((\/[^)]*\/)\)\s*$/, "").trim();
  return { vi, ipa, exEn };
}

const isStd = (m) => /^Phiên âm:/m.test(m || "") && /^Nghĩa:/m.test(m || "") && /^Ví dụ:/m.test(m || "");
const straight = (s) => s.replace(/’/g, "'").replace(/[“”]/g, '"');

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
  const targets = cards.filter((c) => c.deck === "IELTS" && !isStd(c.meaning));
  console.log(`Đã nạp ${cards.length} thẻ; deck IELTS chưa chuẩn: ${targets.length}.`);

  const updates = [];
  const problems = [];
  for (const c of targets) {
    const d = DATA[c.id];
    if (!d) { problems.push(`Chưa soạn dữ liệu cho id ${c.id} (${c.word})`); continue; }
    const p = parseOld(c.meaning);
    const vi = VI_OVERRIDE[c.id] || p.vi;
    const ipa = IPA_OVERRIDE[c.id] || p.ipa;
    if (!vi) { problems.push(`Thiếu nghĩa: ${c.id} (${c.word})`); continue; }
    if (!ipa) { problems.push(`Thiếu phiên âm: ${c.id} (${c.word})`); continue; }
    if (!p.exEn) { problems.push(`Thiếu ví dụ: ${c.id} (${c.word})`); continue; }
    updates.push({
      id: c.id,
      word: c.word,
      meaning: [
        `Phiên âm: (${d.pos}) ${ipa}`,
        `Nghĩa: ${vi}`,
        `Ví dụ: "${straight(p.exEn)}" (${d.exVi})`,
      ].join("\n"),
      deck: c.deck,
      status: c.status,
    });
  }

  const extra = Object.keys(DATA).filter((id) => !targets.some((c) => c.id === id));
  if (extra.length) problems.push(`Có dữ liệu thừa không khớp thẻ nào: ${extra.join(", ")}`);

  console.log(`Chuẩn hóa: ${updates.length}/${targets.length} thẻ.`);
  if (problems.length) { console.log("VẤN ĐỀ:"); problems.forEach((p) => console.log("   -", p)); }

  console.log("\n--- XEM TRƯỚC 3 THẺ ---");
  updates.slice(0, 3).forEach((u) => {
    console.log("MẶT TRƯỚC: " + u.word);
    console.log(u.meaning);
    console.log("---");
  });

  if (!apply) { console.log("\n(chạy thử — thêm --apply để ghi thật)"); return; }
  if (problems.length) { console.log("\nDỪNG: còn vấn đề chưa xử lý, không ghi."); process.exit(1); }

  // Ghi theo lô để tránh payload quá lớn
  for (let i = 0; i < updates.length; i += 50) {
    const chunk = updates.slice(i, i + 50);
    const { error } = await supabase.from("cards").upsert(chunk, { onConflict: "id" });
    if (error) throw error;
    console.log(`   đã ghi ${Math.min(i + 50, updates.length)}/${updates.length}`);
  }
  console.log(`\n✓ ĐÃ GHI ${updates.length} thẻ.`);
}

run().catch((e) => { console.error("Lỗi:", e.message); process.exit(1); });
