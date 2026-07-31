# HANDOFF

Ghi lại bối cảnh cho phiên làm việc (người hoặc AI) tiếp theo trên project FlashLearn, để không phải đọc lại toàn bộ git history mới hiểu được đang ở đâu.

**Quy tắc bắt buộc:** làm xong BẤT KỲ task nào trong repo này đều phải `git add` → `git commit` → `git push origin main` ngay, không đợi user nhắc.

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

## Phiên làm việc gần nhất (2026-07-31) — v1.16.3: fix "Nghĩa/Ví dụ xuống dòng bị tách sang field khác"

**Lỗi user báo:** ở tab Thêm từ, gõ nhiều dòng trong ô *Nghĩa của từ* rồi lưu; mở Sửa lên thì
dòng 2 nhảy sang ô *Ví dụ* (ví dụ thẻ CHART/"Rất mạnh": `dramatically` ở ô Nghĩa, `enormously`
ở ô Ví dụ).

- **Nguyên nhân:** cột `meaning` lưu theo dòng (`Phiên âm: … / Nghĩa: … / Ví dụ: …`), nhưng
  `parseCardFields` chỉ lấy phần SAU nhãn trên **đúng 1 dòng**; mọi dòng không nhãn bị dồn vào
  mảng `rest`, rồi `rest` được gán bừa sang `example`. Tệ hơn: nếu `example` đã có sẵn thì
  `rest` bị **vứt luôn** ⇒ 6 thẻ `IELT LỚP 2` (Divorce, Earthquake, Requirement, Spread,
  Reserve, Get married) mất dòng dịch tiếng Việt trong ngoặc mỗi khi mở Sửa rồi Lưu.
- **Cách sửa (`src/App.jsx`):**
  - `parseCardFields` giờ nhớ "trường đang mở" — dòng không nhãn nằm sau `Nghĩa:`/`Ví dụ:` được
    nối vào chính trường đó bằng `\n`. `Phiên âm:` **không** mở nhận dòng nối tiếp (ô nhập là
    `<input>`, luôn 1 dòng) nên dữ liệu cũ dạng `Phiên âm: … / <dòng nghĩa không nhãn>` vẫn parse
    y như trước.
  - `pickMeaning` gọi thẳng `parseCardFields` (trước đây tự tách dòng riêng, chỉ trả về 1 dòng).
  - Mặt sau thẻ học: thêm `whitespace-pre-line` cho khối Nghĩa và Ví dụ để thấy đúng chỗ xuống dòng.
  - 4 ô textarea (Thêm từ + Sửa) `rows` 2 → 3 và `resize-y` cho dễ gõ nhiều dòng; placeholder ô
    Nghĩa nhắc "nhấn Enter để xuống dòng".
- **Không cần sửa dữ liệu trên DB** — chuỗi đang lưu vốn đã đúng, chỉ có parser đọc sai.
- **Kiểm chứng:** `scripts/check-card-field-parsing.mjs` (read-only, chạy `node
  scripts/check-card-field-parsing.mjs`) so parser cũ vs mới trên **cả 6692 thẻ thật**:
  chỉ **8 thẻ** đổi kết quả (đúng 8 thẻ đang bị lỗi: 2 thẻ CHART + 6 thẻ IELT LỚP 2 nói trên),
  6684 thẻ còn lại y hệt; **0 thẻ** fail round-trip `parse → format → parse`.
  Chạy thật trên `npm run dev`: mở Sửa thẻ "Rất mạnh" → ô Nghĩa có đủ `dramatically\nenormously`,
  ô Ví dụ rỗng; thêm 1 thẻ tạm nhiều dòng → DB lưu đúng → mở Sửa đọc lại đúng → **đã xoá thẻ tạm**
  (tổng thẻ vẫn 6692, không đụng `status` thẻ nào).

## Phiên trước (2026-07-30) — v1.16.2: bổ sung Phiên âm + Ví dụ (ngữ cảnh văn phòng) cho 3334 thẻ Oxford

User yêu cầu 4 chủ đề `Từ Vựng Oxford 3000 A1/A2/B1/B2` phải có phiên âm và câu ví dụ, ưu
tiên ví dụ liên quan **giao tiếp văn phòng**. **Không sửa dòng code nào trong `src/`** — chỉ
thêm script + dữ liệu, ghi thẳng vào Supabase.

- **Trạng thái DB lúc bắt đầu:** 6690 thẻ, trong đó 3334 thẻ Oxford (A1 **235** · A2 870 ·
  B1 807 · B2 1422). Tức A1 đã mất 578 thẻ so với phiên trước (836) và A2/B1/B2 mỗi deck mất
  1–3 thẻ — nhiều khả năng user tự xoá bớt qua UI. **Đã hỏi user và user chọn giữ nguyên 235
  thẻ A1**, không khôi phục. Muốn khôi phục thì chạy lại `scripts/import-oxford.mjs --apply`
  (script tự bỏ qua thẻ đã có).
- **Phiên âm (IPA Anh-Anh, đúng chuẩn Oxford):** `scripts/build-oxford-phonetics.mjs` đọc DB
  rồi tra 2 nguồn tải về (đã gitignore, KHÔNG commit):
  1. `scripts/_oxford_full_word.json` — bản scrape Oxford Learner's Dictionaries
     (github.com/tyypgzl/Oxford-5000-words, 5948 mục có `phonetics.uk`). Khớp theo từ đã bóc
     chú thích `(…)`, ưu tiên mục **cùng từ loại** rồi **cùng cấp độ CEFR**; nếu thẻ gộp nhiều
     từ loại đọc khác nhau thì ghi cả 2 (`record` → `/ˈrekɔːd/, /rɪˈkɔːd/`, 24 thẻ như vậy).
  2. `scripts/_en_UK_ipa.txt` (ipa-dict en_UK) + `--api` gọi dictionaryapi.dev làm dự phòng —
     **thực tế không cần dùng**: nguồn 1 phủ 3333/3334 thẻ, chỉ `aged` phải điền tay
     (`PHONETIC_OVERRIDE` trong script fill).
  - Kết quả trung gian: `scripts/oxford-phonetics.json` (có commit).
- **Ví dụ:** viết tay 3334 câu, để trong `scripts/oxford-examples/chunk-01..17.txt`, mỗi dòng
  `a1-0001|English sentence|Bản dịch tiếng Việt` (id ngắn = id thẻ bỏ tiền tố `oxford-`).
  Ngữ cảnh công sở (họp, báo cáo, hạn chót, khách hàng, nhà cung cấp, hoá đơn…); từ nào không
  ghép được vào văn phòng (aunt, elephant, snake…) thì dùng câu đời thường nhưng vẫn gắn với
  công ty nếu tự nhiên.
- **Script ghi: `scripts/fill-oxford-phonetics-examples.mjs`** (dry-run mặc định, `--apply`
  mới ghi, tự backup toàn bộ bảng `cards` trước khi ghi):
  - Giữ NGUYÊN dòng `Nghĩa:` đang có; thẻ nào đã sẵn `Phiên âm:`/`Ví dụ:` thì không đè
    ⇒ **chạy lại là no-op**. Ghi bằng `upsert` theo `id`, chunk 300 thẻ.
  - Dòng ví dụ có format `Ví dụ: "English." (Tiếng Việt.)` — giống các deck cũ (City/IELTS).
  - Nếu file ví dụ có dòng sai định dạng hoặc trùng id, script **dừng ngay** trước khi ghi.
- **Kết quả thật trên DB:** 3334/3334 thẻ Oxford đúng format 3 dòng
  `Phiên âm: … / Nghĩa: … / Ví dụ: …`. Tổng số thẻ vẫn 6690 (không tạo/xoá thẻ), 3356 thẻ deck
  khác **không bị đụng**, `status` giữ nguyên (27 known + 9 unknown). Backup trước khi ghi:
  `scripts/_backup_cards_1785430663685.json` (đã gitignore).
- **Đã tự kiểm tra dữ liệu ví dụ trước khi ghi:** 0 dòng sai định dạng, 0 id trùng, 0 câu
  tiếng Anh trùng nhau, 0 bản dịch thiếu dấu tiếng Việt, không câu nào > 110 ký tự; 19 câu
  "không chứa đúng chữ gốc" là do chia động từ bất quy tắc (cry→cried, steal→stole…) — cố ý giữ.
- Dữ liệu nằm ở Supabase nên **không cần deploy** mới thấy; mặt sau thẻ học sẽ tự hiện đủ 3
  khối Phiên âm / Nghĩa / Ví dụ (logic `parseCardFields` có sẵn từ v1.11.0).

## Phiên trước (2026-07-30) — v1.16.1: nạp 3940 từ Oxford A1–B2 vào DB (chỉ dữ liệu, không đụng code app)

User đưa file `D:\ENGLISH\Oxford_Vocabulary_A1_B2.xlsx` và yêu cầu nạp hết vào 4 chủ đề
`Từ Vựng Oxford 3000 A1/A2/B1/B2`. **Không sửa dòng code nào trong `src/`** — chỉ thêm script
nhập liệu và ghi thẳng vào Supabase.

- **File nguồn:** sheet `Vocabulary Data`, 4 cột `Từ vựng | Từ loại (POS) | Cấp độ CEFR |
  Nghĩa tiếng Việt`. **Không có phiên âm, không có câu ví dụ.** Đã trích ra
  `scripts/oxford-a1-b2.json` (3943 dòng, có commit — để lần sau chạy lại không cần mở Excel).
