// Vercel serverless function: dịch Anh → Việt cho panel tra cứu từ và panel "Từ vựng cần biết".
//
// Vì sao cần proxy thay vì gọi thẳng từ browser:
//   - api.mymemory.translated.net (bản cũ) giới hạn quota theo IP NGƯỜI DÙNG. Học viên bấm vài
//     chục từ một buổi là hết quota → treo 5-10s rồi trả chuỗi lỗi, đúng triệu chứng "tra cứu
//     rất chậm, không hiển thị được nghĩa".
//   - Endpoint translate_a của Google nhanh nhưng chặn CORS nên browser không gọi thẳng được.
//     Đi qua đây thì hết cả hai vấn đề, và quota tính theo IP Vercel + cache CDN.
//
// Dùng:
//   GET  /api/translate?q=slide                  → { results: { slide: "trang trình bày" } }
//   POST /api/translate  { "words": ["a","b"] }  → { results: { a: "...", b: "..." } }
//
// POST dạng mảng để panel từ vựng dịch cả bài trong MỘT lượt thay vì N request (đo thực tế:
// 60 từ ~800ms).

const MAX_WORDS = 80;
const UPSTREAM_TIMEOUT_MS = 6000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

const fetchWithTimeout = async (url, ms) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": UA } });
  } finally {
    clearTimeout(timer);
  }
};

// Nguồn chính. client=dict-chrome-ex giữ nguyên xuống dòng nên gửi N từ ngăn bằng "\n" là nhận
// đúng N dòng kết quả. Trả về ["chuỗi đã dịch"] hoặc [["chuỗi đã dịch", "en"]] tuỳ lúc.
const googleDictChrome = async (text) => {
  const url =
    "https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=vi&q=" +
    encodeURIComponent(text);
  const res = await fetchWithTimeout(url, UPSTREAM_TIMEOUT_MS);
  if (!res.ok) throw new Error(`dict_chrome_${res.status}`);
  const data = await res.json();
  const first = Array.isArray(data) ? data[0] : null;
  const out = typeof first === "string" ? first : Array.isArray(first) ? String(first[0] || "") : "";
  if (!out.trim()) throw new Error("dict_chrome_empty");
  return out;
};

// Dự phòng 1: endpoint gtx (mảng lồng nhau [[["nghĩa","gốc",...], ...], ...]).
const googleGtx = async (text) => {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=" +
    encodeURIComponent(text);
  const res = await fetchWithTimeout(url, UPSTREAM_TIMEOUT_MS);
  if (!res.ok) throw new Error(`gtx_${res.status}`);
  const data = await res.json();
  const chunks = Array.isArray(data?.[0]) ? data[0] : [];
  const out = chunks.map((c) => (Array.isArray(c) ? c[0] : "")).join("");
  if (!out.trim()) throw new Error("gtx_empty");
  return out;
};

// Dự phòng 2: MyMemory. Chậm hơn nhưng ở đây quota tính theo IP server nên không đụng học viên.
const myMemory = async (text) => {
  const url = "https://api.mymemory.translated.net/get?langpair=en|vi&q=" + encodeURIComponent(text);
  const res = await fetchWithTimeout(url, UPSTREAM_TIMEOUT_MS);
  if (!res.ok) throw new Error(`mymemory_${res.status}`);
  const data = await res.json();
  const out = String(data?.responseData?.translatedText || "").trim();
  // MyMemory nhồi thông báo lỗi vào chính trường kết quả thay vì dùng HTTP status.
  if (!out || /QUERY LENGTH LIMIT|MYMEMORY WARNING|INVALID/i.test(out))
    throw new Error("mymemory_bad");
  return out;
};

const PROVIDERS = [
  ["dict-chrome", googleDictChrome],
  ["gtx", googleGtx],
  ["mymemory", myMemory],
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  let words = [];
  if (req.method === "POST") {
    const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
    words = Array.isArray(body?.words) ? body.words : [];
  } else {
    const q = req.query?.q;
    words = Array.isArray(q) ? q : q ? [q] : [];
  }

  // Bỏ xuống dòng trong từng mục: "\n" là ký tự phân tách lô, lọt vào là lệch kết quả.
  words = [
    ...new Set(
      words
        .map((w) => String(w || "").replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .slice(0, MAX_WORDS),
    ),
  ];

  if (!words.length) {
    res.status(400).json({ error: "missing_words", results: {} });
    return;
  }

  const joined = words.join("\n");
  for (const [name, translate] of PROVIDERS) {
    let translated;
    try {
      translated = await translate(joined);
    } catch {
      continue;
    }
    const results = mapLines(words, translated);
    if (!Object.keys(results).length) continue;
    // Nghĩa của một từ không đổi theo thời gian — cache CDN dài để lần sau trả về tức thì.
    res.setHeader("Cache-Control", "s-maxage=2592000, stale-while-revalidate=2592000");
    res.status(200).json({ via: name, results });
    return;
  }

  res.status(502).json({ error: "upstream_failed", results: {} });
}

// Upstream đôi khi trả về ít/nhiều dòng hơn số từ gửi đi (nó tự gộp dòng ngắn). Chỉ ghép theo
// thứ tự khi số dòng khớp; lệch thì trả rỗng để client thử lại thay vì gán nhầm nghĩa.
function mapLines(words, translated) {
  if (words.length === 1) {
    const one = translated.replace(/\s*\n+\s*/g, " ").trim();
    return one ? { [words[0]]: one } : {};
  }
  const lines = translated.split("\n").map((l) => l.trim());
  if (lines.length !== words.length) return {};
  const results = {};
  words.forEach((w, i) => {
    if (lines[i]) results[w] = lines[i];
  });
  return results;
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
