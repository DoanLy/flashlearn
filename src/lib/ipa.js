// Phiên âm cả câu cho tab Phát âm. Từ điển khá nặng (dựng bởi scripts/build-ipa-dict.mjs) nên để
// ở public/ và chỉ tải khi vào luyện, không nhét vào bundle chính.
let dictPromise = null;

export const loadIpaDict = () => {
  if (!dictPromise) {
    dictPromise = fetch(`${import.meta.env.BASE_URL}ipa-en.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .catch((err) => {
        dictPromise = null; // lần vào luyện sau được thử tải lại
        throw err;
      });
  }
  return dictPromise;
};

const lookupIpa = (word, dict) => {
  if (dict[word]) return dict[word];
  // Sở hữu cách (engineer's) không có trong từ điển: âm cuối vô thanh đọc /s/, còn lại /z/.
  if (word.endsWith("'s") && dict[word.slice(0, -2)]) {
    const base = dict[word.slice(0, -2)];
    return `${base}${/[ptkfθ]$/.test(base) ? "s" : "z"}`;
  }
  return "";
};

// Từ không tra được thì giữ nguyên chữ gốc để câu phiên âm không bị thiếu từ so với câu tiếng Anh.
export const sentenceToIpa = (text, dict) => {
  const words = text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .split(/[\s—–]+|(?<=[a-z])-(?=[a-z])/)
    .map((w) => w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ""))
    .filter(Boolean);
  const parts = words.map((w) => lookupIpa(w, dict) || w);
  words.forEach((w, i) => {
    // "the" trước nguyên âm đọc /ði/.
    if (w === "the" && /^[ˈˌ]?[aeiouɪʊəɒʌæɜɑɔ]/.test(parts[i + 1] || "")) parts[i] = "ði";
  });
  return parts.length ? `/${parts.join(" ")}/` : "";
};
