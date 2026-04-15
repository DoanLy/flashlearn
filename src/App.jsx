import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  BookOpen,
  List,
  Volume2,
  Check,
  X,
  Trash2,
  RotateCcw,
  AlertCircle,
  Edit2,
  Save,
  Tag,
  CheckCircle,
  Download,
  CloudUpload,
  Loader2,
  Mic,
  Play,
  ArrowLeft,
  Square,
  ChevronLeft,
  ChevronRight,
  Languages,
  BookmarkPlus,
} from "lucide-react";

// ============================================================================
// COMPONENT: PronunciationCoach
// ============================================================================
const PronunciationCoach = ({ onAddFlashcard, existingDecks = [] }) => {
  const [mode, setMode] = useState("input");
  const [fullText, setFullText] = useState(
    "At a startup, there's no QA team to catch that. No test suite running on every deploy.",
  );
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spokenText, setSpokenText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [browserSupported, setBrowserSupported] = useState(true);

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [targetDeck, setTargetDeck] = useState("Chung");
  const [wordCache, setWordCache] = useState({});

  const recognitionRef = useRef(null);
  const spokenTextRef = useRef("");
  const finalTranscriptRef = useRef("");
  const isRecordingRef = useRef(false);
  const isManualStopRef = useRef(false);

  const handleStartPractice = () => {
    if (!fullText || !fullText.trim()) return;
    const splitRegex = /(?<=[.!?])\s+/;
    let parsed = fullText.split(splitRegex).filter((s) => s.trim().length > 0);
    if (parsed.length === 0) parsed = [fullText];
    setSentences(parsed);
    setCurrentIndex(0);
    setAnalysisResult(null);
    setSpokenText("");
    setSelectedWord(null);
    setMode("practice");
  };

  const handleNextSentence = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetPracticeState();
    }
  };

  const handlePrevSentence = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      resetPracticeState();
    }
  };

  const resetPracticeState = () => {
    setAnalysisResult(null);
    setSpokenText("");
    setSelectedWord(null);
    setErrorMsg("");
    finalTranscriptRef.current = "";
    spokenTextRef.current = "";
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (!finalTranscriptRef.current) {
        setSpokenText("");
        spokenTextRef.current = "";
        setAnalysisResult(null);
        setSelectedWord(null);
        setErrorMsg("");
      }
      setIsRecording(true);
      isRecordingRef.current = true;
    };

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      const fullTextSpoken = finalTranscriptRef.current
        ? finalTranscriptRef.current + " " + currentTranscript
        : currentTranscript;
      setSpokenText(fullTextSpoken);
      spokenTextRef.current = fullTextSpoken;
    };

    recognition.onend = () => {
      if (!isManualStopRef.current && isRecordingRef.current) {
        finalTranscriptRef.current = spokenTextRef.current;
        try {
          recognition.start();
          return;
        } catch (e) {
          console.error("Recognition restart failed", e);
        }
      }
      setIsRecording(false);
      isRecordingRef.current = false;
      finalTranscriptRef.current = "";
      isManualStopRef.current = false;

      const targetSentence = sentences[currentIndex];
      if (spokenTextRef.current?.trim() && targetSentence) {
        analyzePronunciation(targetSentence, spokenTextRef.current);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setErrorMsg("Vui lòng cho phép truy cập micro để luyện tập.");
      }
    };

    recognitionRef.current = recognition;
    return () => {
      if (recognitionRef.current) {
        isManualStopRef.current = true;
        recognitionRef.current.stop();
      }
    };
  }, [currentIndex, sentences]);

  const toggleRecording = () => {
    if (!browserSupported) {
      setErrorMsg("Trình duyệt không hỗ trợ nhận diện giọng nói.");
      return;
    }
    if (!recognitionRef.current) return;

    if (isRecording) {
      isManualStopRef.current = true;
      recognitionRef.current.stop();
    } else {
      isManualStopRef.current = false;
      finalTranscriptRef.current = "";
      spokenTextRef.current = "";
      setSpokenText("");
      setAnalysisResult(null);
      setErrorMsg("");
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Mic start error", e);
      }
    }
  };

  const analyzePronunciation = (target, spoken) => {
    if (!target || !spoken) return;
    const cleanWord = (w) => (w || "").toLowerCase().replace(/[^a-z0-9']/g, "");
    const originalWords = target.trim().split(/\s+/);
    const spokenCleanWords = spoken.trim().split(/\s+/).map(cleanWord);
    let score = 0;
    const result = originalWords.map((origWord) => {
      const cleanOrig = cleanWord(origWord);
      const isCorrect = spokenCleanWords.includes(cleanOrig);
      if (isCorrect) score++;
      return { display: origWord, clean: cleanOrig, isCorrect: isCorrect };
    });
    const accuracy = Math.round((score / originalWords.length) * 100);
    setAnalysisResult({ words: result, accuracy });
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window && text) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    }
  };

  const handleWordClick = async (wordObj) => {
    if (!wordObj?.clean) return;
    speakText(wordObj.clean);
    setIsAddingMode(false);

    if (wordCache[wordObj.clean]) {
      setSelectedWord({
        ...wordObj,
        ...wordCache[wordObj.clean],
        loading: false,
      });
      return;
    }

    setSelectedWord({ ...wordObj, loading: true });

    try {
      const dictPromise = fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${wordObj.clean}`,
      ).then((res) => (res.ok ? res.json() : null));

      const transPromise = fetch(
        `https://api.mymemory.translated.net/get?q=${wordObj.clean}&langpair=en|vi`,
      ).then((res) => (res.ok ? res.json() : null));

      const [dictData, transData] = await Promise.all([
        dictPromise,
        transPromise,
      ]);

      const phonetic =
        dictData?.[0]?.phonetic ||
        dictData?.[0]?.phonetics?.find((p) => p.text)?.text ||
        "n/a";
      const meaning =
        transData?.responseData?.translatedText || "Không có dữ liệu.";

      const data = { meaning, phonetic };
      setWordCache((prev) => ({ ...prev, [wordObj.clean]: data }));
      setSelectedWord({ ...wordObj, ...data, loading: false });
    } catch (error) {
      console.error("Lỗi khi tra từ:", error);
      setSelectedWord({
        ...wordObj,
        loading: false,
        meaning: "Lỗi kết nối.",
        phonetic: "",
      });
    }
  };

  const handleAddSubmit = () => {
    if (selectedWord && selectedWord.meaning && onAddFlashcard) {
      onAddFlashcard(selectedWord.clean, selectedWord.meaning, targetDeck);
      setIsAddingMode(false);
    }
  };

  if (mode === "input") {
    return (
      <div className="animate-in fade-in duration-300 pb-24">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Văn bản luyện tập
              </h2>
              <p className="text-xs text-slate-500">
                Nhập đoạn văn để chia nhỏ câu luyện tập.
              </p>
            </div>
          </div>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[200px] leading-relaxed mb-4"
            value={fullText}
            onChange={(e) => setFullText(e.target.value)}
            placeholder="Dán văn bản tiếng Anh vào đây..."
          />
          <button
            onClick={handleStartPractice}
            disabled={!fullText || !fullText.trim()}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            Bắt đầu luyện đọc <Play size={20} className="fill-current" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-36 flex flex-col pt-2">
      <div className="flex items-center justify-between mb-4 w-full">
        <button
          onClick={() => setMode("input")}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> <span className="text-sm">Quay lại</span>
        </button>
        <div className="bg-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 tracking-wider">
          CÂU {currentIndex + 1} / {sentences.length}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative flex flex-col w-full min-h-[300px]">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => speakText(sentences[currentIndex])}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 text-xs font-bold transition-colors"
          >
            <Volume2 size={16} /> Nghe mẫu
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center mt-8 mb-6">
          {!analysisResult ? (
            <p className="text-2xl font-medium text-slate-800 leading-relaxed text-center">
              {sentences[currentIndex] || "Kết thúc văn bản."}
            </p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-2">
                {(analysisResult.words || []).map((wordObj, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleWordClick(wordObj)}
                    className={`px-3 py-1.5 rounded-lg text-lg font-medium transition-all ${
                      wordObj.isCorrect
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-600 border border-red-200 shadow-sm"
                    }`}
                  >
                    {wordObj.display}
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <div
                  className={`px-4 py-1.5 rounded-full flex items-center gap-2 font-bold text-sm ${
                    analysisResult.accuracy >= 80
                      ? "bg-green-100 text-green-700"
                      : analysisResult.accuracy >= 50
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {analysisResult.accuracy >= 80 ? (
                    <Check size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  {analysisResult.accuracy}% Chính xác
                </div>
              </div>
            </div>
          )}
        </div>

        {(isRecording || errorMsg) && (
          <div className="absolute bottom-0 left-0 w-full bg-slate-50 p-4 border-t border-slate-100 flex flex-col items-center">
            {errorMsg ? (
              <p className="text-red-500 text-sm font-medium flex items-center gap-2">
                <AlertCircle size={14} /> {errorMsg}
              </p>
            ) : (
              <p className="text-center text-slate-500 italic text-sm animate-pulse">
                {spokenText || "Đang lắng nghe..."}
              </p>
            )}
          </div>
        )}
      </div>

      {selectedWord && (
        <div className="mt-4 bg-slate-800 text-white rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4 relative shadow-xl w-full">
          <button
            onClick={() => setSelectedWord(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>

          {selectedWord.loading ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <Loader2 className="animate-spin text-blue-400 w-8 h-8" />
              <p className="text-xs text-slate-400 tracking-widest uppercase font-bold">
                Đang tra cứu...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 pr-6">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <h4 className="text-xl font-bold text-blue-400">
                      {selectedWord.clean}
                    </h4>
                    {selectedWord.phonetic && (
                      <span className="text-sm text-slate-400 italic font-mono">
                        {selectedWord.phonetic}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => speakText(selectedWord.clean)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-blue-400 transition-all active:scale-90"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                {!isAddingMode && (
                  <button
                    onClick={() => setIsAddingMode(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors"
                  >
                    <BookmarkPlus size={14} /> Lưu từ học
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-slate-700/50">
                {isAddingMode ? (
                  <div className="animate-in fade-in zoom-in-95 duration-200 py-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2">
                      Chọn chủ đề
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={targetDeck}
                        onChange={(e) => setTargetDeck(e.target.value)}
                        className="flex-1 bg-slate-700 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none"
                      >
                        {(existingDecks || [])
                          .filter((d) => d !== "Tất cả")
                          .map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={handleAddSubmit}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-500 flex items-center gap-1 transition-colors"
                      >
                        <Check size={16} /> Lưu
                      </button>
                      <button
                        onClick={() => setIsAddingMode(false)}
                        className="bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-sm hover:text-white"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Languages
                      className="text-blue-400 mt-1 shrink-0"
                      size={14}
                    />
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-500">
                        Nghĩa
                      </span>
                      <p className="text-sm font-medium leading-relaxed">
                        {selectedWord.meaning}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="fixed bottom-20 left-0 w-full bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-8 pb-4 px-6 z-10 flex items-center justify-center gap-6">
        <button
          onClick={handlePrevSentence}
          disabled={currentIndex === 0 || isRecording}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-slate-600 disabled:opacity-30 shadow-md border border-slate-100"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <button
            onClick={toggleRecording}
            className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
              isRecording
                ? "bg-red-500 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isRecording ? (
              <Square size={24} className="fill-current" />
            ) : (
              <Mic size={32} />
            )}
          </button>
          <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase">
            {isRecording ? "Dừng" : "Đọc"}
          </span>
        </div>
        <button
          onClick={handleNextSentence}
          disabled={currentIndex === sentences.length - 1 || isRecording}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-slate-600 disabled:opacity-30 shadow-md border border-slate-100"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT: App (MAIN)
// ============================================================================
export default function App() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Tab hiện tại: 'input', 'study', 'unknown', 'known', 'pronunciation'
  const [activeTab, setActiveTab] = useState("input");
  const [deckInput, setDeckInput] = useState("Tất cả");
  const [deckMode, setDeckMode] = useState("select");
  const [wordInput, setWordInput] = useState("");
  const [meaningInput, setMeaningInput] = useState("");
  const [inputMode, setInputMode] = useState("single");
  const [bulkInput, setBulkInput] = useState("");

  // States cho tính năng chỉnh sửa
  const [editingId, setEditingId] = useState(null);
  const [editDeck, setEditDeck] = useState("");
  const [editWord, setEditWord] = useState("");
  const [editMeaning, setEditMeaning] = useState("");

  // Link Web App Google Sheets cứng
  const SHEET_URL =
    "https://script.google.com/macros/s/AKfycbzSdEuvkL9I_zSN8SeCm71gm4LXEd9uzKXkrNz_9vBscVvvfyZwXNsCdxe4jpLDEdAo/exec";
  const [syncStatus, setSyncStatus] = useState("idle"); // 'idle', 'syncing', 'success', 'error'

  // Danh sách các chủ đề do người dùng tự tạo
  const [customDecks, setCustomDecks] = useState([]);

  // Lấy danh sách các chủ đề hiện có
  const existingDecks = Array.from(
    new Set([
      "Tất cả",
      "Chung",
      ...customDecks,
      ...cards.map((c) => c.deck || "Chung"),
    ]),
  );

  // Hàm kiểm tra thẻ có thuộc chủ đề đang chọn không
  const isCardInCurrentDeck = (card) =>
    deckInput === "Tất cả" || (card.deck || "Chung") === deckInput;

  // --- TẢI DỮ LIỆU TỪ GOOGLE SHEETS LÚC KHỞI ĐỘNG ---
  useEffect(() => {
    const loadDataFromSheets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(SHEET_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: JSON.stringify({ action: "load" }),
          redirect: "follow",
        });

        if (!response.ok) {
          throw new Error("Lỗi HTTP: " + response.status);
        }

        const result = await response.json();
        if (result.status === "success" && result.cards) {
          // Ép kiểu tất cả về chuỗi (String) để đảm bảo không bị lỗi hiển thị định dạng từ file
          const safeCards = result.cards.map((c) => ({
            ...c,
            id: String(c.id || ""),
            word: String(c.word || ""),
            meaning: String(c.meaning || ""),
            deck: String(c.deck || "Chung"),
            status: String(c.status || "new"),
          }));
          setCards(safeCards);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        alert(
          "Lỗi kết nối Google Sheets (Failed to fetch).\n\n1. Hãy đảm bảo bạn đã tạo 'Trình triển khai mới' (New deployment) trên Apps Script sau khi đổi code.\n2. Quyền truy cập (Who has access) phải là 'Anyone' (Bất kỳ ai).",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDataFromSheets();
  }, []);

  // --- CHỨC NĂNG EXPORT VÀ SYNC ---
  const exportToCSV = () => {
    if (cards.length === 0) {
      alert("Không có từ vựng nào để xuất!");
      return;
    }

    // Tiêu đề cột
    const headers = ["ID", "Từ vựng", "Nghĩa", "Chủ đề", "Trạng thái"];

    // Định dạng dữ liệu (Escape dấu nháy kép cho đúng chuẩn CSV)
    const csvData = cards.map((card) => {
      const escapeCSV = (str) => `"${String(str || "").replace(/"/g, '""')}"`;
      return [
        escapeCSV(card.id),
        escapeCSV(card.word),
        escapeCSV(card.meaning),
        escapeCSV(card.deck || "Chung"),
        escapeCSV(card.status),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvData].join("\n");

    // Thêm BOM (Byte Order Mark) để Excel/Google Sheets đọc tiếng Việt không bị lỗi font
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `FlashLearn_TuVung_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hàm đồng bộ dữ liệu TỰ KÍCH HOẠT (Manual Sync triggered by specific actions)
  const syncDataToSheets = async (dataToSync) => {
    setSyncStatus("syncing");

    try {
      // Tiền xử lý: Ép Google Sheets hiểu dữ liệu là chuỗi (Text) thuần túy bằng cách thêm dấu nháy đơn (')
      const safeDataToSync = dataToSync.map((card) => ({
        ...card,
        word: card.word ? `'${card.word}` : "",
        meaning: card.meaning ? `'${card.meaning}` : "",
        deck: card.deck ? `'${card.deck}` : "'Chung",
      }));

      const response = await fetch(SHEET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({ action: "sync", cards: safeDataToSync }),
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error("Lỗi HTTP: " + response.status);
      }

      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000); // Ẩn thông báo sau 3s
    } catch (error) {
      console.error(error);
      setSyncStatus("error");
    }
  };

  // --- CHỨC NĂNG THÊM TỪ VỰNG (INPUT) ---
  const handleAddCard = (e) => {
    e.preventDefault();
    if (!wordInput.trim() || !meaningInput.trim()) return;

    const targetDeck =
      deckInput === "Tất cả" ? "Chung" : deckInput.trim() || "Chung";

    const newCard = {
      id: Date.now().toString(),
      word: wordInput.trim(),
      meaning: meaningInput.trim(),
      status: "new",
      deck: targetDeck,
    };

    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    syncDataToSheets(updatedCards); // Lưu lên sheet ngay lập tức

    setWordInput("");
    setMeaningInput("");
  };

  const handleBulkAddCard = (e) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    const lines = bulkInput.split("\n");
    const newCards = [];
    const targetDeck =
      deckInput === "Tất cả" ? "Chung" : deckInput.trim() || "Chung";

    lines.forEach((line, index) => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        const word = parts[0].trim();
        const meaning = parts.slice(1).join(":").trim();

        if (word && meaning) {
          newCards.push({
            id: Date.now().toString() + "-" + index,
            word: word,
            meaning: meaning,
            status: "new",
            deck: targetDeck,
          });
        }
      }
    });

    if (newCards.length > 0) {
      const updatedCards = [...cards, ...newCards];
      setCards(updatedCards);
      syncDataToSheets(updatedCards); // Lưu lên sheet ngay lập tức
      setBulkInput("");
    }
  };

  // Hàm thêm thẻ từ PronunciationCoach
  const handleSaveFromCoach = (word, meaning, deck) => {
    const newCard = {
      id: Date.now().toString(),
      word: word.trim(),
      meaning: meaning.trim(),
      status: "new",
      deck: deck || "Chung",
    };
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    syncDataToSheets(updatedCards);
  };

  const handleDeleteCard = (id) => {
    const updatedCards = cards.filter((c) => c.id !== id);
    setCards(updatedCards);
    syncDataToSheets(updatedCards); // Đồng bộ sự thay đổi (xóa) lên Sheet
  };

  const handleStartEdit = (card) => {
    setEditingId(card.id);
    setEditDeck(card.deck || "Chung");
    setEditWord(card.word);
    setEditMeaning(card.meaning);
  };

  const handleSaveEdit = (id) => {
    if (!editWord.trim() || !editMeaning.trim()) return;
    let newDeck = editDeck.trim();
    if (!newDeck || newDeck === "Tất cả") newDeck = "Chung";

    const updatedCards = cards.map((c) =>
      c.id === id
        ? {
            ...c,
            deck: newDeck,
            word: editWord.trim(),
            meaning: editMeaning.trim(),
          }
        : c,
    );

    setCards(updatedCards);
    syncDataToSheets(updatedCards); // Đồng bộ sự thay đổi (sửa) lên Sheet
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // --- CHỨC NĂNG HỌC TẬP (STUDY) ---
  const [studyQueue, setStudyQueue] = useState([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  useEffect(() => {
    if (activeTab === "study") {
      const cardsToStudy = cards.filter(
        (c) =>
          (c.status === "new" || c.status === "unknown") &&
          isCardInCurrentDeck(c),
      );
      setStudyQueue(cardsToStudy.sort(() => Math.random() - 0.5));
      setIsFlipped(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, deckInput]);

  const currentCard = studyQueue[0];

  const speakWord = (text) => {
    if ("speechSynthesis" in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }, 50);
    }
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSwipeAction = (action) => {
    if (!currentCard) return;

    const newStatus = action === "known" ? "known" : "unknown";

    const updatedCards = cards.map((c) =>
      c.id === currentCard.id ? { ...c, status: newStatus } : c,
    );

    setCards(updatedCards);
    syncDataToSheets(updatedCards); // Cập nhật trạng thái học lên Sheet

    setStudyQueue((prevQueue) => prevQueue.slice(1));
    setIsFlipped(false);
    setSwipeOffset(0);
  };

  const handleDragStart = (clientX) => {
    setStartX(clientX);
    setIsDragging(true);
    setSwipeOffset(0);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    const deltaX = clientX - startX;
    setSwipeOffset(deltaX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (swipeOffset > 100) {
      handleSwipeAction("known");
    } else if (swipeOffset < -100) {
      handleSwipeAction("unknown");
    } else {
      if (Math.abs(swipeOffset) < 10) {
        handleCardClick();
      }
      setSwipeOffset(0);
    }
  };

  // --- COMPONENT SELECT CHỦ ĐỀ CHUNG CHO CÁC TAB ---
  const DeckFilter = () => (
    <div className="mb-4">
      <select
        value={deckInput}
        onChange={(e) => setDeckInput(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm text-slate-700 font-medium shadow-sm"
      >
        {existingDecks.map((deck) => (
          <option key={deck} value={deck}>
            {deck}
          </option>
        ))}
      </select>
    </div>
  );

  // --- RENDER GIAO DIỆN ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-blue-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">
          Đang tải dữ liệu...
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          Đang kết nối với Google Sheets
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4 mb-6 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-600 flex items-center gap-2">
          <BookOpen className="w-6 h-6" /> FlashLearn
        </h1>
        {/* Nhóm Nút Export & Trạng thái Sync */}
        <div className="flex items-center gap-3">
          {/* Trạng thái đồng bộ */}
          <div className="flex items-center text-xs font-medium">
            {syncStatus === "syncing" && (
              <span className="text-blue-500 flex items-center gap-1 animate-pulse">
                <CloudUpload className="w-4 h-4" /> Đang lưu...
              </span>
            )}
            {syncStatus === "success" && (
              <span className="text-green-500 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Đã lưu
              </span>
            )}
            {syncStatus === "error" && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Lỗi lưu
              </span>
            )}
          </div>

          <button
            onClick={exportToCSV}
            className="p-2 text-slate-500 hover:bg-slate-100 hover:text-green-600 rounded-full transition-colors bg-slate-50"
            title="Xuất file CSV"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4">
        {/* --- TAB: QUẢN LÝ TỪ (INPUT) --- */}
        {activeTab === "input" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
              <h2 className="text-lg font-bold mb-4">Thêm Flashcard</h2>

              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-500 mb-1">
                  Chủ đề / Nhóm từ đang chọn
                </label>
                {deckMode === "select" ? (
                  <select
                    value={deckInput}
                    onChange={(e) => {
                      if (e.target.value === "___NEW___") {
                        setDeckMode("new");
                        setDeckInput("");
                      } else {
                        setDeckInput(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none cursor-pointer"
                  >
                    {existingDecks.map((deck) => (
                      <option key={deck} value={deck}>
                        {deck}
                      </option>
                    ))}
                    <option
                      value="___NEW___"
                      className="font-bold text-blue-600"
                    >
                      + Tạo chủ đề mới...
                    </option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={deckInput}
                      onChange={(e) => setDeckInput(e.target.value)}
                      placeholder="Nhập tên chủ đề mới..."
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newDeck = deckInput.trim();
                        if (!newDeck || newDeck === "Tất cả") {
                          setDeckInput("Tất cả");
                        } else if (
                          !customDecks.includes(newDeck) &&
                          newDeck !== "Chung"
                        ) {
                          setCustomDecks([...customDecks, newDeck]);
                        }
                        setDeckMode("select");
                      }}
                      className="px-4 py-3 bg-blue-100 text-blue-600 rounded-xl font-medium hover:bg-blue-200 transition-colors"
                    >
                      Xong
                    </button>
                  </div>
                )}
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    inputMode === "single"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setInputMode("single")}
                >
                  Từng từ một
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    inputMode === "bulk"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setInputMode("bulk")}
                >
                  Hàng loạt
                </button>
              </div>

              {inputMode === "single" ? (
                <form onSubmit={handleAddCard} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">
                      Từ vựng
                    </label>
                    <input
                      type="text"
                      value={wordInput}
                      onChange={(e) => setWordInput(e.target.value)}
                      placeholder="VD: Apple"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-shadow outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">
                      Nghĩa của từ
                    </label>
                    <textarea
                      value={meaningInput}
                      onChange={(e) => setMeaningInput(e.target.value)}
                      placeholder="VD: Quả táo"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-shadow outline-none resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Thêm từ
                  </button>
                </form>
              ) : (
                <form onSubmit={handleBulkAddCard} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">
                      Nhập danh sách từ
                    </label>
                    <p className="text-xs text-slate-400 mb-2">
                      Định dạng:{" "}
                      <code className="bg-slate-100 px-1 rounded text-blue-500">
                        từ vựng : nghĩa
                      </code>{" "}
                      (mỗi từ 1 dòng)
                    </p>
                    <textarea
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      placeholder="Apple : Quả táo&#10;Banana : Quả chuối&#10;Cat : Con mèo"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-shadow outline-none min-h-[150px] resize-y leading-relaxed"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Thêm danh sách
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end px-1 mb-2">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Danh sách: {deckInput}
                </h3>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                  {cards.filter((c) => isCardInCurrentDeck(c)).length} từ
                </span>
              </div>

              {cards.filter((c) => isCardInCurrentDeck(c)).length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-white rounded-xl shadow-sm border border-slate-100">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Chưa có từ vựng nào trong chủ đề này.</p>
                </div>
              ) : (
                cards
                  .filter((c) => isCardInCurrentDeck(c))
                  .map((card) => (
                    <div
                      key={card.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center group"
                    >
                      {editingId === card.id ? (
                        <div className="w-full flex items-center gap-2">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={editDeck}
                              onChange={(e) => setEditDeck(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-bold"
                              placeholder="Chủ đề"
                            />
                            <input
                              type="text"
                              value={editWord}
                              onChange={(e) => setEditWord(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              placeholder="Từ vựng"
                            />
                            <textarea
                              value={editMeaning}
                              onChange={(e) => setEditMeaning(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                              placeholder="Nghĩa"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleSaveEdit(card.id)}
                              className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                              title="Lưu"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                              title="Hủy"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0 pr-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-500 uppercase tracking-wider mb-1">
                              <Tag className="w-3 h-3" />
                              {card.deck || "Chung"}
                            </span>
                            <p className="font-bold text-lg truncate">
                              {card.word}
                            </p>
                            <p className="text-slate-500 line-clamp-2">
                              {card.meaning}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(card);
                              }}
                              className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Sửa"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCard(card.id);
                              }}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* --- TAB: HỌC TẬP (STUDY) --- */}
        {activeTab === "study" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col items-center">
            <DeckFilter />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 text-center">
              <span className="text-xs font-normal">
                Đang học: {studyQueue.length} từ
              </span>
            </h2>

            {!currentCard ? (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center w-full mt-4">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tuyệt vời!</h3>
                <p className="text-slate-500 mb-6">
                  Bạn đã ôn tập xong các từ trong chủ đề này.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setActiveTab("unknown")}
                    className="px-6 py-2 bg-red-50 text-red-600 font-medium rounded-full hover:bg-red-100 transition-colors"
                  >
                    Xem các từ chưa thuộc
                  </button>
                  <button
                    onClick={() => setActiveTab("known")}
                    className="px-6 py-2 bg-blue-50 text-blue-600 font-medium rounded-full hover:bg-blue-100 transition-colors"
                  >
                    Xem các từ đã thuộc
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {/* Flashcard Component */}
                <div
                  className="relative w-full aspect-[4/3] max-w-sm cursor-pointer select-none [perspective:1000px] mb-8 touch-pan-y"
                  onMouseDown={(e) => handleDragStart(e.clientX)}
                  onMouseMove={(e) => handleDragMove(e.clientX)}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                  onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                  onTouchEnd={handleDragEnd}
                  style={{
                    transform: `translateX(${swipeOffset}px) rotate(${
                      swipeOffset * 0.05
                    }deg)`,
                    transition: isDragging ? "none" : "transform 0.3s ease-out",
                  }}
                >
                  <div
                    className={`w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${
                      isFlipped ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    <div className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center p-6 pb-5 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:translateZ(1px)] [-webkit-transform:translateZ(1px)]">
                      <div className="flex-1 w-full overflow-y-auto flex flex-col items-center min-h-0 mb-4 px-2 py-4 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:translateZ(0)] [-webkit-transform:translateZ(0)]">
                        <p className="my-auto text-3xl font-bold text-slate-800 text-center select-none w-full break-words whitespace-pre-wrap">
                          {currentCard.word}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          speakWord(currentCard.word);
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        className="shrink-0 mb-4 p-5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-500 rounded-full transition-all cursor-pointer flex items-center justify-center border border-blue-100 shadow-sm [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:translateZ(0)] [-webkit-transform:translateZ(0)]"
                        title="Phát âm"
                      >
                        <Volume2 className="w-8 h-8 animate-pulse" />
                      </button>
                      <p className="text-sm text-slate-400 shrink-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:translateZ(0)] [-webkit-transform:translateZ(0)]">
                        Chạm vùng trống để xem nghĩa
                      </p>
                    </div>

                    <div className="absolute inset-0 w-full h-full bg-blue-600 rounded-3xl shadow-lg border border-blue-500 flex flex-col items-center p-6 [transform:rotateY(180deg)_translateZ(1px)] [-webkit-transform:rotateY(180deg)_translateZ(1px)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                      <div className="flex-1 w-full overflow-y-auto flex flex-col items-center min-h-0 px-2 py-4 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:translateZ(0)] [-webkit-transform:translateZ(0)]">
                        <p className="my-auto text-2xl font-medium text-white text-center select-none w-full break-words whitespace-pre-wrap">
                          {currentCard.meaning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Các nút bấm hành động */}
                <div className="flex justify-center gap-6 w-full max-w-sm px-4">
                  <button
                    onClick={() => handleSwipeAction("unknown")}
                    className="flex-1 flex flex-col items-center justify-center py-4 bg-white border-2 border-red-100 rounded-2xl hover:bg-red-50 text-red-500 transition-colors shadow-sm"
                  >
                    <X className="w-8 h-8 mb-1" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Chưa thuộc
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      (Vuốt trái)
                    </span>
                  </button>

                  <button
                    onClick={() => handleSwipeAction("known")}
                    className="flex-1 flex flex-col items-center justify-center py-4 bg-white border-2 border-green-100 rounded-2xl hover:bg-green-50 text-green-500 transition-colors shadow-sm"
                  >
                    <Check className="w-8 h-8 mb-1" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Đã thuộc
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      (Vuốt phải)
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: TỪ CHƯA BIẾT (UNKNOWN LIST) --- */}
        {activeTab === "unknown" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <DeckFilter />
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-lg font-bold text-red-500 flex items-center gap-2">
                  <X className="w-5 h-5" /> Cần học lại
                </h2>
              </div>
              {cards.filter(
                (c) => c.status === "unknown" && isCardInCurrentDeck(c),
              ).length > 0 && (
                <button
                  onClick={() => {
                    const updatedCards = cards.map((c) =>
                      c.status === "unknown" && isCardInCurrentDeck(c)
                        ? { ...c, status: "new" }
                        : c,
                    );
                    setCards(updatedCards);
                    syncDataToSheets(updatedCards);
                    setActiveTab("study");
                  }}
                  className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Học lại tất cả
                </button>
              )}
            </div>

            <div className="space-y-3">
              {cards.filter(
                (c) => c.status === "unknown" && isCardInCurrentDeck(c),
              ).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <List className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500">Trống! Bạn đang học rất tốt.</p>
                </div>
              ) : (
                cards
                  .filter(
                    (c) => c.status === "unknown" && isCardInCurrentDeck(c),
                  )
                  .map((card) => (
                    <div
                      key={card.id}
                      className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-red-400 flex justify-between items-center group"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-500 uppercase tracking-wider mb-1">
                          <Tag className="w-3 h-3" />
                          {card.deck || "Chung"}
                        </span>
                        <p className="font-bold text-lg text-slate-800 flex items-center gap-2 truncate">
                          <span className="truncate">{card.word}</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              speakWord(card.word);
                            }}
                            className="text-slate-300 hover:text-blue-500 shrink-0 p-2"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </p>
                        <p className="text-slate-500 truncate">
                          {card.meaning}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => {
                            const updatedCards = cards.map((c) =>
                              c.id === card.id ? { ...c, status: "new" } : c,
                            );
                            setCards(updatedCards);
                            syncDataToSheets(updatedCards);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Học lại từ này"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            const updatedCards = cards.map((c) =>
                              c.id === card.id ? { ...c, status: "known" } : c,
                            );
                            setCards(updatedCards);
                            syncDataToSheets(updatedCards);
                          }}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          title="Đánh dấu đã thuộc"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* --- TAB: TỪ ĐÃ THUỘC (KNOWN LIST) --- */}
        {activeTab === "known" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <DeckFilter />
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-lg font-bold text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Đã thuộc
                </h2>
              </div>
              {cards.filter(
                (c) => c.status === "known" && isCardInCurrentDeck(c),
              ).length > 0 && (
                <button
                  onClick={() => {
                    const updatedCards = cards.map((c) =>
                      c.status === "known" && isCardInCurrentDeck(c)
                        ? { ...c, status: "new" }
                        : c,
                    );
                    setCards(updatedCards);
                    syncDataToSheets(updatedCards);
                    setActiveTab("study");
                  }}
                  className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Học lại tất cả
                </button>
              )}
            </div>

            <div className="space-y-3">
              {cards.filter(
                (c) => c.status === "known" && isCardInCurrentDeck(c),
              ).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500">
                    Chưa có từ nào được đánh dấu là đã thuộc.
                  </p>
                </div>
              ) : (
                cards
                  .filter((c) => c.status === "known" && isCardInCurrentDeck(c))
                  .map((card) => (
                    <div
                      key={card.id}
                      className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-green-400 flex justify-between items-center group"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-500 uppercase tracking-wider mb-1">
                          <Tag className="w-3 h-3" />
                          {card.deck || "Chung"}
                        </span>
                        <p className="font-bold text-lg text-slate-800 flex items-center gap-2 truncate">
                          <span className="truncate">{card.word}</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              speakWord(card.word);
                            }}
                            className="text-slate-300 hover:text-blue-500 shrink-0 p-2"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </p>
                        <p className="text-slate-500 truncate">
                          {card.meaning}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <button
                          onClick={() => {
                            const updatedCards = cards.map((c) =>
                              c.id === card.id ? { ...c, status: "new" } : c,
                            );
                            setCards(updatedCards);
                            syncDataToSheets(updatedCards);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Học lại từ này"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* --- TAB: PRONUNCIATION COACH --- */}
        {activeTab === "pronunciation" && (
          <PronunciationCoach
            onAddFlashcard={handleSaveFromCoach}
            existingDecks={existingDecks}
          />
        )}
      </main>

      {/* --- BOTTOM NAVIGATION BAR --- */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-between px-1 items-center pb-safe z-20">
        <button
          onClick={() => setActiveTab("input")}
          className={`flex-1 flex flex-col items-center py-2.5 ${
            activeTab === "input"
              ? "text-blue-600 font-bold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Plus className="w-5 h-5 mb-1" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-center line-clamp-1">
            Thêm từ
          </span>
        </button>
        <button
          onClick={() => setActiveTab("study")}
          className={`flex-1 flex flex-col items-center py-2.5 ${
            activeTab === "study"
              ? "text-blue-600 font-bold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <BookOpen className="w-5 h-5 mb-1" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-center line-clamp-1">
            Học bài
          </span>
        </button>
        <button
          onClick={() => setActiveTab("unknown")}
          className={`flex-1 flex flex-col items-center py-2.5 relative ${
            activeTab === "unknown"
              ? "text-red-500 font-bold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <div className="relative">
            <List className="w-5 h-5 mb-1" />
            {cards.filter((c) => c.status === "unknown").length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-center line-clamp-1">
            Chưa thuộc
          </span>
        </button>
        <button
          onClick={() => setActiveTab("known")}
          className={`flex-1 flex flex-col items-center py-2.5 relative ${
            activeTab === "known"
              ? "text-green-500 font-bold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <CheckCircle className="w-5 h-5 mb-1" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-center line-clamp-1">
            Đã thuộc
          </span>
        </button>

        {/* NÚT TAB MỚI: PHÁT ÂM */}
        <button
          onClick={() => setActiveTab("pronunciation")}
          className={`flex-1 flex flex-col items-center py-2.5 relative ${
            activeTab === "pronunciation"
              ? "text-blue-600 font-bold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Mic className="w-5 h-5 mb-1" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-center line-clamp-1">
            Phát âm
          </span>
        </button>
      </nav>
    </div>
  );
}
