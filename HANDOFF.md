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

## Phiên làm việc gần nhất (2026-07-22)

1. **Cắt câu "Chép chính tả" — bản v1.1.1 (RÀNG BUỘC SYNC, thay cho v1.1.0):** (`src/App.jsx`, hàm `parseSrtTranscript` + `cueStartsNewClause` + các hằng số `*_CLAUSE_MARKERS`, quanh dòng ~1200).
   - **Bài học quan trọng nhất:** file `.srt`/`.vtt` từ DownSub chỉ có mốc thời gian theo TỪNG DÒNG caption (cue), KHÔNG có mốc theo từng từ. Bản v1.1.0 mình từng trải phụ đề thành từng từ rồi nội suy mốc thời gian để cắt câu ĐẸP giữa cue — nhưng caption tự động đọc không đều mỗi từ, nên mốc nội suy sai → **audio phát ra lệch hẳn với chữ hiển thị** (user báo lỗi ngay). Playback (`playSegment`, ~dòng 1670) seek đúng `seg.start` và dừng ở `seg.end`, nên `[start,end]` BẮT BUỘC phải là mốc cue thật thì audio mới khớp.
   - **Nguyên tắc sống còn (đừng phá lại):** KHÔNG BAO GIỜ cắt một cue làm đôi. Mỗi câu = một dãy cue TRỌN VẸN ⇒ `[start,end]` luôn bằng mốc caption thật ⇒ audio khớp chữ 100%.
   - Trong ràng buộc đó, chọn điểm ngắt tốt nhất CÓ THỂ ở ranh giới cue: ưu tiên dấu kết câu, khoảng lặng, hoặc khi cue kế mở đầu mệnh đề mới (however/because/which/and+chủ ngữ…); và chốt sớm TRƯỚC khi gộp thêm cue làm vượt `MAX_SEGMENT_WORDS` (=13) để câu ngắn dễ chép. `MIN_SEGMENT_WORDS`=5.
   - Hệ quả: ranh giới câu vẫn bám theo dòng caption của YouTube (đôi khi ngắt giữa cụm), KHÔNG thể "đẹp như câu văn" nếu transcript không có dấu câu — đây là giới hạn dữ liệu, không phải bug. Muốn ranh giới đúng câu hoàn chỉnh: dùng transcript CÓ dấu chấm câu (khi đó `SENTENCE_END_RE` sẽ cắt đúng câu, vẫn synced).
   - Đã test Node độc lập trên SRT thật + chạy trong app: 224 câu, sync 224/224 (mọi start/end trùng mốc cue thật), độ dài 5–13 từ (tb 9.6).
   - **Caveat:** segment tính một lần lúc "Lưu video", lưu cứng vào `localStorage` (video đã lưu KHÔNG giữ transcript gốc). Video "Chép chính tả" đã lưu từ trước vẫn mang segment cũ/lỗi → **phải xoá và Thêm video lại** (dán lại transcript) mới có cách cắt mới.
2. **Thêm badge version build** (`vite.config.js`, `eslint.config.js`, `package.json`, `src/App.jsx`).

## Việc còn treo / có thể làm tiếp

- Chưa có cách tự động re-parse lại các video "Chép chính tả" đã lưu để áp thuật toán cắt câu mới — hiện phải xoá/thêm lại thủ công.
- Chưa có staging DB cho Supabase; nếu cần test nhiều, cân nhắc tạo project Supabase riêng cho dev.