- **Script `scripts/import-oxford.mjs`** (dry-run mặc định, `--apply` mới ghi):
  - `word` = giữ NGUYÊN ô Từ vựng, kể cả chú thích phân biệt nghĩa của Oxford như
    `kind (type)`, `light (not heavy)` (33 thẻ) — `cleanWordForGame()` vốn đã bóc phần trong
    ngoặc nên Luyện Gõ / Ong Chính Tả không bị dính.
  - `meaning` = **một dòng** `Nghĩa: (n.) sân bay` — POS nhét vào đầu dòng Nghĩa vì không có
    trường riêng cho từ loại; đúng format `formatCardMeaning`, `pickMeaning` đọc ra được ngay.
  - `id` = `oxford-a1-0001` (deterministic) ⇒ **chạy lại script là no-op**, và muốn xoá sạch
    đợt nhập này chỉ cần xoá các id bắt đầu bằng `oxford-`. Script còn skip theo cặp
    (deck, word) nên chạy lại kể cả khi id đổi cũng không tạo thẻ trùng.
  - Gộp 3 trường hợp trùng từ trong cùng cấp độ (`ring`, `firm`, `tear`) thành 1 thẻ:
    `Nghĩa: (n.) chiếc nhẫn, vòng tròn; (v.) rung chuông, gọi điện`.
- **Kết quả thật trên DB:** 3332 → **7272 thẻ**. A1 836 · A2 871 · B1 808 · B2 1425 (tổng 3940).
  Đã verify sau khi ghi: 0 thẻ sai format meaning, 0 thẻ rỗng, 0 thẻ trùng từ trong cùng chủ đề,
  status đều `new`. Backup DB trước khi ghi: `scripts/_backup_cards_before_oxford.json`
  (đã gitignore, KHÔNG commit).
- **Đã kiểm chứng trên production** (https://flashlearn-its7.vercel.app, không bấm nút ghi dữ
  liệu nào): dropdown có đủ 4 chủ đề mới; tab Thêm từ hiện `836 từ` cho A1 với preview nghĩa
  đúng (`across → (prep., adv.) ngang qua, băng qua`); tab Học bài `ĐANG HỌC: 836 TỪ`, lật thẻ
  `week → (n.) tuần`. Dữ liệu nằm ở Supabase nên **không cần deploy lại** mới thấy.
- **Thiếu dữ liệu ở file nguồn (chưa xử lý):** sheet Dashboard ghi A1 = 900 từ nhưng thực tế chỉ
  có 836 dòng — **64 dòng đầu của khối A1 (rows 2–85) bị TRỐNG hoàn toàn trong file Excel**, tức
  các từ A1 đứng trước `across` theo thứ tự chữ cái (a, about, above, action…) đã bị mất từ lúc
  tạo file. A2/B1/B2 khớp đúng dashboard (872 → 871 sau gộp `ring`; 808; 1427 → 1425 sau gộp
  `firm`/`tear`). Muốn đủ 900 từ A1 thì phải bổ sung 64 từ đó từ nguồn khác rồi chạy lại script
  (script tự bỏ qua thẻ đã có).
- Các game (Kiểm tra/Ghép thẻ/Luyện Gõ/Ong Chính Tả) chỉ chạy trên thẻ **đã thuộc**, nên 4 chủ đề
  mới sẽ hiện "cần ít nhất 3 từ" cho tới khi user học và đánh dấu Đã thuộc — đúng hành vi sẵn có.

## Phiên trước (2026-07-30) — v1.16.0: Layout game Ghép thẻ + hướng dẫn nhập hàng loạt

User báo "layout của game ghép thẻ chưa hợp lý" và "UI chỗ thêm từ hàng loạt bị xấu text".

### 1. `MatchGame` — đổi từ lưới xáo trộn sang 2 cột Từ | Nghĩa

Trước: 10 ô (5 từ + 5 nghĩa) trộn lẫn vào `grid-cols-2 sm:grid-cols-3`, mọi ô cùng style,
cùng `min-h-[92px]`, `max-w-4xl`, khu vực lưới `overflow-y-auto`. Hệ quả:

- Không phân biệt được ô nào là từ, ô nào là nghĩa → phải đọc cả 10 ô mới bắt đầu chơi được.
- Từ tiếng Anh 1–2 chữ và nghĩa tiếng Việt vài chục ký tự dùng chung 1 khổ ô → ô từ thừa chỗ,
  ô nghĩa bị `line-clamp-3` cắt chữ.
- 10 ô / 3 cột trên desktop → hàng cuối lẻ 1 ô.
- Ghép xong ô để lại lỗ trống nguyên cỡ 92px gần như vô hình.
- Lưới cuộn dọc được, mà game đang đếm ngược 20s thì không ai kịp cuộn.

Sau (đều nằm trong `MatchGame`, `src/App.jsx`):

- `COLS_CLASS` (const module-level) = `grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]` — cột nghĩa
  rộng gấp 1.4 cột từ. Có 2 nhãn nhỏ "TỪ" (teal) / "NGHĨA" (amber) phía trên.
- `tiles` vẫn shuffle như cũ, sau đó tách thành `wordCells`/`meaningCells` bằng filter theo
  `type` **và giữ lại index gốc** để `handleTile(idx)` không phải sửa. Vì tách từ mảng đã xáo
  nên thứ tự trong mỗi cột vẫn ngẫu nhiên và 2 cột không thẳng hàng theo cặp.
- Lưới là `min-h-0 flex-1 auto-rows-fr` với đúng 5 hàng ⇒ chia hết chiều cao còn lại, **không
  còn cuộn**. Đã đo: 1280×720 hàng cao 112px, 375×812 cao 131px, 1024×560 cao 80px — cả 3 đều
  vừa viewport, `scrollHeight == innerHeight`, không ô nào bị cắt chữ.
- Ô từ: `justify-center`, `font-bold`, `line-clamp-2`. Ô nghĩa: `justify-start text-left`,
  `line-clamp-4` (nghĩa dài đọc trái sang phải dễ hơn là canh giữa).
- Ô đã ghép **không bị xoá khỏi lưới** — giữ nguyên chỗ (tránh các ô còn lại nhảy vị trí giữa
  lúc đua thời gian), chỉ đổi thành khung nét đứt xanh có dấu ✓. Bỏ keyframe `flTileMatch`.
- `handleTile`: bấm 2 ô **cùng cột** giờ chỉ là đổi lựa chọn, không tính ghép sai (trước đây
  mất streak oan). Chỉ ô khác cột mới chấm đúng/sai.

### 2. Hướng dẫn ở form "Hàng loạt"

Đoạn hint cũ là 1 câu dài nhồi thẻ `<code>` giữa câu (`Từ vựng: / Phiên âm: / Nghĩa của từ: /
Ví dụ:`) — trong cột hẹp ~245px nó ngắt dòng ngay giữa khối code, chữ `text-slate-400` lại quá
nhạt. Đổi thành một khối `bg-slate-50` viền nhạt: 4 nhãn mỗi nhãn 1 dòng dạng chip
(`flex items-baseline` + `shrink-0` nên chip không bao giờ bị cắt), kèm chú thích
bắt buộc / để trống được, và dòng cuối nói rõ dấu `&` phân cách. Đã đo: 5 chip đều
`getClientRects().length === 1`, không tràn ngang.

**Lưu ý test:** Browser pane không chụp được screenshot khi pane bị ẩn, và `element.click()`
bằng javascript_tool tạo event `isTrusted=false` **thường không tới được onClick của React**
(state `selected` vẫn null dù listener DOM đã bắn). Cách kiểm chứng dùng được: đọc thẳng fiber
`el[__reactFiber$...]` → leo `.return` tới `MatchGame` → đi chuỗi `memoizedState` để xem
phase/tiles/selected/matchedIds. Nhớ đừng `JSON.stringify` hook `sessionQueueRef` — nó chứa
cả nghìn thẻ, log nổ ngay.

## Phiên trước (2026-07-30) — v1.15.0: Chép chính tả chấm đúng/sai NGAY khi gõ

User gửi ảnh mẫu (app khác) và yêu cầu: **gõ đúng từ nào thì phải biết ngay, không cần bấm
"Kiểm tra"**. Trước đây bảng đáp án chỉ hiện SAU lần bấm "Kiểm tra" đầu tiên (state
`hasChecked`), nên người học gõ xong cả câu vẫn phải bấm mới biết đúng hay sai.

Tất cả nằm trong `DictationCoach` (`src/App.jsx`):

1. **Helper `countMatchedWords(input, targetWords, includePartial)`** (cạnh
   `cleanDictationWord`) — đếm số từ ở ĐẦU câu đã gõ khớp, dừng ở từ sai đầu tiên.
   `includePartial` là điểm cốt lõi:
   - `true` → tính cả từ đang gõ dở ở cuối ô (chưa có dấu cách sau). Dùng cho **hiển thị**,
     để từ xanh lên ngay khi vừa gõ ký tự cuối (giống ảnh mẫu: con trỏ ngay sau "at" mà "at"
     đã xanh).
   - `false` → chỉ tính các từ đã "chốt" (có dấu cách theo sau). Dùng khi **ghi nhận tiến độ**
     (`confirmedCount`), tránh chốt sớm từ trùng một phần: đáp án là "a" mà người dùng đang gõ
     "and" thì lúc mới có chữ "a" KHÔNG được tính là xong — nếu chốt sớm thì `confirmedCount`
     (chỉ tăng, không giảm) sẽ khoá sai vĩnh viễn.
   - Từ CUỐI câu không có dấu cách theo sau ⇒ xử lý riêng: nếu bản `includePartial=true` khớp
     hết cả câu thì chốt luôn cả câu.
