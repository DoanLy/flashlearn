// Tra cứu từ vựng: chấm độ khó theo CEFR (offline) + lấy nghĩa tiếng Việt (cache nhiều tầng).
//
// Thứ tự tra nghĩa, dừng ngay khi có kết quả:
//   1. localStorage  — từ đã tra trước đó, tức thì, sống qua reload trang.
//   2. bảng CEFR offline (src/data/cefr-vocab.json, 3636 từ Oxford A1-B2 kèm nghĩa + IPA).
//   3. /api/translate — proxy riêng trên Vercel, gộp lô, có cache CDN.
// Nhờ (1) và (2) mà phần lớn lần bấm KHÔNG chạm mạng; bản cũ gọi thẳng MyMemory từ browser
// nên dính rate-limit theo IP học viên → treo "Đang tra cứu..." rồi ra "Không có dữ liệu.".

import CEFR_RAW from "../data/cefr-vocab.json";

const API_BASE = import.meta.env.DEV ? "https://flashlearn-its7.vercel.app" : "";

// --- Bảng CEFR ---------------------------------------------------------------------------

// Mỗi mục nén thành "level|nghĩa|ipa" cho nhẹ bundle; giải nén lười theo từng từ được tra.
const cefrCache = new Map();
const decodeCefr = (word) => {
  if (cefrCache.has(word)) return cefrCache.get(word);
  const raw = CEFR_RAW[word];
  let out = null;
  if (raw) {
    const [level, vi, ipa] = raw.split("|");
    out = { word, level, vi: vi || "", ipa: ipa || "" };
  }
  cefrCache.set(word, out);
  return out;
};

