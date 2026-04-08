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
} from "lucide-react";

export default function App() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem("mini-quizlet-cards");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState("input"); // 'input', 'study', 'unknown'
  const [deckInput, setDeckInput] = useState("Tất cả"); // State cho Nhóm/Chủ đề
  const [deckMode, setDeckMode] = useState("select"); // 'select', 'new'
  const [wordInput, setWordInput] = useState("");
  const [meaningInput, setMeaningInput] = useState("");
  const [inputMode, setInputMode] = useState("single"); // 'single', 'bulk'
  const [bulkInput, setBulkInput] = useState("");

  // States cho tính năng chỉnh sửa
  const [editingId, setEditingId] = useState(null);
  const [editDeck, setEditDeck] = useState("");
  const [editWord, setEditWord] = useState("");
  const [editMeaning, setEditMeaning] = useState("");

  // Danh sách các chủ đề do người dùng tự tạo (để lưu lại dropdown dù chưa có từ nào)
  const [customDecks, setCustomDecks] = useState(() => {
    const saved = localStorage.getItem("mini-quizlet-decks");
    return saved ? JSON.parse(saved) : [];
  });

  // Lấy danh sách các chủ đề hiện có để gợi ý (luôn có nhóm 'Tất cả', 'Chung', nhóm tự tạo, và nhóm có sẵn từ thẻ)
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

  // --- LƯU TRỮ LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem("mini-quizlet-cards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem("mini-quizlet-decks", JSON.stringify(customDecks));
  }, [customDecks]);

  // --- CHỨC NĂNG THÊM TỪ VỰNG (INPUT) ---
  const handleAddCard = (e) => {
    e.preventDefault();
    if (!wordInput.trim() || !meaningInput.trim()) return;

    // Nếu đang chọn "Tất cả" thì từ mới tạo sẽ vào nhóm "Chung"
    const targetDeck =
      deckInput === "Tất cả" ? "Chung" : deckInput.trim() || "Chung";

    const newCard = {
      id: Date.now().toString(),
      word: wordInput.trim(),
      meaning: meaningInput.trim(),
      status: "new", // Trạng thái: 'new', 'known', 'unknown'
      deck: targetDeck,
    };

    setCards([...cards, newCard]);
    setWordInput("");
    setMeaningInput("");
    // Lưu ý: Không reset deckInput để tiện nhập tiếp từ khác cho cùng chủ đề
  };

  const handleBulkAddCard = (e) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    const lines = bulkInput.split("\n");
    const newCards = [];
    const targetDeck =
      deckInput === "Tất cả" ? "Chung" : deckInput.trim() || "Chung";

    lines.forEach((line, index) => {
      // Cắt dòng theo dấu hai chấm đầu tiên
      const parts = line.split(":");
      if (parts.length >= 2) {
        const word = parts[0].trim();
        const meaning = parts.slice(1).join(":").trim(); // Ghép lại đề phòng nghĩa có chứa dấu ':'

        if (word && meaning) {
          newCards.push({
            id: Date.now().toString() + "-" + index, // Thêm index để đảm bảo id không bị trùng
            word: word,
            meaning: meaning,
            status: "new",
            deck: targetDeck,
          });
        }
      }
    });

    if (newCards.length > 0) {
      setCards([...cards, ...newCards]);
      setBulkInput("");
    }
  };

  const handleDeleteCard = (id) => {
    setCards(cards.filter((c) => c.id !== id));
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
    if (!newDeck || newDeck === "Tất cả") newDeck = "Chung"; // Tránh việc đặt tên deck là 'Tất cả' làm lỗi filter
    setCards(
      cards.map((c) =>
        c.id === id
          ? {
              ...c,
              deck: newDeck,
              word: editWord.trim(),
              meaning: editMeaning.trim(),
            }
          : c,
      ),
    );
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

  // Khởi tạo danh sách học khi chuyển sang tab 'study'
  useEffect(() => {
    if (activeTab === "study") {
      const cardsToStudy = cards.filter(
        (c) =>
          (c.status === "new" || c.status === "unknown") &&
          isCardInCurrentDeck(c),
      );
      // Đảo vị trí ngẫu nhiên cho thú vị
      setStudyQueue(cardsToStudy.sort(() => Math.random() - 0.5));
      setIsFlipped(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, deckInput]); // SỬA LỖI: Bỏ 'cards' ra khỏi mảng dependency để danh sách không bị tự động reset sau mỗi lần lướt thẻ

  const currentCard = studyQueue[0];

  const speakWord = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Dừng âm thanh cũ nếu đang đọc
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // Mặc định tiếng Anh, bạn có thể đổi nếu học ngôn ngữ khác
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCardClick = () => {
    // Chỉ đọc từ khi mặt đang hiển thị là từ vựng (chưa lật)
    if (!isFlipped) {
      speakWord(currentCard.word);
    }
    setIsFlipped(!isFlipped);
  };

  const handleSwipeAction = (action) => {
    if (!currentCard) return;

    const newStatus = action === "known" ? "known" : "unknown";

    // Cập nhật trạng thái trong mảng tổng
    setCards((prevCards) =>
      prevCards.map((c) =>
        c.id === currentCard.id ? { ...c, status: newStatus } : c,
      ),
    );

    // Xóa thẻ hiện tại khỏi hàng đợi học
    setStudyQueue((prevQueue) => prevQueue.slice(1));
    setIsFlipped(false);
    setSwipeOffset(0);
  };

  // Logic kéo thả / vuốt
  const handleDragStart = (clientX) => {
    setStartX(clientX);
    setIsDragging(true);
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
      handleSwipeAction("known"); // Vuốt phải
    } else if (swipeOffset < -100) {
      handleSwipeAction("unknown"); // Vuốt trái
    } else {
      setSwipeOffset(0); // Trở về vị trí cũ nếu vuốt chưa đủ lực
    }
  };

  // --- RENDER GIAO DIỆN ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4 mb-6 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center text-blue-600 flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6" /> FlashLearn
        </h1>
      </header>

      <main className="max-w-md mx-auto px-4">
        {/* --- TAB: QUẢN LÝ TỪ (INPUT) --- */}
        {activeTab === "input" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
              <h2 className="text-lg font-bold mb-4">Thêm Flashcard</h2>

              {/* Form chọn chủ đề dùng chung cho cả Single và Bulk */}
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
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1em",
                    }}
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
                          // Lưu chủ đề mới vào danh sách
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

              {/* Nút chuyển đổi chế độ nhập */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${inputMode === "single" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                  onClick={() => setInputMode("single")}
                >
                  Từng từ một
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${inputMode === "bulk" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                  onClick={() => setInputMode("bulk")}
                >
                  Hàng loạt
                </button>
              </div>

              {/* Form nhập liệu tuỳ theo chế độ */}
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
                    <input
                      type="text"
                      value={meaningInput}
                      onChange={(e) => setMeaningInput(e.target.value)}
                      placeholder="VD: Quả táo"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-shadow outline-none"
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
                            <input
                              type="text"
                              value={editMeaning}
                              onChange={(e) => setEditMeaning(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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
                          <div className="flex-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-500 uppercase tracking-wider mb-1">
                              <Tag className="w-3 h-3" />
                              {card.deck || "Chung"}
                            </span>
                            <p className="font-bold text-lg">{card.word}</p>
                            <p className="text-slate-500">{card.meaning}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStartEdit(card)}
                              className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Sửa"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCard(card.id)}
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
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 text-center">
              Chủ đề: <span className="text-blue-600">{deckInput}</span> <br />
              <span className="text-xs font-normal">
                Đang học: {studyQueue.length} từ
              </span>
            </h2>

            {!currentCard ? (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center w-full mt-10">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tuyệt vời!</h3>
                <p className="text-slate-500 mb-6">
                  Bạn đã ôn tập xong tất cả các từ.
                </p>
                <button
                  onClick={() => setActiveTab("unknown")}
                  className="px-6 py-2 bg-blue-50 text-blue-600 font-medium rounded-full hover:bg-blue-100 transition-colors"
                >
                  Xem các từ chưa thuộc
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {/* Flashcard Component */}
                <div
                  className="relative w-full aspect-[4/3] max-w-sm cursor-pointer select-none [perspective:1000px] mb-8"
                  onMouseDown={(e) => handleDragStart(e.clientX)}
                  onMouseMove={(e) => handleDragMove(e.clientX)}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                  onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                  onTouchEnd={handleDragEnd}
                  onClick={handleCardClick}
                  style={{
                    transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.05}deg)`,
                    transition: isDragging ? "none" : "transform 0.3s ease-out",
                  }}
                >
                  <div
                    className={`w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
                  >
                    {/* Mặt trước (Từ vựng) */}
                    <div className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center justify-center p-6 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                      <p className="text-4xl font-bold text-slate-800 text-center select-none">
                        {currentCard.word}
                      </p>
                      <Volume2 className="mt-4 text-blue-400 w-8 h-8 animate-pulse" />
                      <p className="absolute bottom-6 text-sm text-slate-400">
                        Chạm để xem nghĩa
                      </p>
                    </div>
                    {/* Mặt sau (Nghĩa) */}
                    <div className="absolute inset-0 w-full h-full bg-blue-600 rounded-3xl shadow-lg border border-blue-500 flex flex-col items-center justify-center p-6 [transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                      <p className="text-3xl font-medium text-white text-center select-none">
                        {currentCard.meaning}
                      </p>
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
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-lg font-bold">Cần học lại</h2>
                <p className="text-sm text-slate-500">
                  Chủ đề:{" "}
                  <span className="font-semibold text-blue-600">
                    {deckInput}
                  </span>
                </p>
              </div>
              {cards.filter(
                (c) => c.status === "unknown" && isCardInCurrentDeck(c),
              ).length > 0 && (
                <button
                  onClick={() => {
                    // Chuyển toàn bộ thẻ unknown của CHỦ ĐỀ NÀY thành new để học lại
                    setCards(
                      cards.map((c) =>
                        c.status === "unknown" && isCardInCurrentDeck(c)
                          ? { ...c, status: "new" }
                          : c,
                      ),
                    );
                    setActiveTab("study");
                  }}
                  className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Học lại
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
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-500 uppercase tracking-wider mb-1">
                          <Tag className="w-3 h-3" />
                          {card.deck || "Chung"}
                        </span>
                        <p className="font-bold text-lg text-slate-800 flex items-center gap-2">
                          {card.word}
                          <button
                            onClick={() => speakWord(card.word)}
                            className="text-slate-300 hover:text-blue-500"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </p>
                        <p className="text-slate-500">{card.meaning}</p>
                      </div>
                      <button
                        onClick={() => {
                          // Đánh dấu từ này là đã thuộc trực tiếp từ danh sách
                          setCards(
                            cards.map((c) =>
                              c.id === card.id ? { ...c, status: "known" } : c,
                            ),
                          );
                        }}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        title="Đánh dấu đã thuộc"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- BOTTOM NAVIGATION BAR --- */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around items-center pb-safe">
        <button
          onClick={() => setActiveTab("input")}
          className={`flex-1 flex flex-col items-center py-3 ${activeTab === "input" ? "text-blue-600 font-medium" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Plus className="w-6 h-6 mb-1" />
          <span className="text-[10px] uppercase tracking-wider">Thêm từ</span>
        </button>
        <button
          onClick={() => setActiveTab("study")}
          className={`flex-1 flex flex-col items-center py-3 ${activeTab === "study" ? "text-blue-600 font-medium" : "text-slate-400 hover:text-slate-600"}`}
        >
          <BookOpen className="w-6 h-6 mb-1" />
          <span className="text-[10px] uppercase tracking-wider">Học bài</span>
        </button>
        <button
          onClick={() => setActiveTab("unknown")}
          className={`flex-1 flex flex-col items-center py-3 relative ${activeTab === "unknown" ? "text-blue-600 font-medium" : "text-slate-400 hover:text-slate-600"}`}
        >
          <div className="relative">
            <List className="w-6 h-6 mb-1" />
            {/* Hiển thị số chấm đỏ nếu có từ chưa thuộc */}
            {cards.filter((c) => c.status === "unknown").length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider">Từ khó</span>
        </button>
      </nav>
    </div>
  );
}