2. **`handleTyping(value)`** thay `setUserInput` trực tiếp trong `onChange` của textarea: vừa
   set input, vừa chốt `confirmedCount` và tự `finalizeSegment` khi gõ đúng hết câu (tự chấm
   điểm, ẩn nút "Kiểm tra", mở "Câu sau"). **Cố ý KHÔNG dùng `useEffect`** — eslint rule
   `react-hooks/set-state-in-effect` cấm setState đồng bộ trong effect, và tính từ event
   handler cũng đỡ một vòng render.
3. **Bảng từ luôn hiện** (bỏ hẳn state `hasChecked`), mỗi từ là một ô có viền:
   - chưa gõ → `bg-white` + `*` đúng số ký tự + icon mắt phía trên để xem trước từ đó;
   - gõ đúng → `bg-green-50 border-green-400`;
   - sai / đã bấm xem trước → `bg-amber-50 border-amber-300`.
   Bấm vào ô đã hiện vẫn tra nghĩa được như trước (`WordMeaningCard`).
4. **Xem trước bị tính là lỗi** (state mới `revealedIndices`, đồng thời set `wrongIndices`) —
   có dòng nhắc nhỏ dưới bảng. Checkbox "Hiện toàn bộ đáp án" cũ đổi thành nút
   **"Hiện tất cả các từ"**, bấm là mark tất cả từ chưa gõ thành lỗi (giống ảnh mẫu).
   Checkbox còn lại đổi nhãn cho rõ: "Hiện đáp án ngay khi bấm Kiểm tra mà sai".
5. **"Chưa đúng" cũng hiện live**: `liveMismatch` = số từ đã chốt (có dấu cách) > `confirmedCount`.
   Nhưng live sai thì **không** tự lộ đáp án — muốn lộ phải bấm "Kiểm tra" (có tính lỗi), nếu
   không thì được xem đáp án miễn phí.

**Đã test thật** (vite dev :5180, bơm video giả vào localStorage): gõ "look at" → 2 ô xanh
ngay, chưa bấm gì; gõ "zzz" → "Chưa đúng" hiện ngay; gõ hết câu đúng → "Xong câu này · 100%"
tự nhảy; bấm mắt 1 từ rồi gõ đúng cả câu → 83% (5/6), TB 92%. Lưu ý khi test bằng browser
pane: `computer type` OK nhưng `key BackSpace`/`ctrl+a` KHÔNG tới được React — phải set giá
trị bằng native setter của `HTMLTextAreaElement.prototype.value` rồi `dispatchEvent(new
Event('input',{bubbles:true}))`, và đọc DOM lại Ở LƯỢT SAU vì React render bất đồng bộ.

## Phiên trước (2026-07-28) — v1.14.1: fix 3 lỗi CHIỀU CAO sau khi responsive

User báo 3 lỗi ngay sau v1.14.0, **cả 3 đều là chiều cao chứ không phải chiều ngang** —
v1.14.0 mới chỉ lo chiều ngang. **Bài học chung: thanh nav là `fixed` cao ~72px + `pb-2`,
nên mọi khối cao phải trừ đi khoảng đó, nếu không sẽ bị nav che mà không cuộn tới được.**

1. **Cột form "Thêm từ" bị che, không cuộn xuống được.** Nguyên nhân: `lg:sticky lg:top-24`
   nhưng form CAO HƠN viewport → phần dưới (nút "Thêm từ") nằm ngoài màn hình, mà sticky
   thì ghim cứng nên cuộn trang cũng không tới. Fix: thêm
   `lg:max-h-[calc(100vh-12.5rem)] lg:overflow-y-auto` → form tự cuộn BÊN TRONG.
   (12.5rem = offset sticky 6rem + chiều cao nav ~6.5rem, tính theo rem nên tự co theo
   root font-size của từng breakpoint.)
2. **Màn "Học bài" quá to, không thấy hết nút ở zoom 100%.** Thẻ học vốn `aspect-[4/3]`
   nên chiều cao suy ra từ CHIỀU RỘNG → màn thấp là tràn. Fix: giới hạn chiều rộng theo
   chiều cao còn trống:
   `md:max-w-[min(28rem,calc((100vh-29rem)*4/3))]` (lg dùng `32rem`).
   29rem ≈ tổng chiều cao cố định phía trên/dưới thẻ (header + DeckFilter + nút đổi chiều +
   dòng "Đang học" + 2 nút Chưa/Đã thuộc + nav). **Mobile giữ nguyên `min(24rem,58vh)`** để
   không đổi gì trên điện thoại. Ngoài ra siết bớt khoảng cách dọc (`mb-6`→`mb-3`,
   `mb-8`→`mb-5`) và root `pb-28`→`pb-24`.
   - Đo thực tế: viewport 780px → thẻ 448×336, mọi thứ vừa đúng 1 màn (docHeight = 780);
     viewport 620px → thẻ 285×214, đáy nút ở 538 < nav ở 549 (vẫn không bị che).
3. **Khung video đen ở "Chép chính tả" quá to.** Fix: `w-full aspect-video` →
   `mx-auto w-full max-w-[min(100%,44vh)] aspect-video`. Khung này **luôn bị lớp phủ
   "Chỉ nghe, không xem hình" che kín** nên thu nhỏ không mất gì. Đo: viewport 780 → video
   343×193, toàn bộ nút điều khiển + ô gõ nằm gọn trong 1 màn; viewport 620 → 273×153,
   nút thấp nhất ở 538 < nav 549.

**Mẹo test lại nếu đụng 3 chỗ này:** không chụp được màn hình trong môi trường này, nên đo
bằng `getBoundingClientRect()` — so `nav.getBoundingClientRect().top` với `bottom` của phần
tử thấp nhất, và so `document.documentElement.scrollHeight` với `innerHeight`. Đã test ở
375×812 / 1366×620 / 1440×780. Để vào được màn luyện Chép chính tả khi máy test chưa có
video: bơm 1 video giả vào `localStorage['flashlearn_dictation_videos']` rồi reload (nhớ xoá sau).

## Phiên trước (2026-07-28) — v1.14.0: responsive cho iPad/laptop

Ngay sau v1.13.0, user gửi ảnh chụp trên laptop: app chỉ là **một cột 448px giữa màn hình
trống trơn** — vì `<main>` bị khoá cứng `max-w-md`. Đã mở rộng bố cục theo khổ màn hình
(chỉ đổi class layout, **không đụng logic/tính năng**):

- **`<main>`** (`App.jsx`): `max-w-md` → `max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl
  2xl:max-w-7xl`, thêm `md:px-6`.
  **Lưu ý về đơn vị:** root font-size đổi theo breakpoint (16/15/14px — xem `index.css`),
  nên `max-w-5xl` (64rem) ở lg thực tế = 896px chứ không phải 1024px. Muốn chỉnh độ rộng
  nhớ tính theo rem × font gốc của breakpoint đó.
- **Tab "Thêm từ"**: từ `lg` trở lên chia **2 cột** —
  `lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]`, form bên trái `lg:sticky lg:top-24`
  (cuộn danh sách vẫn thấy form), danh sách bên phải. Dưới `lg` thì xếp dọc như cũ.
- **Các danh sách thẻ** (trong tab Thêm từ, tab Chưa thuộc, tab Đã thuộc): đổi từ
  `space-y-3` sang lưới `md:grid-cols-2` (+ `xl:grid-cols-3` cho 2 tab Chưa/Đã thuộc).
  **Cách làm:** bọc thêm 1 `div` lưới quanh cụm `{empty ? … : cards.map(…)}`, khối rỗng
  thì `md:col-span-2`/`xl:col-span-3` để vẫn nằm giữa. Giữ `space-y-3 md:space-y-0` để
  mobile không đổi.
- **Thẻ học (Study)**: `max-w-sm` → `max-w-sm md:max-w-md lg:max-w-lg` (áp cho cả thẻ lẫn
  cụm 2 nút Chưa/Đã thuộc bên dưới để 2 khối luôn bằng nhau).
- **Menu GAME**: 4 thẻ từ `flex flex-col` → `grid md:grid-cols-2`; root thêm `max-w-4xl mx-auto`.
- **Phát âm / Chép chính tả**: bọc `max-w-3xl` / `max-w-4xl` + `mx-auto` để chữ và khung
  video không bị kéo dài quá khổ; danh sách video thành `grid md:grid-cols-2`.
- Bottom nav vẫn là thanh nổi ở giữa (`max-w-xl`), chạy tốt ở mọi khổ — chưa đổi sang
  sidebar dọc trên desktop; nếu sau này user muốn thì đó là việc kế tiếp.
- **Đã đo bằng `getBoundingClientRect`/`getComputedStyle`** ở 375 / 768 / 1024 / 1440px:
  không có tràn ngang (`body.scrollWidth` ≤ viewport) ở khổ nào; 375px giữ nguyên 1 cột
  y như trước; 768px danh sách 2 cột, form full width; 1024px+ tab Thêm từ ra 2 cột
  (322px + 623px), thẻ học rộng 448px, menu game 2 cột. Build OK, eslint vẫn 3 lỗi CÓ SẴN.

## Phiên trước (2026-07-28) — v1.13.0: đổi toàn bộ UI sang theme "sticker" teal/vàng/coral

