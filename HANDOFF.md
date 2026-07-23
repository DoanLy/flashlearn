# HANDOFF

Ghi lại bối cảnh cho phiên làm việc (người hoặc AI) tiếp theo trên project FlashLearn, để không phải đọc lại toàn bộ git history mới hiểu được đang ở đâu.

## Project

- Source: `C:\Users\lenovo\flashlearn`, repo GitHub `DoanLy/flashlearn.git`.
- Deploy: Vercel, project `flashlearn-its7` — https://flashlearn-its7.vercel.app
- Dữ liệu: Supabase Postgres (project `qrufhskmxcuowavwokau`, bảng `cards`), migrate khỏi Google Sheets ngày 2026-07-17.
  **Không có staging/DB test riêng** — kể cả chạy `npm run dev` ở local cũng đọc/ghi thẳng vào dữ liệu học thật (key Supabase hardcode trong `App.jsx`). Bất kỳ ai test bằng cách bấm qua UI (đặc biệt các nút như "Đã thuộc"/"Chưa thuộc") đều sửa dữ liệu thật — nên snapshot trạng thái trước khi test, hoặc test logic trực tiếp bằng script Node thay vì thao tác UI.
- Tính năng "Chép chính tả" (dictation, nghe video YouTube + gõ lại) lưu transcript/segments trong `localStorage` của trình duyệt (`flashlearn_dictation_videos`), **không** lưu trên Supabase.

## Badge version build (mới thêm — 2026-07-22)

Góc dưới bên phải màn hình (ngay trên thanh nav) có một badge nhỏ dạng `v{version} · {commit ngắn}`, ví dụ `v1.1.0 · 2c3b086`. Hover vào sẽ thấy tooltip giờ build.

- Nguồn: `vite.config.js` inject 3 hằng số lúc build — `__APP_VERSION__` (lấy từ `package.json`), `__BUILD_COMMIT__` (ưu tiên `VERCEL_GIT_COMMIT_SHA` do Vercel tự cấp lúc build, fallback `git rev-parse --short HEAD` khi build local), `__BUILD_TIME__`.
- Badge render trong `App.jsx`, ngay sau thẻ `</nav>`.
- **Để biết Vercel đã deploy bản build mới hay chưa:** chỉ cần reload trang production và nhìn commit hash trong badge có khớp với commit vừa push không.
- **Khi thêm tính năng/sửa lỗi đáng kể, hãy bump `version` trong `package.json`** (ví dụ 1.1.0 → 1.2.0) trước khi commit, để badge phản ánh đúng "phiên bản" chứ không chỉ hash. Hash luôn tự cập nhật dù có bump version hay không.

## Phiên làm việc gần nhất (2026-07-23)

0. **Fix audio lệch chữ ở ranh giới nội suy — v1.2.1** (ngay sau v1.2.0, user báo "text và voice không khớp").
   - Nguyên nhân: mốc cắt giữa cue là nội suy theo tỉ lệ ký tự, nhưng tốc độ nói không đều (tệ nhất: cue đánh vần "A U D L E Y" dài 6.8s — ít ký tự, đọc chậm → mốc lệch cỡ 2 giây, câu "How's it spelled?" nuốt mất mấy chữ cái).
   - Cách sửa: KHÔNG cố cắt audio chính xác giữa cue (bất khả thi với timestamp theo dòng). Thay vào đó mỗi mốc nội suy mang `startSlack`/`endSlack` = `FUZZY_CUT_SLACK_RATIO` (0.35) × độ dài cue, kẹp trong phạm vi cue; cửa sổ audio của câu được NỚI thêm chừng đó về mỗi phía tại mép nội suy (mép cue thật giữ nguyên). Segment lưu thêm cờ `fuzzyEnd` — `playSegment` bỏ kẹp `endTime` về `next.start` cho các mốc này (hai câu quanh ranh giới nội suy cố tình phát chờm lên nhau).
   - Trade-off CHỦ ĐÍCH: ở ranh giới nội suy có thể nghe chờm vài từ của câu bên cạnh — đổi lấy đảm bảo câu hiển thị luôn nằm TRỌN trong audio. Đừng "tối ưu" bỏ phần chờm này đi mà không có timestamp theo từ.
   - Slack thừa kế qua các lần tách lồng nhau (cue tách ">>" rồi tách tiếp dấu câu → mép cha giữ slack của nó).
   - Video đã lưu trước v1.2.1 không có slack/cờ (`fuzzyEnd` undefined) → hành vi như cũ, phải xoá + thêm lại để nhận fix.

