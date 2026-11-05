// Dựng public/ipa-en.json — từ điển IPA Anh-Anh để hiện phiên âm cả câu ở tab Phát âm.
// Chạy: node scripts/build-ipa-dict.mjs
// Nguồn (đã gitignore, xem scripts/build-oxford-phonetics.mjs): _en_UK_ipa.txt (eSpeak, phủ rộng)
// và _oxford_full_word.json (Oxford, chính xác hơn nên được ưu tiên).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

// eSpeak đặt dấu nhấn ngay trước nguyên âm (ʃˈɪpɪŋ); Oxford đặt ở đầu âm tiết (ˈʃɪpɪŋ).
const ONSETS = [
  "spr", "str", "skr", "spl", "skw", "pr", "br", "tr", "dr", "kr", "ɡr", "fr", "θr", "ʃr", "pl", "bl",
  "kl", "ɡl", "fl", "sl", "sp", "st", "sk", "sm", "sn", "sw", "tw", "dw", "kw", "ɡw", "pj", "bj", "tj",
  "dj", "kj", "ɡj", "fj", "vj", "mj", "nj", "hj", "lj", "dʒ", "tʃ", "b", "d", "f", "ɡ", "h", "j", "k", "l",
  "m", "n", "p", "r", "s", "t", "v", "w", "z", "ð", "θ", "ʃ", "ʒ",
];
const moveStress = (ipa) =>
  ipa.replace(/([^ˈˌ]*?)([ˈˌ])/g, (_, before, mark) => {
    const onset = ONSETS.find((o) => before.endsWith(o)) || "";
    return `${before.slice(0, before.length - onset.length)}${mark}${onset}`;
  });

// Đưa ký hiệu eSpeak về bộ ký hiệu Oxford đang dùng trong các thẻ.
// Từ một âm tiết thì Oxford không ghi dấu nhấn, eSpeak vẫn ghi (ˈɪz).
const normalizeEspeak = (ipa) => {
  const out = moveStress(ipa.replace(/ɐ/g, "ə").replace(/ɛ/g, "e").replace(/ɹ/g, "r").replace(/ɾ/g, "t").replace(/ᵻ/g, "ɪ"));
  const syllables = out.match(/[aeiouɪʊəɒʌæɜɑɔ]+/g) || [];
  return syllables.length <= 1 ? out.replace(/[ˈˌ]/g, "") : out;
};

const dict = {};
for (const line of readFileSync(join(HERE, "_en_UK_ipa.txt"), "utf8").split("\n")) {
  const [w, p] = line.split("\t");
  if (w && p && p.trim()) {
    dict[w.trim().toLowerCase()] = normalizeEspeak(p.split(",")[0].trim().replace(/^\/|\/$/g, ""));
  }
}

const seenOxford = new Set();
for (const { value } of JSON.parse(readFileSync(join(HERE, "_oxford_full_word.json"), "utf8"))) {
  const w = String(value?.word || "").trim().toLowerCase();
  const uk = value?.phonetics?.uk;
  if (!w || !uk || seenOxford.has(w)) continue;
  seenOxford.add(w);
  dict[w] = uk.split(",")[0].trim().replace(/^\/|\/$/g, "");
}

// Hai nguồn trên thiếu dạng rút gọn; từ chức năng thì lấy DẠNG YẾU vì đọc trong câu.
Object.assign(dict, {
  a: "ə", an: "ən", the: "ðə", to: "tə", for: "fə(r)", of: "əv", and: "ənd", at: "ət",
  "i'm": "aɪm", "i've": "aɪv", "i'll": "aɪl", "i'd": "aɪd",
  "you're": "jɔː(r)", "you've": "juːv", "you'll": "juːl", "you'd": "juːd",
  "he's": "hiːz", "he'll": "hiːl", "he'd": "hiːd", "she's": "ʃiːz", "she'll": "ʃiːl", "she'd": "ʃiːd",
  "it's": "ɪts", "it'll": "ˈɪtl", "we're": "wɪə(r)", "we've": "wiːv", "we'll": "wiːl", "we'd": "wiːd",
  "they're": "ðeə(r)", "they've": "ðeɪv", "they'll": "ðeɪl", "they'd": "ðeɪd",
  "that's": "ðæts", "there's": "ðeəz", "here's": "hɪəz", "what's": "wɒts", "who's": "huːz",
  "where's": "weəz", "how's": "haʊz", "let's": "lets",
  "don't": "dəʊnt", "doesn't": "ˈdʌznt", "didn't": "ˈdɪdnt", "can't": "kɑːnt", "couldn't": "ˈkʊdnt",
  "won't": "wəʊnt", "wouldn't": "ˈwʊdnt", "shouldn't": "ˈʃʊdnt", "isn't": "ˈɪznt", "aren't": "ɑːnt",
  "wasn't": "ˈwɒznt", "weren't": "wɜːnt", "haven't": "ˈhævnt", "hasn't": "ˈhæznt", "hadn't": "ˈhædnt",
  gonna: "ˈɡɒnə", wanna: "ˈwɒnə", gotta: "ˈɡɒtə", okay: "əʊˈkeɪ",
});

const out = join(HERE, "..", "public", "ipa-en.json");
writeFileSync(out, JSON.stringify(dict));
console.log(`${Object.keys(dict).length} từ → ${out}`);