User gửi ảnh mẫu (app học tiếng Anh kiểu sticker: teal đậm + vàng chanh + hồng coral,
thẻ bo góc lớn viền đen mảnh + bóng cứng lệch, nút pill, chữ bôi highlight vàng) và yêu
cầu **CHỈ đổi UI style, giữ nguyên 100% tính năng**. Đã chốt với user 2 điểm trước khi làm:
(1) **5 màn game vẫn giữ nền tối**, chỉ đổi tông màu nút/thẻ/chữ; (2) **giữ nguyên** thiết
lập thu nhỏ UI desktop của v1.12.0 (root font 15px/14px).

**Không đụng bất kỳ logic/state/handler/schema nào** — chỉ đổi className, màu và thêm CSS.

### Cách làm (quan trọng khi cần chỉnh tiếp)

Kiến trúc theme gồm 3 tầng, cố tình tránh phải sửa hàng nghìn className trong `App.jsx` (5300 dòng):

1. **`tailwind.config.js` — ánh xạ lại BẢNG MÀU.** Toàn bộ họ màu gốc của Tailwind được
   trỏ sang bảng sticker: `blue/indigo/sky/teal → teal`, `violet/purple/red/rose/pink → coral`,
   `amber/yellow → sun`, `orange → flame`, `cyan → aqua`, `green/emerald/lime → green`,
   `slate/gray/zinc/neutral/stone → ink`. Nhờ vậy mọi class `bg-blue-600`, `text-slate-500`…
   đang có sẵn tự đổi tông. **Muốn đổi tông toàn app về sau, sửa DUY NHẤT file này.**
   (Có thêm bí danh `brand`/`sun`/`coral`/`ink` để viết class mới, và `shadow-sticker*`.)
2. **`src/index.css` — tầng HÌNH DẠNG.** Các selector bám theo TOKEN class của Tailwind
   (`[class~="bg-white"]` chỉ khớp đúng token `bg-white`, KHÔNG khớp `bg-white/10`) nên
   **5 màn game nền tối không bị dính** (chúng dùng `bg-white/10`, `bg-slate-900`…). Gồm:
   thẻ trắng bo góc → viền mực 2px + bóng cứng `3px 4px 0`; nút màu đặc (`bg-blue-600`,
   `bg-red-500`…) → viền + bóng cứng; chip nền nhạt (`bg-blue-50`…) → viền mực 2px;
   `input/textarea/select` → nền trắng, viền mực 2px, focus đổi viền teal + bóng teal;
   nút sticker khi `:active` thì "lún xuống" (`translate(2px,3px)` + bỏ bóng).
   - **Lối thoát:** thêm class `fl-flat` vào element để KHÔNG bị áp sticker (đang dùng cho
     chấm badge trong nav, tab đang chọn của segmented control); thêm `fl-dark-input` cho ô
     nhập nền tối (ô gõ của Luyện Gõ) để không bị ép nền trắng.
   - **Tiện ích mới:** `.fl-mark` (chữ bôi bút dạ vàng), `.fl-sticker`/`.fl-sticker-sm`
     (viền + bóng dựng tay, dùng cho khối gradient), `.fl-dashed`, `.fl-track`+`.fl-track-fill`,
     `.fl-dot` (chấm trang trí), `.fl-app` (nền giấy chấm bi của toàn app).
3. **`src/App.jsx` — sửa CÓ CHỌN LỌC** những chỗ CSS không với tới được:
   - Header: nền trắng + viền đáy mực, logo trong ô vuông teal bo góc, chữ "FlashLearn" bôi vàng.
   - **Bottom nav: đổi hẳn sang thanh teal bo tròn NỔI** (`fixed bottom-0` + `px-2 pb-2`, bên
     trong là `div` `bg-blue-600 rounded-3xl` tự ăn viền+bóng sticker). Tab đang chọn = viên
     vàng `bg-amber-300` chữ mực; tab thường = trắng 75%. Vì nav nổi lên nên root đổi
     `pb-24 → pb-28` và badge version đổi `bottom-16 → bottom-24`.
   - Thẻ học: thêm 3 chấm trang trí `.fl-dot` (vàng/coral/teal) quanh thẻ; 2 nút Chưa/Đã thuộc
     đổi từ trắng-viền-màu sang **nền coral-100 / green-100** cho giống cặp nút trong ảnh mẫu.
   - Nút CTA chính (`Thêm từ`, `Thêm danh sách`, `Bắt đầu luyện đọc`) đổi `rounded-xl → rounded-full`.
   - Tiêu đề mục (`Thêm Flashcard`, `Trò chơi`, `Chép chính tả`) bọc `<span className="fl-mark">`.
   - Menu GAME: 4 thẻ gradient thêm `fl-sticker` → teal / coral / aqua / vàng-cam (đúng 4 màu
     trong ảnh mẫu). Thẻ "Ong Chính Tả" đổi sang nền vàng nhạt + **chữ mực** (chữ trắng trên
     vàng không đọc được).
   - **Đổi hết mã màu hardcode trong game** (`#f43f5e`, `rgba(249,115,22,…)`, ring rgb của
     QuizGame…) sang bảng mới — nếu thêm màu hardcode mới, nhớ lấy từ bảng trong `tailwind.config.js`.
   - Sửa 3 chỗ chữ trắng trên nền vàng (nút Bắt đầu/Kiểm tra của Ong Chính Tả, anchor bookmarklet)
     thành chữ mực.

### Đã kiểm chứng

- `npm run build` OK. `npx eslint .` vẫn đúng **3 lỗi CÓ SẴN** (emoji regex ×2 + set-state-in-effect
  ~dòng 2932), không phát sinh lỗi mới.
- Chạy vite riêng cổng 5188, đọc `getComputedStyle` từng màn (không bấm nút ghi dữ liệu nào):
  nền app `rgb(241,244,242)` + chấm bi 18px; header viền đáy 2px mực; `.fl-mark` ra dải vàng
  `#FFE55C`; thẻ trắng viền 2px `#16211F` + bóng `3px 4px 0`; nút chính teal `#23847C` bo tròn
  9999px; nav teal bo 21px, tab đang chọn nền `#FFE55C`; input nền trắng viền 2px; thẻ danh sách
  giữ nguyên vạch coral bên trái + viền mực; 4 thẻ game ra đúng teal/coral/aqua/vàng-cam; game
  QuizGame nền chuyển thành gradient mực-xanh đậm, nút flame→coral; SpellingBee nút vàng chữ mực.
  Console không lỗi.
- **KHÔNG chụp được ảnh màn hình** trong môi trường này (Browser pane không compositing —
  `computer screenshot` báo "pane is not displayed"), nên phần "đẹp/xấu" cần user tự nhìn.

## Phiên trước (2026-07-28) — v1.12.0: thu nhỏ UI trên desktop + fix tiếp bug Luyện Gõ xoá cụm nhiều từ

User báo 2 việc: (1) UI to quá so với màn hình laptop, (2) Luyện Gõ vẫn còn bug tự xoá ô
đang gõ với cụm nhiều từ (đợt fix v1.11.0 không dứt điểm — xem lại bên dưới).

- **UI thu nhỏ trên desktop (`src/index.css`):** app vốn thiết kế cỡ chạm di động
  (`<main className="max-w-md mx-auto">` đã giới hạn 448px sẵn), nhưng font/khoảng cách
  Tailwind (rem) vẫn to như trên phone → nhìn "quá khổ" trên laptop. Thêm 2 media query hạ
  `font-size` gốc của `html`: 16px (mobile mặc định, giữ nguyên) → 15px từ 641px → 14px từ
  1024px. Vì Tailwind dùng rem cho cả chữ lẫn spacing/rounded/kích thước icon, hạ root
  font-size là cách rẻ nhất để thu nhỏ ĐỀU toàn bộ UI mà không phải sửa hàng nghìn class.
  Chưa test được bằng mắt trong Browser pane (pane không compositing frame trong môi trường
  này — `computer screenshot` báo lỗi "pane is not displayed"), chỉ verify qua build OK.
  **Nếu user thấy vẫn to/nhỏ chưa vừa ý, chỉnh lại 2 con số 15px/14px này.**