export const normalizeWord = (w) =>
  String(w || "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z']/g, "")
    .replace(/^'+|'+$/g, "");

// Sinh các dạng gốc có thể có của một từ đã chia. Không dùng thư viện lemmatizer để khỏi thêm
// dependency: bảng CEFR chỉ có dạng nguyên thể nên vài luật hậu tố là đủ dùng.
const lemmaCandidates = (w) => {
  const out = [w];
  const push = (x) => {
    if (x && x.length >= 2 && !out.includes(x)) out.push(x);
  };
  // sở hữu cách / viết tắt: "company's" → "company", "it's" → "it"
  if (w.includes("'")) push(w.split("'")[0]);
  if (w.endsWith("ies")) push(w.slice(0, -3) + "y");
  if (w.endsWith("ied")) push(w.slice(0, -3) + "y");
  if (w.endsWith("ier")) push(w.slice(0, -3) + "y");
  if (w.endsWith("iest")) push(w.slice(0, -4) + "y");
  if (w.endsWith("es")) push(w.slice(0, -2));
  if (w.endsWith("s")) push(w.slice(0, -1));
  if (w.endsWith("ed")) {
    push(w.slice(0, -2));
    push(w.slice(0, -1));
  }
  if (w.endsWith("ing")) {
    push(w.slice(0, -3));
    push(w.slice(0, -3) + "e");
  }
  if (w.endsWith("er")) push(w.slice(0, -2));
  if (w.endsWith("est")) push(w.slice(0, -3));
  if (w.endsWith("ly")) push(w.slice(0, -2));
  // phụ âm gấp đôi: "stopped" → "stop", "running" → "run"
  const doubled = /(.*[aeiou])([bdfglmnprt])\2$/.exec(w.replace(/(ed|ing)$/, ""));
  if (doubled) push(doubled[1] + doubled[2]);

  // Bảng Oxford dùng chính tả Mỹ, transcript hay dùng Anh-Anh. Đổi chính tả cho TỪNG dạng gốc
  // đã sinh ở trên, vì hai luật phải chồng nhau mới ra kết quả: "apologised" → "apologise"
  // (bỏ -d) → "apologize" (đổi chính tả).
  for (const cand of [...out]) {
    if (cand.endsWith("isation")) push(cand.slice(0, -7) + "ization");
    else if (cand.endsWith("ise")) push(cand.slice(0, -3) + "ize");
    else if (cand.endsWith("yse")) push(cand.slice(0, -3) + "yze"); // analyse → analyze
    if (cand.endsWith("our")) push(cand.slice(0, -3) + "or"); // colour → color
    if (cand.endsWith("tre")) push(cand.slice(0, -3) + "ter"); // centre → center
  }
  return out;
};

/** Tra một từ trong bảng CEFR offline (tự thử dạng gốc). Trả null nếu ngoài Oxford 3000. */
export const cefrLookup = (word) => {
  const w = normalizeWord(word);
  if (!w) return null;
  for (const cand of lemmaCandidates(w)) {
    const hit = decodeCefr(cand);
    if (hit) return hit;
  }
  return null;
};

// --- Cache nghĩa trong localStorage ------------------------------------------------------

const CACHE_KEY = "flashlearn_word_meaning_cache_v1";
const CACHE_LIMIT = 3000;

let memCache = null;
const loadCache = () => {
  if (memCache) return memCache;
  try {
    memCache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    memCache = {};
  }
  if (typeof memCache !== "object" || !memCache) memCache = {};
  return memCache;
};

let flushTimer = null;
const flushCache = () => {
  clearTimeout(flushTimer);
  // Gom nhiều lượt ghi vào một lần: tra cả lô 50 từ chỉ serialize localStorage đúng 1 lần.
  flushTimer = setTimeout(() => {
    try {
      const cache = loadCache();
      const keys = Object.keys(cache);
      if (keys.length > CACHE_LIMIT) {
        // Quá hạn mức thì bỏ nửa cũ nhất theo thời điểm ghi.
        const sorted = keys.sort((a, b) => (cache[a].t || 0) - (cache[b].t || 0));
        for (const k of sorted.slice(0, keys.length - CACHE_LIMIT)) delete cache[k];
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      // localStorage đầy hoặc bị chặn — cache trong RAM vẫn chạy, bỏ qua.
    }
  }, 400);
};

const cacheGet = (w) => loadCache()[w] || null;
const cacheSet = (w, data) => {
  const cache = loadCache();
  const prev = cache[w] || {};
  cache[w] = { m: data.meaning ?? prev.m, p: data.phonetic ?? prev.p, t: Date.now() };
  flushCache();
};

// --- Gọi mạng ----------------------------------------------------------------------------

const withTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

/** Dịch một LÔ từ qua /api/translate. Trả về {từ: nghĩa}, bỏ qua từ nào không dịch được. */
export const translateWords = async (words, { timeout = 8000 } = {}) => {
  const list = [...new Set(words.map(normalizeWord).filter(Boolean))];
  if (!list.length) return {};
  const res = await withTimeout(
    fetch(`${API_BASE}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words: list }),
    }),
    timeout,
  );
  if (!res.ok) throw new Error(`translate_${res.status}`);
  const data = await res.json();
  const results = data?.results || {};
  for (const [w, meaning] of Object.entries(results)) {
    if (meaning) cacheSet(w, { meaning });
  }
  return results;
};

const fetchPhonetic = async (word, timeout = 4000) => {
  const res = await withTimeout(
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`),
    timeout,
  );
  if (!res.ok) return "";
  const data = await res.json();
  return data?.[0]?.phonetic || data?.[0]?.phonetics?.find((p) => p.text)?.text || "";
};

/**
 * Tra một từ, báo kết quả DẦN qua onUpdate thay vì chờ đủ mọi thứ.
 *
 * Đây là điểm mấu chốt sửa lỗi "treo Đang tra cứu...": phiên âm và nghĩa được hiển thị ngay
 * khi phần nào xong, và luôn có kết quả cuối trong khoảng timeout — không bao giờ kẹt spinner.
 *
 * onUpdate({ phonetic, meaning, loading, source })
 * Trả về hàm huỷ để component gọi khi unmount.
 */
export const lookupWord = (rawWord, onUpdate) => {
  const word = normalizeWord(rawWord);
  let cancelled = false;
  const emit = (patch) => {
    if (!cancelled) onUpdate(patch);
  };

  if (!word) {
    emit({ phonetic: "", meaning: "", loading: false, source: "empty" });
    return () => {};
  }

  const cached = cacheGet(word);
  const cefr = cefrLookup(word);

  // Tầng tức thì: bất cứ thứ gì đã có sẵn thì hiện ngay, không spinner.
  const instant = {
    phonetic: cached?.p || cefr?.ipa || "",
    meaning: cached?.m || cefr?.vi || "",
    level: cefr?.level || "",
  };
  const needMeaning = !instant.meaning;
  const needPhonetic = !instant.phonetic;

  emit({
    ...instant,
    loading: needMeaning,
    source: cached ? "cache" : cefr ? "cefr" : "pending",
  });

  if (!needMeaning && !needPhonetic) return () => {};

  // Ghi lại nghĩa lấy từ bảng CEFR để lần sau khỏi phải tra lại.
  if (cefr && !cached) cacheSet(word, { meaning: cefr.vi, phonetic: cefr.ipa });

  if (needMeaning) {
    translateWords([word], { timeout: 8000 })
      .then((results) => {
        const meaning = results[word] || "";
        emit({ meaning: meaning || "Không tìm thấy nghĩa.", loading: false, source: "api" });
      })
      .catch(() => {
        emit({
          meaning: "Không tra được nghĩa (mạng chậm). Bấm lại để thử.",
          loading: false,
          source: "error",
        });
      });
  }

  if (needPhonetic) {
    fetchPhonetic(word)
      .then((phonetic) => {
        if (!phonetic) return;
        cacheSet(word, { phonetic });
        emit({ phonetic });
      })
      .catch(() => {
        /* phiên âm là phụ — thiếu thì thôi, không chặn nghĩa */
      });
  }

  return () => {
    cancelled = true;
  };
};

// --- Chọn từ vựng trung bình–khó của một bài nghe -----------------------------------------

// Từ chức năng + từ siêu phổ biến: luôn loại khỏi danh sách ôn dù CEFR xếp mức nào.
//
// Danh sách này phải bao được cả những từ rất dễ nhưng KHÔNG có trong file Oxford 3000
// (vd "because", "always", "anything") — nếu không, chúng sẽ bị chấm nhầm là "Khó" chỉ vì
// tra bảng không thấy.
const STOPWORDS = new Set(
  `a an the and or but so if then than that this these those there here it its it's i you he she we they me him her us them my your his their our
  is am are was were be been being do does did done doing have has had having will would shall should can could may might must
  of in on at to for with from by about into over under again further once as up down out off no not nor only own same too very just
  s t re ve ll d m o y ok okay yeah yes oh uh um hmm hey hi hello please thanks thank sorry
  what when where which who whom why how all any both each few more most other some such
  one two three four five six seven eight nine ten first second next last
  go going got get gets getting come coming know knew think thought say said says see saw look looking want wanted like liked make made take took
  good great nice well really much many lot lots thing things time way people
  because although though however therefore while during since until unless whether through against between among within without across
  before after every another myself yourself himself herself itself ourselves themselves
  anyone everyone someone everybody somebody nobody nothing something anything everything
  maybe perhaps almost always never often sometimes usually already still even also enough quite rather instead besides otherwise meanwhile
  actually basically definitely probably obviously simply exactly totally completely absolutely
  new old big small long short high low right left new same different easy hard
  yours mine ours theirs whose himself sure fine
  need needs needed use used using give gave given put puts putting keep kept let lets find found tell told ask asked try tried work works working
  day days week weeks month months year years today tomorrow yesterday now soon later
  man woman men women child children friend friends family home house school work job`
    .split(/\s+/)
    .filter(Boolean),
);

const LEVEL_RANK = { A1: 0, A2: 1, B1: 2, B2: 3 };

/**
 * Quét transcript của một bài nghe, trả về danh sách từ trung bình–khó nên xem trước.
 *
 * Phân loại:
 *   - "medium" → có trong Oxford 3000 ở mức B1/B2 (nghĩa lấy offline, hiện ngay).
 *   - "hard"   → không có trong Oxford A1-B2 ⇒ ngoài vốn 3000 từ phổ thông (cần dịch qua API).
 * Từ A1/A2 bị loại vì học viên đã biết; stopword và từ dưới 3 ký tự cũng loại.
 *
 * @param {string[]} texts  các câu của bài nghe
 * @param {number}   limit  số từ tối đa trả về
 */
export const collectStudyWords = (texts, { limit = 40 } = {}) => {
  const counts = new Map();
  const firstSeen = new Map();

  texts.forEach((text, segIndex) => {
    for (const token of String(text || "").split(/\s+/)) {
      const w = normalizeWord(token);
      if (w.length < 3 || STOPWORDS.has(w)) continue;
      // Đưa về dạng gốc để "meetings" và "meeting" không thành hai mục riêng.
      const cefr = cefrLookup(w);
      const key = cefr ? cefr.word : w;
      if (STOPWORDS.has(key)) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
      if (!firstSeen.has(key)) firstSeen.set(key, segIndex);
    }
  });

  const items = [];
  for (const [word, count] of counts) {
    const cefr = cefrLookup(word);
    if (cefr && LEVEL_RANK[cefr.level] <= LEVEL_RANK.A2) continue; // A1/A2: coi như đã biết
    const cached = cacheGet(word);
    items.push({
      word,
      count,
      segIndex: firstSeen.get(word) ?? 0,
      band: cefr ? "medium" : "hard",
      level: cefr?.level || "?",
      phonetic: cached?.p || cefr?.ipa || "",
      meaning: cached?.m || cefr?.vi || "",
    });
  }

  // Khó trước (thứ mà học viên dễ nghe hụt nhất), trong cùng nhóm thì từ xuất hiện sớm lên trước.
  const bandRank = { hard: 0, medium: 1 };
  items.sort(
    (a, b) => bandRank[a.band] - bandRank[b.band] || a.segIndex - b.segIndex || a.word.localeCompare(b.word),
  );
  return items.slice(0, limit);
};