1. **Cắt câu "Chép chính tả" theo dấu chấm câu — v1.2.0** (`src/App.jsx`, các hàm `splitCueAtSentenceEnds` + `transcriptIsPunctuated` + `mergeCuesIntoSegments`, quanh dòng ~1260).
   - **Bối cảnh:** user báo câu bị cắt vô nghĩa (vd `"birthday. And I liked the sound of that"`) trên video IELTS Cam 20 Test 1. Nguyên nhân: phụ đề auto-generated từ DownSub **có dấu chấm câu nằm GIỮA cue**, nhưng thuật toán v1.1.1 tuyệt đối không cắt trong cue → dấu chấm giữa cue không bao giờ thành điểm ngắt, câu bị chốt bằng trần số từ ở chỗ tuỳ tiện.
   - **Nới nguyên tắc v1.1.1 một cách CÓ KIỂM SOÁT:** giờ cue ĐƯỢC tách tại dấu câu nằm giữa cue (kết câu `.!?…` với guard viết tắt/chữ hoa; và cả `,;:` để có thêm lựa chọn điểm ngắt), thời gian nội suy theo tỉ lệ ký tự — cùng cách đã dùng cho `>>`. Khác bản v1.1.0 từng gây lệch audio: nội suy ở đây bị chặn trong phạm vi MỘT cue (~2-3s) nên sai số tối đa ~±0.5s tại đúng chỗ có quãng nghỉ tự nhiên (dấu câu), không tích luỹ. Nếu user báo bị cụt từ ở ranh giới câu → cân nhắc thêm bias nhỏ (+0.2s) cho mốc cắt nội suy.
   - **Hai chế độ ghép** (`transcriptIsPunctuated`: ≥3 dấu kết câu và trung bình ≤30 từ/câu):
     - CÓ dấu câu: ưu tiên trọn câu — trần 20 từ (`MAX_PUNCTUATED_SEGMENT_WORDS`), KHÔNG cắt theo từ mở mệnh đề; câu sắp chạm trần thì ngắt tại dấu phẩy / trước từ mở mệnh đề; cho "nợ" thêm 6 từ (`PUNCTUATED_HARD_SLACK_WORDS`) để câu kịp kết thúc trước khi chốt cứng.
     - KHÔNG dấu câu: giữ nguyên hành vi v1.1.1 (trần 13 từ, cắt theo khoảng lặng/mệnh đề).
   - `parseTimedTranscript` (định dạng dán tay "Ns") giờ cũng đi qua `mergeCuesIntoSegments` thay vì mỗi block một câu (block cuối `end = null` — playback đã có fallback sẵn).
   - Đã test Node độc lập (trích nguyên văn code từ App.jsx) trên SRT thật của video wk_1MiLAT0c: 98 câu, 96 câu kết thúc trọn vẹn, 2 câu dài chia đúng tại dấu phẩy trước mệnh đề. Lint có 3 lỗi CÓ SẴN từ trước (dòng ~1148 emoji regex, ~1491 setState trong effect) — không thuộc thay đổi này.
   - **Nhắc lại caveat cũ:** video đã lưu mang segment cũ trong `localStorage` — phải xoá và Thêm video lại mới có cách cắt mới.

## Phiên trước (2026-07-22)

1. **Cắt câu "Chép chính tả" — bản v1.1.1 (RÀNG BUỘC SYNC, thay cho v1.1.0):** (`src/App.jsx`, hàm `parseSrtTranscript` + `cueStartsNewClause` + các hằng số `*_CLAUSE_MARKERS`, quanh dòng ~1200).
   - **Bài học quan trọng nhất:** file `.srt`/`.vtt` từ DownSub chỉ có mốc thời gian theo TỪNG DÒNG caption (cue), KHÔNG có mốc theo từng từ. Bản v1.1.0 mình từng trải phụ đề thành từng từ rồi nội suy mốc thời gian để cắt câu ĐẸP giữa cue — nhưng caption tự động đọc không đều mỗi từ, nên mốc nội suy sai → **audio phát ra lệch hẳn với chữ hiển thị** (user báo lỗi ngay). Playback (`playSegment`, ~dòng 1670) seek đúng `seg.start` và dừng ở `seg.end`, nên `[start,end]` BẮT BUỘC phải là mốc cue thật thì audio mới khớp.
   - **Nguyên tắc sống còn (đã NỚI ở v1.2.0 — xem phiên 2026-07-23):** KHÔNG cắt cue làm đôi tuỳ tiện. Mỗi câu = một dãy cue TRỌN VẸN ⇒ `[start,end]` luôn bằng mốc caption thật ⇒ audio khớp chữ 100%. (v1.2.0 cho phép ngoại lệ duy nhất: cắt tại DẤU CÂU nằm giữa cue, nội suy cục bộ trong một cue — sai số nhỏ, không tích luỹ như lỗi v1.1.0.)
   - Trong ràng buộc đó, chọn điểm ngắt tốt nhất CÓ THỂ ở ranh giới cue: ưu tiên dấu kết câu, khoảng lặng, hoặc khi cue kế mở đầu mệnh đề mới (however/because/which/and+chủ ngữ…); và chốt sớm TRƯỚC khi gộp thêm cue làm vượt `MAX_SEGMENT_WORDS` (=13) để câu ngắn dễ chép. `MIN_SEGMENT_WORDS`=5.
   - Hệ quả: ranh giới câu vẫn bám theo dòng caption của YouTube (đôi khi ngắt giữa cụm), KHÔNG thể "đẹp như câu văn" nếu transcript không có dấu câu — đây là giới hạn dữ liệu, không phải bug. Muốn ranh giới đúng câu hoàn chỉnh: dùng transcript CÓ dấu chấm câu (khi đó `SENTENCE_END_RE` sẽ cắt đúng câu, vẫn synced).
   - Đã test Node độc lập trên SRT thật + chạy trong app: 224 câu, sync 224/224 (mọi start/end trùng mốc cue thật), độ dài 5–13 từ (tb 9.6).
   - **Caveat:** segment tính một lần lúc "Lưu video", lưu cứng vào `localStorage` (video đã lưu KHÔNG giữ transcript gốc). Video "Chép chính tả" đã lưu từ trước vẫn mang segment cũ/lỗi → **phải xoá và Thêm video lại** (dán lại transcript) mới có cách cắt mới.
2. **Thêm badge version build** (`vite.config.js`, `eslint.config.js`, `package.json`, `src/App.jsx`).

## Việc còn treo / có thể làm tiếp

- Chưa có cách tự động re-parse lại các video "Chép chính tả" đã lưu để áp thuật toán cắt câu mới — hiện phải xoá/thêm lại thủ công.
- Chưa có staging DB cho Supabase; nếu cần test nhiều, cân nhắc tạo project Supabase riêng cho dev.