- **Luyện Gõ — fix tiếp cụm nhiều từ bị xoá dù còn hiện trên màn hình (`TypingGame`,
  App.jsx ~1496-1533):** đợt v1.11.0 đã fix xong lỗi MẤT KÝ TỰ khi gõ nhanh (do input
  controlled đọc value/caret lệch khi component re-render 60 lần/giây) — đó là lỗi tầng
  DOM/React, KHÔNG phải lỗi này. Bug user báo lại lần này là lỗi **thiết kế game**: mọi từ
  rơi cùng tốc độ theo mốc bất kể dài ngắn, nên cụm nhiều chữ như "more and more"/"by means
  of" phải gõ nhiều phím hơn nhưng KHÔNG có thêm thời gian → dễ chạm `TYPING_MISS_LINE` (88%,
  tức còn cách đáy màn hình/tàu vũ trụ khá xa, vẫn thấy rõ) trước khi gõ xong → bị tính "để
  lọt" (mất tim + `loop()` tự `setTyped("")` xoá ô đang gõ, xem đoạn code v1.9.2) dù từ vẫn
  đang hiện. Đã audit deck "IELT LỚP 2" thật (321 từ gõ được, KHÔNG có thẻ "more" đứng riêng
  trùng tiền tố với "More and more") nên loại được giả thuyết trùng tiền tố/trùng thẻ — đúng
  là do tốc độ rơi không tính theo độ dài.
  - Fix: thêm `lengthSlowdown(text) = min(1, 7/text.length)` nhân vào `speed` lúc `spawnWord`
    — từ ≤7 ký tự rơi tốc độ như cũ (không đổi hành vi với từ đơn), cụm càng dài rơi càng
    chậm tỉ lệ nghịch với độ dài (vd "more and more" 13 ký tự → còn ~54% tốc độ, gần gấp đôi
    thời gian rơi).
  - Tiện tay thêm phòng vệ thứ 2 (không phải nguyên nhân chính nhưng vô hại, hữu ích nếu deck
    khác có thẻ trùng chữ): `spawnWord` giờ né không gieo 1 chữ/cụm đang có sẵn trên màn hình
    nếu pool còn lựa chọn khác (vòng `while` giới hạn `tries < pool.length - 1`, không đổi gì
    khi pool chỉ có 1 từ).
  - **Giới hạn khi test:** không verify được bằng mắt trong Browser pane — tab pane bị coi là
    "ẩn" nên `requestAnimationFrame` ĐÓNG BĂNG HOÀN TOÀN, kể cả `spawnWord` đầu tiên cũng
    không chạy (đọc DOM qua `javascript_tool` sau khi bấm Bắt đầu → không có từ nào được
    render, `words` rỗng suốt). Đã verify bằng: `npm run build` OK, `npx eslint` không phát
    sinh lỗi mới (vẫn 3 lỗi CÓ SẴN không liên quan), đọc lại code/công thức bằng tay. **Nếu
    sửa tiếp tính năng này, ưu tiên test bằng cách patch `requestAnimationFrame` để tự "pump"
    vòng lặp (xem mẹo test đã dùng ở v1.9.2) thay vì trông chờ Browser pane render thật.**
  - Việc còn treo: chưa có cách test trực quan tốc độ rơi mới trong môi trường này — nếu vẫn
    còn báo bug tương tự, cân nhắc tăng thêm hệ số chậm (đổi hằng số `7` lên) hoặc nâng hẳn
    `TYPING_MISS_LINE` gần đáy hơn.

## Phiên (2026-07-28) — v1.11.0: chuẩn hoá 4 trường (Từ vựng/Phiên âm/Nghĩa/Ví dụ) + fix bug Luyện Gõ

User yêu cầu 8 việc trong 1 phiên: (1) fix Luyện Gõ bị clear ký tự khi gõ cụm nhiều
từ, (2) form Thêm từ (Từng từ một) tách 4 ô, (3) format nhập hàng loạt đổi theo 4
nhãn + `&`, (4) game chỉ dùng Từ vựng+Nghĩa, (5)(6) mặt trước/sau thẻ học theo 4
trường + UI mặt sau dễ đọc hơn, (7) chuẩn hoá lại dữ liệu cũ, (8) push. **Không đổi
schema Supabase** — bảng `cards` vẫn 2 cột `word`/`meaning`; `meaning` tiếp tục là
chuỗi 3 dòng `Phiên âm: …\nNghĩa: …\nVí dụ: …` (đúng format đã chuẩn hoá trước đó,
xem phiên chuẩn hoá deck cũ), chỉ thêm 1 lớp parse/format 2 chiều.

- **Fix bug Luyện Gõ (`TypingGame`, App.jsx):** nguyên nhân là input controlled kiểu
  cũ (`value={typed}` + `onChange` đọc `e.target.value`) trong khi component
  re-render 60 lần/giây do `requestAnimationFrame` — CÙNG lớp lỗi đã gặp và fix ở
  `SpellingBee` v1.9.3. Áp lại đúng pattern đó: `handleKey` (onKeyDown) tự quản
  chuỗi gõ qua `typedRef` bằng `e.key` + `preventDefault` (không đụng caret/value
  của input nữa), `onChange` cũ giữ làm dự phòng bàn phím ảo/mobile. Logic khớp
  tiền tố/exact-match gộp vào `tryApply()` dùng chung cho cả 2 đường.
  - **Đã verify bằng simulation Node độc lập** (logic so khớp đúng, bug nằm ở tầng
    DOM/React) **và test trực tiếp trong app thật** (vite riêng cổng 5183, dữ liệu
    thật): patch `requestAnimationFrame` (tab preview bị coi là "ẩn" nên rAF thật
    bị đóng băng, đã gặp nhiều lần trước đây) để tự "pump" vòng lặp game, dispatch
    `KeyboardEvent('keydown', {key})` thật lên input để gõ cụm "Become more common"
    — bắn hạ thành công, không rơi rớt ký tự giữa chừng, không mất tim.
- **Helper mới `parseCardFields`/`formatCardMeaning`** (App.jsx, cạnh `pickMeaning`):
  tách/gộp `meaning` thành `{phonetic, meaning, example}`. `pickMeaning` cũ GIỮ
  NGUYÊN không đổi (4 game đang dùng, tránh vỡ).
- **Form Thêm từ — Từng từ một:** 4 ô input Từ vựng*/Phiên âm/Nghĩa của từ*/Ví dụ
  (Phiên âm, Ví dụ không bắt buộc).
- **Form Thêm từ — Hàng loạt:** đổi hẳn parser, mỗi thẻ 4 dòng nhãn
  `Từ vựng:`/`Phiên âm:`/`Nghĩa của từ:`/`Ví dụ:`, các thẻ cách nhau 1 dòng chỉ có
  `&` (`parseBulkBlock`, dùng chung regex với `parseCardFields`).
- **Form Sửa thẻ trong danh sách:** cũng đổi sang 4 ô (`editWord/editPhonetic/
  editMeaning/editExample`), prefill qua `parseCardFields(card.meaning)`.
- **Danh sách thẻ (preview trong tab Thêm từ):** đổi từ in nguyên `card.meaning`
  (lộ cả 3 dòng nhãn) sang `pickMeaning(card.meaning)` cho gọn.
- **Game (Kiểm tra/Ghép thẻ/Luyện Gõ/Ong Chính Tả):** đã dùng `pickMeaning` từ
  trước (chỉ lấy dòng Nghĩa) — không cần sửa gì thêm, chỉ hưởng lợi từ dữ liệu
  được chuẩn hoá đồng bộ hơn.
- **Mặt trước/sau thẻ học (Study tab):** mặt sau đổi từ in nguyên blob
  (`whitespace-pre-wrap`) sang 3 khối có kiểu chữ riêng (Phiên âm — mono nhạt,
  Nghĩa — to đậm, Ví dụ — nhỏ nghiêng có gạch ngăn phía trên), khối nào rỗng thì ẩn
  hẳn. Chế độ đảo chiều (`isReverseStudy`): mặt trước giờ chỉ hiện
  `pickMeaning()` (trước đây lộ nguyên 3 dòng — cũng là 1 bug ăn theo được sửa
  luôn), mặt sau hiện `word` + cùng layout Phiên âm/Ví dụ.
- **Migration dữ liệu (`scripts/normalize-card-fields.mjs`, dry-run mặc định,
  `--apply` mới ghi thật, tự backup JSON trước khi ghi):**
  - Audit thật trên DB: 3332 thẻ, 3107 đã đúng format 3 dòng (không đụng), 225 thẻ
    lệch → tự nhận diện 2 dạng lồng nhau: phiên âm dạng `(/…/)` ở đầu `word` HOẶC
    đầu `meaning` (bóc bằng regex ưu tiên cặp `/…/)` CUỐI để không bị cắt cụt khi
    phiên âm có `/` nội bộ, vd "Low salary / income"), và ví dụ dạng `word - câu ví
    dụ` (bóc từ `word`) hoặc `Nghĩa. Câu ví dụ tiếng Anh (dịch).` (bóc từ `meaning`
    tại dấu `". "` đầu tiên nếu vế sau đủ dài để là 1 câu). Không rule nào khớp thì
    giữ nguyên làm Nghĩa (không mất dữ liệu).
  - **Đã chạy `--apply` thật:** 225/225 thẻ ghi lại thành công, backup lưu
    `scripts/_backup_cards_<ts>.json` (đã gitignore, KHÔNG commit). Audit lại sau
    khi apply: 3332/3332 thẻ đúng format.
- **Đã test trên app thật** (vite riêng 5183): danh sách 158 thẻ "PreIE từ vựng"
  hiện đúng preview Nghĩa (không còn lộ "Phiên âm:..."); mặt sau thẻ học hiện đủ 3
  khối (test từ "Evolve" → `/iˈvɒlv/` / "Tiến hóa" / câu ví dụ); đảo chiều học đúng
  (mặt trước chỉ "Tiến hóa", mặt sau "Evolve" + phiên âm + ví dụ); thêm hàng loạt 2
  thẻ test (1 đủ 4 trường, 1 chỉ có Từ vựng+Nghĩa) → parse đúng, form Sửa prefill
  đúng cả 4 ô → đã xoá 2 thẻ test này khỏi DB thật sau khi xác nhận (không để lại
  rác). Tiện tay sửa luôn 1 lỗi mojibake có sẵn (`title="PhÃ¡t Ã¢m"` → "Phát âm" ở
  nút loa mặt sau thẻ đảo chiều — không liên quan yêu cầu chính nhưng thấy tiện sửa).
- Lint: vẫn 3 lỗi CÓ SẴN (emoji regex + set-state-in-effect, xem các phiên trước)
  — không phát sinh lỗi mới. Build production OK.

## Phiên làm việc (2026-07-27) — v1.10.0: fix "có từ đã thuộc mà không chơi được Luyện Gõ / Ong Chính Tả"

