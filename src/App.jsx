import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
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
  Search,
  Trophy,
} from "lucide-react";

// ============================================================================
// SUPABASE CLIENT
// ============================================================================
const supabase = createClient(
  "https://qrufhskmxcuowavwokau.supabase.co",
  "sb_publishable_1ET0n4As5q6kN0N3fRDfVA_sgw0uAPK",
);

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
  const accumulatedTranscriptRef = useRef("");
  const sessionTranscriptRef = useRef("");
  const isRecordingRef = useRef(false);
  const isManualStopRef = useRef(false);
  const shouldKeepListeningRef = useRef(false);
  const restartTimerRef = useRef(null);

  // Ref để lưu câu hiện tại, giúp SpeechRecognition (chỉ khởi tạo 1 lần) luôn truy cập được câu mới nhất
  const targetSentenceRef = useRef("");

  useEffect(() => {
    targetSentenceRef.current = sentences[currentIndex];
  }, [sentences, currentIndex]);

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
    spokenTextRef.current = "";
    accumulatedTranscriptRef.current = "";
    sessionTranscriptRef.current = "";
  };

  // Khởi tạo SpeechRecognition CHỈ 1 LẦN để tránh treo micro trên Mobile
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    // FIX: Đổi continuous thành false. Mobile browser sẽ tự ngắt ghi âm khi người dùng ngừng nói.
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      sessionTranscriptRef.current = "";
      setAnalysisResult(null);
      setSelectedWord(null);
      setErrorMsg("");
      setIsRecording(true);
      isRecordingRef.current = true;
    };

    recognition.onresult = (event) => {
      let sessionTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        sessionTranscript += event.results[i][0].transcript;
      }
      sessionTranscriptRef.current = sessionTranscript;
      const fullTranscript =
        `${accumulatedTranscriptRef.current} ${sessionTranscript}`.trim();
      setSpokenText(fullTranscript);
      spokenTextRef.current = fullTranscript;
    };

    recognition.onend = () => {
      const targetSentence = targetSentenceRef.current;
      const shouldAnalyze = isManualStopRef.current;
      const shouldRestart = shouldKeepListeningRef.current && !shouldAnalyze;

      if (shouldRestart) {
        accumulatedTranscriptRef.current = spokenTextRef.current || "";
        restartTimerRef.current = window.setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.error("Mic restart error", error);
            setIsRecording(false);
            isRecordingRef.current = false;
          }
        }, 120);
        return;
      }

      setIsRecording(false);
      isRecordingRef.current = false;
      shouldKeepListeningRef.current = false;
      isManualStopRef.current = false;

      if (shouldAnalyze && spokenTextRef.current?.trim() && targetSentence) {
        analyzePronunciation(targetSentence, spokenTextRef.current);
      }
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      isRecordingRef.current = false;

      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        shouldKeepListeningRef.current = false;
        setErrorMsg(
          "Chưa cấp quyền micro hoặc trình duyệt không hỗ trợ. Hãy mở bằng Chrome/Safari gốc (đừng mở trực tiếp từ Zalo/Messenger).",
        );
      } else if (event.error === "no-speech") {
        if (!shouldKeepListeningRef.current) {
          setErrorMsg("Chưa nghe thấy âm thanh. Vui lòng thử lại.");
        }
      } else if (event.error === "network") {
        shouldKeepListeningRef.current = false;
        setErrorMsg("Lỗi mạng. Cần có internet để nhận diện giọng nói.");
      } else if (event.error !== "aborted") {
        shouldKeepListeningRef.current = false;
        setErrorMsg(`Lỗi micro: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []); // Array rỗng -> Chỉ chạy 1 lần khi mount

  const toggleRecording = () => {
    if (!browserSupported) {
      setErrorMsg("Trình duyệt không hỗ trợ nhận diện giọng nói.");
      return;
    }
    if (!recognitionRef.current) return;

    if (isRecording) {
      isManualStopRef.current = true;
      shouldKeepListeningRef.current = false;
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }
      recognitionRef.current.stop(); // Tự động kích hoạt onend
    } else {
      isManualStopRef.current = false;
      shouldKeepListeningRef.current = true;
      setSpokenText("");
      spokenTextRef.current = "";
      accumulatedTranscriptRef.current = "";
      sessionTranscriptRef.current = "";
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

    // Đảm bảo setAnalysisResult chạy ổn định
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
              {spokenText?.trim() && (
                <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Hệ thống nghe được
                  </p>
                  <p className="text-sm font-medium leading-relaxed text-slate-700">
                    “{spokenText}”
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {(isRecording || errorMsg) && (
          <div className="absolute bottom-0 left-0 w-full bg-slate-50 p-4 border-t border-slate-100 flex flex-col items-center">
            {errorMsg ? (
              <p className="text-red-500 text-xs font-medium flex items-center gap-2 text-center">
                <AlertCircle size={16} className="shrink-0" /> {errorMsg}
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
// HELPER
// ============================================================================
const shuffleArr = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ============================================================================
// COMPONENT: QuizGame
// ============================================================================
const QuizGame = ({ cards, onClose }) => {
  const maxWords = Math.min(cards.length, 50);
  const minWords = Math.min(5, cards.length);

  const [phase, setPhase] = useState("setup");
  const [wordCount, setWordCount] = useState(Math.min(10, cards.length));
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const startGame = () => {
    const pool = shuffleArr(cards.filter((c) => c.status === "known")).slice(0, wordCount);

    const qs = pool.map((card) => {
      const distractors = shuffleArr(cards.filter((c) => c.id !== card.id))
        .slice(0, 3)
        .map((c) => c.word);
      return {
        meaning: card.meaning,
        correct: card.word,
        options: shuffleArr([card.word, ...distractors]),
      };
    });

    setQuestions(qs);
    setCurrentIdx(0);
    setScore(0);
    setSelected(null);
    setShowFeedback(false);
    setPhase("playing");
  };

  const handleSelect = (option) => {
    if (showFeedback) return;
    setSelected(option);
    setShowFeedback(true);
    if (option === questions[currentIdx].correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        setPhase("result");
      } else {
        setCurrentIdx((i) => i + 1);
        setSelected(null);
        setShowFeedback(false);
      }
    }, 1200);
  };

  if (phase === "setup") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
        <div className="text-5xl">❓</div>
        <h2 className="text-2xl font-bold text-slate-800">Kiểm tra</h2>
        <p className="text-slate-500 text-sm text-center">
          Xem nghĩa tiếng Việt, chọn từ tiếng Anh đúng
        </p>

        <div className="w-full max-w-xs">
          <label className="text-sm font-medium text-slate-600 mb-2 block">
            Số từ mỗi lượt:{" "}
            <span className="text-blue-600 font-bold">{wordCount}</span>
          </label>
          <input
            type="range"
            min={minWords}
            max={maxWords}
            value={wordCount}
            onChange={(e) => setWordCount(+e.target.value)}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{minWords}</span>
            <span>{maxWords}</span>
          </div>
        </div>

        {cards.length < 4 ? (
          <p className="text-sm text-red-500">Cần ít nhất 4 từ để chơi.</p>
        ) : (
          <button
            onClick={startGame}
            className="w-full max-w-xs py-3 bg-blue-600 text-white font-bold rounded-2xl text-lg active:scale-95 transition-transform"
          >
            Bắt đầu
          </button>
        )}
        <button onClick={onClose} className="text-slate-400 text-sm underline">
          Quay lại
        </button>
      </div>
    );
  }

  if (phase === "result") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 px-6">
        <div className="text-6xl">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}</div>
        <h2 className="text-2xl font-bold text-slate-800">Kết quả</h2>
        <div className="bg-blue-50 rounded-3xl px-10 py-6 text-center">
          <p className="text-5xl font-bold text-blue-600">
            {score}/{questions.length}
          </p>
          <p className="text-slate-500 mt-1">{pct}% chính xác</p>
        </div>
        <button
          onClick={startGame}
          className="w-full max-w-xs py-3 bg-blue-600 text-white font-bold rounded-2xl text-lg active:scale-95 transition-transform"
        >
          Chơi lại
        </button>
        <button onClick={onClose} className="text-slate-400 text-sm underline">
          Quay lại
        </button>
      </div>
    );
  }

  const q = questions[currentIdx];
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <div className="flex justify-between items-center text-sm mb-2">
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-500">
            Câu {currentIdx + 1}/{questions.length}
          </span>
          <span className="text-blue-600 font-bold">{score} đúng</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${(currentIdx / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
        <div className="bg-slate-50 rounded-3xl p-7 text-center shadow-sm min-h-[120px] flex items-center justify-center">
          <p className="text-xl font-bold text-slate-800 leading-relaxed">
            {q.meaning}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-3 text-center">
            Chọn đáp án đúng
          </p>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              let cls =
                "p-4 rounded-2xl border-2 text-sm font-medium text-center transition-all active:scale-95 min-h-[72px] flex items-center justify-center ";
              if (!showFeedback) {
                cls +=
                  "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50";
              } else if (opt === q.correct) {
                cls += "border-green-500 bg-green-50 text-green-700";
              } else if (opt === selected) {
                cls += "border-red-400 bg-red-50 text-red-600";
              } else {
                cls += "border-slate-100 bg-slate-50 text-slate-400";
              }
              return (
                <button key={i} onClick={() => handleSelect(opt)} className={cls}>
                  <span className="line-clamp-2 leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {!showFeedback && (
          <button
            onClick={() => handleSelect("__skip__")}
            className="text-slate-400 text-sm underline self-center"
          >
            Bạn không biết?
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT: MatchGame
// ============================================================================
const MatchGame = ({ cards, onClose }) => {
  const PAIRS = Math.min(5, cards.length);
  const COUNTDOWN = 15;
  const sessionQueueRef = useRef(null);
  const timerRef = useRef(null);

  const [tiles, setTiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [wrongPair, setWrongPair] = useState(null);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [time, setTime] = useState(COUNTDOWN);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [phase, setPhase] = useState("playing");
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN);

  const buildQueue = () => {
    return shuffleArr(cards.filter((c) => c.status === "known"));
  };

  const startRound = (queue) => {
    const pairsCount = Math.min(PAIRS, queue.length);
    const batch = queue.slice(0, pairsCount);
    const newTiles = shuffleArr(
      batch.flatMap((card, i) => [
        { id: `w${i}`, type: "word", text: card.word, pairId: i },
        { id: `m${i}`, type: "meaning", text: card.meaning, pairId: i },
      ]),
    );
    setTiles(newTiles);
    setMatchedIds(new Set());
    setSelected(null);
    setWrongPair(null);
    setTime(COUNTDOWN);
    setPhase("playing");
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTime((t) => t - 1), 1000);
    return queue.slice(pairsCount);
  };

  useEffect(() => {
    const q = buildQueue();
    const remaining = startRound(q);
    sessionQueueRef.current = remaining;
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (time <= 0 && phase === "playing") {
      clearInterval(timerRef.current);
      setPhase("timeUp");
    }
  }, [time, phase]);

  const handleTile = (idx) => {
    if (wrongPair || phase !== "playing") return;
    const tile = tiles[idx];
    if (matchedIds.has(tile.pairId)) return;
    if (selected === idx) {
      setSelected(null);
      return;
    }
    if (selected === null) {
      setSelected(idx);
      return;
    }

    const selTile = tiles[selected];
    if (selTile.pairId === tile.pairId && selTile.type !== tile.type) {
      const newMatched = new Set(matchedIds);
      newMatched.add(tile.pairId);
      setMatchedIds(newMatched);
      setSelected(null);

      const totalPairs = tiles.length / 2;
      if (newMatched.size >= totalPairs) {
        clearInterval(timerRef.current);
        setTimeLeft(time);
        setRoundsPlayed((r) => r + 1);
        setTimeout(() => setPhase("roundEnd"), 500);
      }
    } else {
      setWrongPair([selected, idx]);
      setTimeout(() => {
        setWrongPair(null);
        setSelected(null);
      }, 700);
    }
  };

  const nextRound = () => {
    let q = sessionQueueRef.current;
    if (!q || q.length === 0) {
      q = buildQueue();
    }
    const remaining = startRound(q);
    sessionQueueRef.current = remaining;
  };

  if (cards.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <p className="text-slate-500">Cần ít nhất 2 từ để chơi.</p>
        <button onClick={onClose} className="text-slate-400 text-sm underline">
          Quay lại
        </button>
      </div>
    );
  }

  if (phase === "timeUp") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 px-6">
        <div className="text-6xl">⏰</div>
        <h2 className="text-2xl font-bold text-red-600">Hết giờ!</h2>
        <p className="text-slate-500 text-center text-sm">
          Bạn chưa ghép xong {tiles.length / 2 - matchedIds.size} cặp còn lại
        </p>
        <button
          onClick={nextRound}
          className="w-full max-w-xs py-3 bg-purple-600 text-white font-bold rounded-2xl text-lg active:scale-95 transition-transform"
        >
          Thử lại vòng này
        </button>
        <button onClick={onClose} className="text-slate-400 text-sm underline">
          Quay lại
        </button>
      </div>
    );
  }

  if (phase === "roundEnd") {
    const hasMore = (sessionQueueRef.current?.length ?? 0) > 0;
    const timeTaken = COUNTDOWN - timeLeft;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 px-6">
        <div className="text-6xl">🎯</div>
        <h2 className="text-xl font-bold text-slate-800">
          Hoàn thành vòng {roundsPlayed}!
        </h2>
        <div className="bg-purple-50 rounded-3xl px-10 py-5 text-center">
          <p className="text-4xl font-bold text-purple-600">{timeTaken}s</p>
          <p className="text-slate-500 text-sm mt-1">hoàn thành · còn {timeLeft}s</p>
        </div>

        {hasMore ? (
          <button
            onClick={nextRound}
            className="w-full max-w-xs py-3 bg-purple-600 text-white font-bold rounded-2xl text-lg active:scale-95 transition-transform"
          >
            Vòng tiếp theo →
          </button>
        ) : (
          <>
            <p className="text-slate-400 text-sm text-center">
              Đã ôn hết tất cả từ! Bắt đầu lại?
            </p>
            <button
              onClick={() => {
                setRoundsPlayed(0);
                const q = buildQueue();
                const remaining = startRound(q);
                sessionQueueRef.current = remaining;
              }}
              className="w-full max-w-xs py-3 bg-purple-600 text-white font-bold rounded-2xl text-lg active:scale-95 transition-transform"
            >
              Chơi lại
            </button>
          </>
        )}
        <button onClick={onClose} className="text-slate-400 text-sm underline">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className={`font-mono text-xl font-bold transition-colors ${time <= 5 ? "text-red-500 animate-pulse" : "text-slate-700"}`}>
          {time}s
        </div>
        <div className="text-sm text-slate-400">Vòng {roundsPlayed + 1}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 flex-1 content-start">
        {tiles.map((tile, idx) => {
          const isMatched = matchedIds.has(tile.pairId);
          const isSelected = selected === idx;
          const isWrong = wrongPair?.includes(idx);

          if (isMatched) {
            return <div key={tile.id} className="aspect-[4/3] rounded-2xl" />;
          }

          let cls =
            "aspect-[4/3] rounded-2xl border-2 flex items-center justify-center p-3 text-center text-sm font-medium cursor-pointer transition-all active:scale-95 ";
          if (isWrong) cls += "border-red-400 bg-red-50 text-red-600";
          else if (isSelected)
            cls += "border-blue-500 bg-blue-50 text-blue-700 scale-[0.97]";
          else
            cls +=
              "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50";

          return (
            <button
              key={tile.id}
              onClick={() => handleTile(idx)}
              className={cls}
            >
              <span className="line-clamp-3 leading-snug">{tile.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT: GameTab (màn hình chọn trò chơi)
// ============================================================================
const GameTab = ({ cards, deckInput, existingDecks, onDeckChange }) => {
  const [activeGame, setActiveGame] = useState(null);

  const deckCards =
    deckInput === "Tất cả"
      ? cards
      : cards.filter((c) => (c.deck || "Chung") === deckInput);

  const knownCards = deckCards.filter((c) => c.status === "known");

  if (activeGame === "quiz")
    return <QuizGame cards={knownCards} onClose={() => setActiveGame(null)} />;
  if (activeGame === "match")
    return <MatchGame cards={knownCards} onClose={() => setActiveGame(null)} />;

  return (
    <div className="p-4 flex flex-col gap-5">
      <h2 className="text-xl font-bold text-slate-800">Trò chơi</h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {existingDecks.map((d) => (
          <button
            key={d}
            onClick={() => onDeckChange(d)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              deckInput === d
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500">
        <strong className="text-green-600">{knownCards.length}</strong> từ đã thuộc
        {" "}/ {deckCards.length} từ trong chủ đề{" "}
        <strong className="text-slate-700">{deckInput}</strong>
      </p>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => setActiveGame("quiz")}
          disabled={knownCards.length < 4}
          className="w-full p-5 rounded-3xl text-left text-white bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <div className="text-3xl mb-2">❓</div>
          <p className="text-lg font-bold">Kiểm tra</p>
          <p className="text-blue-100 text-sm mt-0.5">
            Xem nghĩa → Chọn từ đúng trong 4 đáp án
          </p>
          {knownCards.length < 4 && (
            <p className="text-yellow-200 text-xs mt-2">Cần ít nhất 4 từ đã thuộc</p>
          )}
        </button>

        <button
          onClick={() => setActiveGame("match")}
          disabled={knownCards.length < 2}
          className="w-full p-5 rounded-3xl text-left text-white bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-lg font-bold">Ghép thẻ</p>
          <p className="text-violet-100 text-sm mt-0.5">
            Ghép từ với nghĩa · 5 cặp/vòng · Đua thời gian
          </p>
          {knownCards.length < 2 && (
            <p className="text-yellow-200 text-xs mt-2">Cần ít nhất 2 từ đã thuộc</p>
          )}
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
  const [globalMessage, setGlobalMessage] = useState(null); // Thay thế alert
  // Tab hiện tại: 'input', 'study', 'unknown', 'known', 'pronunciation'
  const [activeTab, setActiveTab] = useState("input");
  const [deckInput, setDeckInput] = useState("Tất cả");
  const [deckMode, setDeckMode] = useState("select");
  const [wordInput, setWordInput] = useState("");
  const [meaningInput, setMeaningInput] = useState("");
  const [inputMode, setInputMode] = useState("single");
  const [bulkInput, setBulkInput] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // States cho tính năng chỉnh sửa
  const [editingId, setEditingId] = useState(null);
  const [editDeck, setEditDeck] = useState("");
  const [editWord, setEditWord] = useState("");
  const [editMeaning, setEditMeaning] = useState("");

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

  const normalizedSearchInput = searchInput.trim().toLocaleLowerCase("vi");
  const visibleCards = cards.filter((card) => {
    if (!normalizedSearchInput) return isCardInCurrentDeck(card);

    return [card.word, card.meaning, card.deck].some((value) =>
      String(value || "")
        .toLocaleLowerCase("vi")
        .includes(normalizedSearchInput),
    );
  });

  // --- TẢI DỮ LIỆU TỪ SUPABASE LÚC KHỞI ĐỘNG ---
  useEffect(() => {
    const loadDataFromSupabase = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("cards").select("*").limit(10000);
        if (error) throw error;
        const safeCards = (data || []).map((c) => ({
          ...c,
          id: String(c.id || ""),
          word: String(c.word || ""),
          meaning: String(c.meaning || ""),
          deck: String(c.deck || "Chung"),
          status: String(c.status || "new"),
        }));
        setCards(safeCards);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setGlobalMessage({
          type: "error",
          title: "Lỗi kết nối máy chủ",
          text: "Không thể kết nối đến Supabase. Ứng dụng sẽ chạy tạm thời bằng dữ liệu trống.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDataFromSupabase();
  }, []);

  // --- CHỨC NĂNG EXPORT VÀ SYNC ---
  const exportToCSV = () => {
    if (cards.length === 0) {
      setGlobalMessage({
        type: "warning",
        title: "Dữ liệu trống",
        text: "Không có từ vựng nào để xuất!",
      });
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

  // Hàm đồng bộ dữ liệu lên Supabase
  const syncDataToSheets = async (dataToSync) => {
    setSyncStatus("syncing");
    try {
      // Lấy danh sách ID hiện có trong DB để biết cái nào bị xóa
      const { data: existing } = await supabase.from("cards").select("id");
      const existingIds = new Set((existing || []).map((c) => c.id));
      const currentIds = new Set(dataToSync.map((c) => c.id));
      const toDelete = [...existingIds].filter((id) => !currentIds.has(id));

      // Upsert tất cả card hiện tại (thêm mới hoặc cập nhật)
      if (dataToSync.length > 0) {
        const { error } = await supabase
          .from("cards")
          .upsert(dataToSync, { onConflict: "id" });
        if (error) throw error;
      }

      // Xóa các card đã bị loại bỏ
      if (toDelete.length > 0) {
        const { error } = await supabase
          .from("cards")
          .delete()
          .in("id", toDelete);
        if (error) throw error;
      }

      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
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
  const [isReverseStudy, setIsReverseStudy] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isAdvancingCard, setIsAdvancingCard] = useState(false);
  const advanceTimerRef = useRef(null);
  const STUDY_CARD_ADVANCE_DELAY = 2000;

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setIsAdvancingCard(false);

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
  const frontText = isReverseStudy ? currentCard?.meaning : currentCard?.word;
  const backText = isReverseStudy ? currentCard?.word : currentCard?.meaning;
  const frontIsMeaning = isReverseStudy;
  const backIsWord = isReverseStudy;

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
    if (isAdvancingCard) return;
    setIsFlipped(!isFlipped);
  };

  const handleToggleStudyDirection = () => {
    if (isAdvancingCard) return;
    setIsReverseStudy((prev) => !prev);
    setIsFlipped(false);
    setSwipeOffset(0);
  };

  const handleSwipeAction = (action) => {
    if (!currentCard || advanceTimerRef.current) return;

    const newStatus = action === "known" ? "known" : "unknown";

    const updatedCards = cards.map((c) =>
      c.id === currentCard.id ? { ...c, status: newStatus } : c,
    );

    setCards(updatedCards);
    syncDataToSheets(updatedCards); // Cập nhật trạng thái học lên Sheet

    setIsAdvancingCard(true);
    setSwipeOffset(0);

    advanceTimerRef.current = setTimeout(() => {
      setStudyQueue((prevQueue) => prevQueue.slice(1));
      setIsFlipped(false);
      setSwipeOffset(0);
      setIsAdvancingCard(false);
      advanceTimerRef.current = null;
    }, STUDY_CARD_ADVANCE_DELAY);
  };

  const handleDragStart = (clientX) => {
    if (isAdvancingCard) return;
    setStartX(clientX);
    setIsDragging(true);
    setSwipeOffset(0);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging || isAdvancingCard) return;
    const deltaX = clientX - startX;
    setSwipeOffset(deltaX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    if (isAdvancingCard) {
      setIsDragging(false);
      setSwipeOffset(0);
      return;
    }
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
                  {normalizedSearchInput
                    ? `${visibleCards.length} kết quả`
                    : `${visibleCards.length} từ`}
                </span>
              </div>

              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm từ đã nhập..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    title="Xóa tìm kiếm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {visibleCards.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-white rounded-xl shadow-sm border border-slate-100">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>
                    {normalizedSearchInput
                      ? "Chưa tìm thấy từ này trong hệ thống."
                      : "Chưa có từ vựng nào trong chủ đề này."}
                  </p>
                </div>
              ) : (
                visibleCards.map((card) => (
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
            <button
              type="button"
              onClick={handleToggleStudyDirection}
              className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-sm transition-colors ${
                isReverseStudy
                  ? "border-blue-200 bg-blue-600 text-white hover:bg-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              title="Đổi chiều học"
            >
              <RotateCcw className="w-4 h-4" />
              {isReverseStudy ? "Nghĩa -> Từ" : "Từ -> Nghĩa"}
            </button>
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
                        <p
                          className={`my-auto text-center select-none w-full break-words whitespace-pre-wrap ${
                            frontIsMeaning
                              ? "text-2xl font-medium text-slate-700"
                              : "text-3xl font-bold text-slate-800"
                          }`}
                        >
                          {frontText}
                        </p>
                      </div>
                      {!frontIsMeaning && (
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
                      )}
                      <p className="text-sm text-slate-400 shrink-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:translateZ(0)] [-webkit-transform:translateZ(0)]">
                        {isReverseStudy
                          ? "Chạm vùng trống để xem từ"
                          : "Chạm vùng trống để xem nghĩa"}
                      </p>
                    </div>

                    <div className="absolute inset-0 w-full h-full bg-blue-600 rounded-3xl shadow-lg border border-blue-500 flex flex-col items-center p-6 pb-5 [transform:rotateY(180deg)_translateZ(1px)] [-webkit-transform:rotateY(180deg)_translateZ(1px)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                      <div className="flex-1 w-full overflow-y-auto flex flex-col items-center min-h-0 px-2 py-4 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:translateZ(0)] [-webkit-transform:translateZ(0)]">
                        <p
                          className={`my-auto text-white text-center select-none w-full break-words whitespace-pre-wrap ${
                            backIsWord
                              ? "text-3xl font-bold"
                              : "text-2xl font-medium"
                          }`}
                        >
                          {backText}
                        </p>
                      </div>
                      {backIsWord && (
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
                          className="shrink-0 p-4 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-full transition-all cursor-pointer flex items-center justify-center border border-white/20 shadow-sm [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:translateZ(0)] [-webkit-transform:translateZ(0)]"
                          title="PhÃ¡t Ã¢m"
                        >
                          <Volume2 className="w-7 h-7 animate-pulse" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Các nút bấm hành động */}
                <div className="flex justify-center gap-6 w-full max-w-sm px-4">
                  <button
                    onClick={() => handleSwipeAction("unknown")}
                    disabled={isAdvancingCard}
                    className="flex-1 flex flex-col items-center justify-center py-4 bg-white border-2 border-red-100 rounded-2xl hover:bg-red-50 text-red-500 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
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
                    disabled={isAdvancingCard}
                    className="flex-1 flex flex-col items-center justify-center py-4 bg-white border-2 border-green-100 rounded-2xl hover:bg-green-50 text-green-500 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
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

        {/* --- TAB: GAME --- */}
        {activeTab === "game" && (
          <GameTab
            cards={cards}
            deckInput={deckInput}
            existingDecks={existingDecks}
            onDeckChange={setDeckInput}
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

        {/* NÚT TAB MỚI: GAME */}
        <button
          onClick={() => setActiveTab("game")}
          className={`flex-1 flex flex-col items-center py-2.5 relative ${
            activeTab === "game"
              ? "text-amber-500 font-bold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Trophy className="w-5 h-5 mb-1" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-center line-clamp-1">
            Game
          </span>
        </button>
      </nav>

      {/* --- GLOBAL MESSAGE MODAL --- */}
      {globalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
            <div
              className={`p-4 flex items-center gap-3 ${globalMessage.type === "error" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}
            >
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg">{globalMessage.title}</h3>
            </div>
            <div className="p-5 text-slate-600 text-sm leading-relaxed">
              {globalMessage.text}
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setGlobalMessage(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
