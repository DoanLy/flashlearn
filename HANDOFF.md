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

## Phiên làm việc gần nhất (2026-07-28) — v1.11.0: chuẩn hoá 4 trường (Từ vựng/Phiên âm/Nghĩa/Ví dụ) + fix bug Luyện Gõ

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