User báo: deck "PreIE từ vựng" có nhiều từ đã thuộc nhưng vào Luyện Gõ thì hiện
`0 từ đã thuộc · Cần ít nhất 3 từ đã thuộc để chơi`, không bấm Bắt đầu được.

- **Nguyên nhân:** hai cổng vào đếm theo hai kiểu khác nhau. `GameTab` bật/tắt nút theo
  `knownCards.length` (số thẻ đã thuộc), còn bên trong `TypingGame`/`SpellingBee` lại đếm theo
  `isPlayableWord(c.word)`. Hàm cũ chỉ chấp nhận **một từ đơn ASCII, 2-18 ký tự** → cả deck
  "PreIE từ vựng" lưu phiên âm ngay trong ô từ (`"Reserve (/rɪˈzɜːv/)"`) nên bị loại sạch, và mọi
  cụm nhiều từ (`"Take care of"`, deck P Verb, Tên quốc gia) cũng bị loại. Nút bật nhưng vào trong
  game thì báo thiếu từ.
- **Fix (`src/App.jsx`):**
  - Thêm `cleanWordForGame(raw)`: bóc `(…)`/`[…]`/phiên âm `/…/`, cắt phần sau `" - "` (nhiều thẻ
    lưu cả câu ví dụ: `"tenants - The tenants pay the rent…"`), lấy vế đầu của `"A / B"`, bỏ số thứ
    tự đầu dòng, chuẩn hóa nháy cong `’` → `'`. **Chỉ dùng cho game, KHÔNG sửa dữ liệu trong DB.**
  - `isPlayableWord` chạy trên chuỗi đã làm sạch, cho phép khoảng trắng (cụm ngắn vẫn gõ được), giới
    hạn 2-22 ký tự.
  - Thêm helper `playableCards(cards)` trả về thẻ đã lọc + `word` đã làm sạch; `TypingGame`,
    `SpellingBee` dùng chung → từ rơi/từ đọc chính tả không còn dính phiên âm.
  - `GameTab` đếm bằng chính bộ lọc đó (`typableCount`) cho 2 game gõ, và bằng `word && meaning`
    cho Kiểm tra (đúng như QuizGame lọc bên trong) → nút và màn intro không còn nói khác nhau.
    Thông báo đổi thành "Cần ít nhất 3 từ gõ được (chủ đề này có N)".
- **Số liệu thật sau fix** (đếm trên toàn bộ thẻ đã thuộc): PreIE 0→6/6, P Verb 0→7/7,
  Tên quốc gia 0→12/12, testing 3→9/9, IELT LỚP 2 173→318/326, IELTS 35→73/74. Chỉ còn 11 thẻ bị
  loại, đều là câu dài >22 ký tự hoặc chữ có dấu ("São Paulo") — không gõ nổi bằng bàn phím tiếng Anh.
- **Đã test** (`vite preview` cổng 5175, dữ liệu thật): deck PreIE hiện `12 từ gõ được` (13 từ đã
  thuộc, 1 từ quá dài), nút Luyện Gõ/Ong Chính Tả bật, vào Ong Chính Tả đọc queue từ React fiber ra
  `["Alcoholic drink","Free snacks","Bounce","Strong","Benefit","Reserve","Harmless","Comedy",
  "Become more common","Tenants","Bird","Get married"]` — sạch phiên âm. Lint: 3 lỗi CÓ SẴN
  (emoji trong character class + set-state-in-effect), không phát sinh lỗi mới.
- **Chưa làm:** ô `word` của 158 thẻ deck "PreIE từ vựng" trong DB vẫn còn chứa phiên âm
  `"Từ (/ipa/)"` — các màn khác (danh sách thẻ, Kiểm tra, Ghép thẻ) vẫn hiển thị nguyên như vậy.
  Muốn dọn hẳn thì viết script kiểu `scripts/fix-*.mjs` để tách phiên âm xuống ô `meaning`.

## Phiên làm việc (2026-07-24) — v1.9.4: "Ong Chính Tả" hiện nghĩa sau mỗi từ (đúng/sai)

User muốn: gõ xong 1 từ, dù ĐÚNG hay SAI, đều hiện nghĩa tiếng Việt. Trước đó chỉ báo
"Chính xác! 🎉" hoặc "Đáp án: WORD". Thêm biến `wordMeaning = pickMeaning(current?.meaning)`
(bỏ dòng phiên âm, KHÁC `meaningHint` vốn lấy dòng đầu có thể trúng phiên âm), render dưới cả 2
nhánh correct/wrong trong khối `.min-h-16` (đổi từ `h-12` để đủ chỗ 2 dòng, thêm `gap-1`).
- **Đã test** (vite 5199, đọc word từ React fiber của input.sr-only → hook[1]=idx, hook[7]=queue):
  từ "struggle" gõ đúng → "Chính xác! 🎉 | cuộc chiến đấu"; từ "borrow" gõ sai "borrox" →
  "Đáp án: BORROW | mượn". Nghĩa hiện đúng cả 2, dùng dòng "Nghĩa:" không lộ phiên âm. Lint: 3 CÓ SẴN.

## Phiên làm việc (2026-07-24) — v1.9.3: fix "Ong Chính Tả" nuốt ký tự khi gõ (caret/IME)

User báo bug: trong Ong Chính Tả, "gõ ký tự mà sai là nó tự động xóa rồi không cho gõ tiếp". Code
`onInputChange` cũ KHÔNG hề có logic xóa → thủ phạm là vùng đệm/caret của input ẩn (`sr-only`,
controlled `value={typed}`) bị lệch khi gõ nhanh, và/hoặc tổ hợp IME tiếng Việt (Telex/Unikey) chèn
Backspace + ký tự có dấu rồi bị regex `[^a-zA-Z...]` lọc mất → mất ký tự, kẹt không gõ tiếp.
- Fix: thêm `handleKey` (onKeyDown) tự quản chuỗi `typed` bằng `e.key` + `preventDefault` cho phím
  chữ/Backspace/Enter → KHÔNG dùng tới caret của input, KHÔNG cho IME tổ hợp chèn (guard
  `e.nativeEvent.isComposing`). `onInputChange` giữ lại làm dự phòng cho bàn phím ảo (mobile), có
  thêm guard isComposing. Input `onKeyDown={(e)=>Enter&&submit}` cũ đổi thành `onKeyDown={handleKey}`.
- **Đã test** (vite 5199, real DOM keydown qua dispatchEvent vì `computer key` của pane không đáng
  tin): gõ chữ nối `abc`→`abcde`; Backspace xóa từng ký tự `abcde`→`abcd`→`abc`; gõ `x`→`abcx`
  (không double-input vì letter bị preventDefault nên onChange không bắn). Lint: 3 lỗi CÓ SẴN.
- **LƯU Ý còn lại:** nếu user dùng Unikey/EVKey kiểu "gửi Backspace" ở tầng OS thì trình duyệt nhận
  Backspace thật → vẫn có thể xóa; cách này fix trọn IME tầng trình duyệt + lỗi caret, còn Unikey
  OS-level cực đoan thì khuyên gõ ở chế độ English. `computer key BackSpace` của pane KHÔNG tới React.

## Phiên làm việc (2026-07-24) — v1.9.2: "Luyện Gõ" tự xóa khi từ đang gõ bị mất lượt

Nối tiếp v1.9.1 (chặn ký tự sai): nếu từ user đang gõ dở bị rơi qua vạch (mất lượt) trước khi kịp
bắn, chuỗi đang gõ trở nên "kẹt" (không khớp từ nào còn lại → gõ tiếp không ăn vì bị chặn). Fix:
- Thêm `typedRef` (mirror của `typed`) + helper `applyTyped(v)` cập nhật cả ref lẫn state; dùng
  `applyTyped` trong `processTyped` để loop (rAF) đọc được chuỗi mới nhất (loop là closure, không
  thấy state mới).
- Trong `loop`, ngay sau khi lọc bỏ các từ mất lượt: nếu `typedRef.current` khác rỗng và KHÔNG còn
  là tiền tố của bất kỳ từ nào còn lại (`!arr.some(startsWith)`) → `setTyped("")` + reset ref. Nếu
  vẫn còn từ khác khớp tiền tố thì GIỮ (không xóa nhầm).
- `start()` reset `typedRef.current=""`.
- **Đã test end-to-end** (vite 5199): không dùng được setTimeout/rAF thường vì pane ẩn bị clamp ~1s;
  dựng "manual-pump" (patch `requestAnimationFrame` chỉ lưu callback, tự gọi loop N lần, yield giữa
  batch bằng MessageChannel để React commit). Kết quả: đang gõ `Gra` cho từ "Grade", khi "Grade" mất
  lượt, các từ còn lại [disadvantage, collect, Milestone, locate] không bắt đầu bằng "gra" → ô nhập
  tự về `""`. **Mẹo test game rơi khi pane ẩn:** setTimeout bị clamp ~1s, dùng manual-pump + MessageChannel.

## Phiên làm việc (2026-07-24) — v1.9.1: "Luyện Gõ" chỉ nhận ký tự ĐÚNG

