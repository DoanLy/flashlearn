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

1. **Sửa thuật toán cắt câu của "Chép chính tả"** (`src/App.jsx`, hàm `parseSrtTranscript` và các hằng số `*_CLAUSE_MARKERS` xung quanh dòng ~1200).
   - Vấn đề cũ: phụ đề auto-generated của YouTube không có dấu câu, nên hàm cũ chỉ cắt câu khi đủ 12 từ hoặc gặp khoảng lặng giữa cue → cắt bừa giữa mệnh đề, không theo nghĩa.
   - Đã sửa: trải phụ đề thành từng từ kèm mốc thời gian nội suy, ưu tiên cắt tại các điểm ngắt mệnh đề tự nhiên (however, because, which, who, so/and/but + chủ ngữ, firstly/secondly/lastly, …); chỉ khi không tìm được điểm ngắt tốt mới lùi lại tìm giới từ gần nhất trong cửa sổ 6 từ, và cuối cùng mới cắt cứng ở giới hạn 16 từ (MAX_SEGMENT_WORDS).
   - Đã test bằng script Node độc lập trên file SRT thật (video "Unit 4 Family structures") và chạy thử trong app: 151 câu cũ → 166 câu, ranh giới câu tự nhiên hơn hẳn.
   - **Caveat quan trọng:** segment được tính một lần lúc lưu video (lúc bấm "Lưu video"), lưu cứng vào `localStorage`. Video "Chép chính tả" nào **đã lưu từ trước** vẫn giữ nguyên cách cắt câu cũ — muốn áp thuật toán mới thì phải xoá và thêm lại video đó (dán lại transcript).
2. **Thêm badge version build** như mô tả ở trên (`vite.config.js`, `eslint.config.js`, `package.json`, `src/App.jsx`).

## Việc còn treo / có thể làm tiếp

- Chưa có cách tự động re-parse lại các video "Chép chính tả" đã lưu để áp thuật toán cắt câu mới — hiện phải xoá/thêm lại thủ công.
- Chưa có staging DB cho Supabase; nếu cần test nhiều, cân nhắc tạo project Supabase riêng cho dev.