User đổi ý so với v1.9.0 (khi đó giữ lại ký tự sai): giờ muốn ký tự sai **không được nhập vào**
luôn — ô nhập chỉ chấp nhận ký tự nào nối tiếp đúng tiền tố của MỘT từ đang rơi. Sửa `processTyped`:
- Nếu `clean.length < typed.length` → là Backspace/xóa → LUÔN cho phép (để user sửa hoặc đổi từ).
- Nếu chuỗi mới khớp đúng cả 1 từ → bắn hạ (như cũ).
- Nếu vẫn là tiền tố hợp lệ (`arr.some(startsWith)`) → nhận.
- Ngược lại (ký tự sai) → **KHÔNG gọi `setTyped`** → React tự khôi phục ô nhập (controlled input)
  về giá trị hợp lệ trước đó. Không clear, không shake — chỉ đơn giản là gõ không ăn.
- **Đã test end-to-end** (vite 5199 + ép `requestAnimationFrame`→`setTimeout` để loop chạy dù pane ẩn):
  từ "phrase" → gõ `p,h,r` nhận `phr`; gõ `z`,`q` (sai) bị bỏ qua giữ `phr`; gõ `a` → `phra`;
  Backspace → `phr`; gõ đủ `phrase` → bắn hạ, ô nhập về rỗng, toast hiện `phrase 🔊 · cụm từ`. OK.

## Phiên làm việc (2026-07-24) — v1.9.0: 2 tinh chỉnh "Luyện Gõ" (TypingGame)

- **Không tự xóa khi gõ sai:** trước đây `processTyped` khi chuỗi gõ KHÔNG khớp tiền tố từ nào thì
  `setTyped("")` + shake → mất hết ký tự vừa gõ. Giờ luôn `setTyped(clean)` (giữ nguyên chuỗi, bỏ
  auto-clear + bỏ shake ở nhánh này); user tự Backspace để sửa. Shake khi để lọt từ vẫn còn.
- **Bắn hạ từ → phát âm + hiện nghĩa:** trong `destroyWord` thêm `speakEnglish(target.text)` và set
  state `hit={id,word,meaning}`; render toast pill (cyan, `flPopIn`) ở đáy vùng chơi (bottom-16) hiện
  `word 🔊` + nghĩa tiếng Việt, tự ẩn sau 1.7s (`hitTimerRef`). Nghĩa lấy từ `meaningMapRef` — map
  `từ(thường) -> pickMeaning(c.meaning)` dựng 1 lần trong `start()`. Cleanup timer ở unmount + `start`.
- **Đã test** (vite 5199, chỉ đọc thẻ): #1 gõ `z,x,q,w` → input giữ `zxqw` không bị clear, Backspace ra
  `zxq` OK. #2 KHÔNG test live được vì rAF của pane bị pause khi ẩn (từ không spawn) — xác nhận bằng
  đọc code: helper `speakEnglish`/`pickMeaning` ở module-level trước TypingGame, key map khớp
  `target.text.toLowerCase()`. Lint: vẫn 3 lỗi CÓ SẴN (2183/2757) không liên quan.

## Phiên làm việc (2026-07-24) — v1.8.0: chậm "Luyện Gõ" + fix bug gõ "Ong Chính Tả"

Hai chỉnh sửa nhỏ theo yêu cầu user (đều nằm trong `src/App.jsx`):

- **Luyện Gõ rơi chậm lại:** `speedFor(m)` từ `5 + m*0.55` → `3.2 + m*0.3` (%/giây); nới `spawnIntervalFor`
  từ `max(900, 2200 - m*65)` → `max(1100, 2600 - m*60)` ms. Mốc 1 rơi ~25s thay vì ~16s (chậm ~37%).
- **Fix bug "Ong Chính Tả" nuốt ký tự vừa gõ:** `goToWord` trước đây điền sẵn ký tự đầu vào state
  `typed` (`setTyped(w ? w[0] : "")`). Input ẩn `sr-only` mang sẵn giá trị đó → khi focus tự động,
  vị trí con trỏ/vùng chọn không ổn định, ký tự user gõ bị chèn sai chỗ / thay thế → trông như bị xóa.
  Đổi thành `setTyped("")` (bắt đầu rỗng, gõ cả từ từ đầu). Ký tự đầu vẫn hiện MỜ làm gợi ý ở ô đầu
  (nhánh `i === 0` sẵn có). Submit so `typed` với cả từ — không cần chỉnh vì typed giờ là cả từ.
- **Đã test** (vite 5199, chỉ đọc thẻ): mở Ong Chính Tả, input value khởi tạo `""` (không còn prefill);
  gõ từng ký tự qua native setter + `input` event → boxes tích lũy đúng `T`→`TE`→`TES`, không mất ký tự.
  Speed chỉ đổi hằng số, không test rAF trong pane (bị throttle). Lint: vẫn 3 lỗi CÓ SẴN không liên quan.

## Phiên làm việc (2026-07-24) — v1.7.0: thiết kế lại UI 2 game "Kiểm tra" + "Ghép thẻ"

User muốn 2 game CŨ (QuizGame/MatchGame) đẹp và đồng bộ style Parroto như 2 game mới. Viết lại
hoàn toàn cả 2 (splice bằng Node vì file CRLF — xem lịch sử nếu cần lặp lại):

- **QuizGame → "Thiên Thạch Trắc Nghiệm":** nghĩa tiếng Việt rơi như thiên thạch (cam) trên nền
  vũ trụ tối; 4 đáp án (từ tiếng Anh) đánh số 1-4 màu khác nhau ở đáy; bấm hoặc nhấn phím 1-4 để
  chọn. Đúng → nổ + điểm ×streak + phát âm từ; sai/để rơi chạm đáy (`QUIZ_MISS_LINE`=80%) → mất
  1 tim. 3 tim, 15 câu/lượt. Vòng lặp rơi bằng `requestAnimationFrame` (giống TypingGame).
- **MatchGame → "Nối Từ":** nền teal tối, thanh thời gian (20s/vòng) + badge 🔥 streak + 🏆 điểm
  + nút tắt tiếng. Lưới thẻ (từ ↔ nghĩa) bo góc, chọn = glow teal, sai = đỏ, matched = fade. Ghép
  đúng cộng điểm ×streak và phát âm từ. Giữ nguyên cơ chế gốc (đã chạy production) + thêm
  score/streak/speak. Đồng hồ xử lý ngay trong `setInterval` (dùng `timeRef`, KHÔNG dùng effect
  theo dõi `time<=0` để tránh lỗi lint set-state-in-effect).
- **Bug đã fix khi làm:** `firstLine(meaning)` lấy nhầm DÒNG ĐẦU của thẻ = dòng "Phiên âm: …"
  → lộ phát âm/đáp án. Thêm helper module-level `pickMeaning(raw)`: ưu tiên dòng "Nghĩa: …",
  nếu không có thì bỏ dòng phiên âm/ví dụ; thẻ 1 dòng trả nguyên văn. Dùng cho CẢ 2 game.
- Cả 2 game giờ cũng `fixed inset-0 z-50` (fullscreen như 3 game kia). Helper dùng chung
  (`speakEnglish`, `StarField`, `HeartRow`, `isPlayableWord`, `pickMeaning`) nằm ở block HELPER
  NGAY SAU MatchGame nhưng TRƯỚC TypingGame — QuizGame/MatchGame gọi chúng lúc render nên không
  vướng TDZ.
- **Đã test** (vite 5199, chỉ đọc thẻ): Kiểm tra — meteor hiện đúng nghĩa tiếng Việt ("Hiệu quả",
  "sa mạc"), click đúng +10, click sai mất tim, streak reset. Ghép thẻ — lưới + nghĩa đúng, ghép
  cặp đúng cộng điểm theo streak (10 → 30 với 🔥x2), thẻ matched biến mất, hết giờ → màn timeUp.
  **Mẹo test:** đồng hồ MatchGame (`setInterval`, hidden-tab clamp ~1s) hết 20s khi thao tác chậm
  qua MCP → đóng băng bằng `for(i)clearInterval(i)` trong console trước khi ghép. rAF của QuizGame
  bị freeze khi pane ẩn (meteor không rơi) nhưng options render nên vẫn test được luồng chọn.
- Lint: vẫn 3 lỗi CÓ SẴN (emoji regex, setState-in-effect ~dòng 2152/2726). Build OK.

## v1.6.1 — fix layout 2 game mới bị co nhỏ

User báo lỗi UI: game hiện ra như một hộp tí hon (~500×230px) giữa trang trắng, các từ rơi
chồng đè lên nhau. **Nguyên nhân:** `<main className="max-w-md mx-auto px-4">` (App.jsx ~3899)
giới hạn rộng 448px và KHÔNG có chiều cao → `h-full` của game collapse về chiều cao nội dung,
vùng `flex-1` (nơi từ rơi) gần như bằng 0 nên từ dồn cục. **Cách sửa:** đổi root của cả 6 màn
(intro/over/playing × 2 game) từ `relative … h-full` sang `fixed inset-0 z-50` để thoát khung
`max-w-md` và phủ kín viewport (đã đo: game 720px, vùng chơi flex-1 = 551px trên viewport 720).
z-50 để đè lên bottom nav (nav z-20) — game có nút back riêng nên không sao.

## v1.6.0 — 2 game mới "Luyện Gõ" + "Ong Chính Tả" (kiểu Parroto)

Thêm 2 trò chơi vào tab GAME (`src/App.jsx`), đặt ngay TRƯỚC component `GameTab`:

- **`TypingGame` (Luyện Gõ, 🚀):** từ tiếng Anh rơi từ trên xuống trên nền vũ trụ (StarField),
  người chơi gõ đúng để "bắn hạ" (laser SVG + hiệu ứng nổ). 3 tim, mất 1 khi để từ rơi chạm mốc
  `TYPING_MISS_LINE`=88%. Mốc 1→20, mỗi mốc 3 từ (`TYPING_TOTAL`=60) → thắng. Tốc độ rơi & nhịp
  spawn tăng dần theo mốc. Vòng lặp chạy bằng `requestAnimationFrame` (state `words` mirror từ
  `wordsRef`); khớp từ trong `processTyped` (event handler, đọc `wordsRef.current`), gõ trùng
  1 từ (không phân biệt hoa/thường) là bắn.
- **`SpellingBee` (Ong Chính Tả, 🐝):** phát âm từ qua Web Speech (`speakEnglish`, rate 0.85),
  hiện ô trống + gợi ý chữ cái đầu; gõ lại rồi Enter/nút Kiểm tra. Đúng → +điểm, sang từ; sai →
  mất tim + lộ đáp án. 20 từ/lượt. Dùng `queue` STATE (không phải ref — lint `react-hooks/refs`
  cấm đọc ref khi render). Có nút "Gợi ý nghĩa" (lấy dòng đầu của `meaning`).
- **Chọn từ:** cả 2 chỉ dùng thẻ `status === "known"` của chủ đề đang chọn (`knownCards` truyền
  từ `GameTab`), và LỌC tiếp qua `isPlayableWord` (từ ĐƠN, chỉ chữ cái + `'`/`-`, dài 2-18). Lọc
  này QUAN TRỌNG: nhiều thẻ là cụm có "/" như "Have/Finish classes" — nếu không lọc, ô nhập strip
  "/" nên không bao giờ khớp được. `availableCount` (điều kiện ≥3 từ để chơi) dùng ĐÚNG bộ lọc này.
- Helper dùng chung mới (module-level, trước `GameTab`): `speakEnglish`, `StarField`, `HeartRow`,
  `isPlayableWord`. Keyframes animation nhúng trong `<style>` của mỗi game (tiền tố `fl…`).
- Menu GAME (`GameTab`) thêm 2 nút (cyan cho Luyện Gõ, amber cho Ong Chính Tả) + 2 nhánh
  `activeGame === "typing" | "spelling"`.
- **Đã test** (vite riêng port 5199, đọc DB thật — game CHỈ ĐỌC thẻ, không ghi): menu hiện đủ 4
  game; SpellingBee test cả luồng đúng (điểm +1, sang từ) lẫn sai (mất tim, lộ đáp án, tiến vòng),
  onChange điền ô chuẩn. TypingGame render intro/gameplay OK. **Lưu ý test:** Browser pane ẩn nên
  `requestAnimationFrame` bị ĐÓNG BĂNG hoàn toàn → không xem được từ rơi chạy trong pane; ở tab
  hiển thị của user thật thì chạy bình thường 60fps. `setTimeout` vẫn chạy (bị clamp ~1s).
- Lint: vẫn 3 lỗi CÓ SẴN (emoji regex ~1880, setState-in-effect ~2454) — không thuộc thay đổi này.
  Build production OK.

## Phiên trước (2026-07-23) — v1.5.0: che hình video khi luyện Chép chính tả

User không muốn nhìn thấy hình video (chỉ muốn nghe) trong màn hình luyện tập. Thêm một lớp
phủ `absolute inset-0` đè lên khung player YouTube (`App.jsx`, quanh dòng ~2394): nền
`bg-slate-900/95` + `backdrop-blur-md`, giữa có icon loa và chữ "Chỉ nghe, không xem hình".
`pointer-events-none` để không chặn nút điều khiển gốc của YouTube nếu cần bấm tới. Đã test
bằng cách chạy `vite` riêng (không qua `vercel dev`, vì credentials Supabase hardcode trong
App.jsx nên không cần env) và bơm video giả vào `localStorage` (`flashlearn_dictation_videos`)
để vào được màn hình luyện tập — xác nhận overlay che kín, đúng vị trí, đè lên iframe.

## Phiên trước cùng ngày (2026-07-23) — v1.4.0: bookmarklet "FlashLearn Sub"

**v1.3.0 bị chặn ngoài thực tế:** YouTube bot-check IP datacenter → `/api/transcript` trên
Vercel dính "Sign in to confirm you're not a bot" với TẤT CẢ client innertube đã thử
(ANDROID, ANDROID_VR, IOS, TVHTML5_EMBED, MWEB — xem `api/transcript.js`, có `?debug=1`).
Invidious/Piped công cộng cũng chết gần hết (đã test ~10 instance). Từ IP dân cư (máy user)
thì innertube chạy tốt — nhưng browser bị CORS (youtubei KHÔNG trả CORS header, và gọi kèm
Origin còn bị 403 sorry-page luôn).

**Giải pháp v1.4.0 — bookmarklet chộp phụ đề ngay trong trang youtube.com:**
- Trang watch: `baseUrl` từ `getPlayerResponse()` fetch trực tiếp trả RỖNG (thiếu POT token).
  Nhưng khi bật CC, CHÍNH player fetch `/api/timedtext...&fmt=json3` kèm đầy đủ token →
  bookmarklet hook `window.fetch` + `XMLHttpRequest` để chộp response đó, copy vào clipboard.
- Flow người dùng: kéo nút "⚡ FlashLearn Sub" (trong form Thêm video) lên thanh bookmark một
  lần → mở video YouTube → bấm bookmark (nó tự tắt/bật CC để ép fetch mới, chờ tối đa 8s) →
  quay lại app dán vào ô Transcript → Lưu.
- `parseJson3WordCues` parse json3 (`"wireMagic":"pb3"`, events[].segs[].tOffsetMs theo TỪNG
  TỪ, cờ `isSpeakerChange` cho ">>") → `wordListToCues` (đuôi chung với srv3) → merge như cũ.
  Kết quả trên json3 THẬT chộp từ player: 98 câu, 100% trọn vẹn, 0 chờm — y hệt srv3.
- Tiêu đề video: lấy qua oEmbed (`youtube.com/oembed` CÓ mở CORS) khi user không nhập.
- `/api/transcript` vẫn được thử trước (phòng khi YouTube nới tay với datacenter); lỗi thì
  thông báo hướng dẫn dùng bookmarklet.
- Lint: 3 lỗi CÓ SẴN (emoji regex ~1148, setState-in-effect ~1722) — không thuộc thay đổi này.

## Phiên trước cùng ngày (2026-07-23) — v1.3.0: phụ đề word-level, hết hẳn lệch audio

**User vẫn báo lệch text/voice sau v1.2.1** (đệm quanh mốc nội suy chỉ giảm chứ không hết —
và phần phát chờm làm cảm giác lệch nặng hơn). Giải pháp triệt để: bỏ hẳn nội suy, lấy mốc
thời gian theo TỪNG TỪ từ chính YouTube.

- **Phát hiện then chốt:** phụ đề auto-generated của YouTube CÓ mốc theo từng từ (định dạng
  srv3: `<p t="2399" d="7361"><s>IELTS</s><s t="721"> 20</s>...` — `t` của `<s>` là offset ms
  so với đầu đoạn). File .srt của DownSub đã làm phẳng mất thông tin này — đó là gốc rễ của
  mọi vấn đề lệch audio từ trước tới nay.
- **Cách lấy:** innertube API với client **ANDROID** (`api/transcript.js` — Vercel serverless
  function, browser bị CORS chặn nên phải proxy). Client WEB trả "Video unavailable" khi gọi
  server-side; ANDROID trả captionTracks với baseUrl dùng được không cần POT token (đã kiểm
  chứng 2026-07-23 cả từ máy local lẫn từ Vercel production). Nếu sau này YouTube chặn →
  endpoint trả lỗi, UI đã có sẵn thông báo hướng dẫn quay lại dán file .srt thủ công.
- **Client:** `parseSrv3WordCues` (App.jsx) parse XML srv3 bằng regex (không DOMParser — để
  test được bằng Node) thành cue MỖI TỪ một mốc thật; `mergeCuesIntoSegments` chạy y nguyên
  trên cue-từ → mọi ranh giới câu đều là mốc từ thật, **không còn nội suy/slack/fuzzyEnd**
  cho đường này (các cơ chế đó vẫn giữ cho đường .srt dán tay fallback). Token ">>" (đổi
  người nói) → cờ `forceBreak` trên cue, luôn tách câu. Cue 1-từ khiến check "but I" cần ghép
  2 cue kế (`nextText` trong merge loop).
- **UX:** ô Transcript giờ KHÔNG bắt buộc — để trống là app tự gọi `/api/transcript?v=<id>`,
  tự điền cả tiêu đề video từ YouTube. Dán .srt/.vtt vẫn được (ưu tiên bản dán nếu có).
  `npm run dev` local không có serverless function → `TRANSCRIPT_API_BASE` trỏ thẳng về
  production (CORS đã mở `*`).
- Kết quả trên video IELTS Cam 20 T1 (wk_1MiLAT0c): 98 câu, 100% kết thúc trọn vẹn, 0 cửa sổ
  audio chờm nhau; đoạn đánh vần "A U D L E Y." có đúng cửa sổ ~5s thật của nó.
- Watcher dừng playback đổi ngưỡng `-0.15` → `-0.05` (mốc end giờ chính xác, dừng sớm sẽ cụt
  đuôi từ cuối).
- **Caveat cũ vẫn đúng:** video đã lưu phải xoá + Thêm lại (giờ chỉ cần dán link, không cần
  file) mới nhận cách cắt mới.

## Phiên trước cùng ngày (2026-07-23)

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
