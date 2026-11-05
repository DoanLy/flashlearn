// Nhận dạng giọng nói ngay trên máy cho iPad/iPhone: Web Speech của Safari không ra chữ sau khi video
// YouTube đã phát (xem HANDOFF). Ghi PCM từ micro rồi đưa cho Whisper trong worker, không cần API key.

const WHISPER_SAMPLE_RATE = 16000;

let worker = null;
let nextId = 0;
const pending = new Map();
const progressListeners = new Set();

const rejectAll = (message) => {
  pending.forEach(({ reject }) => reject(new Error(message)));
  pending.clear();
};

const getWorker = () => {
  if (worker) return worker;
  worker = new Worker(new URL("./whisperWorker.js", import.meta.url), { type: "module" });
  worker.onmessage = ({ data }) => {
    if (data.type === "progress") {
      progressListeners.forEach((listener) => listener(data.percent));
      return;
    }
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    if (data.error) request.reject(new Error(data.error));
    else request.resolve(data.text);
  };
  // iPad thiếu bộ nhớ có thể giết worker: bỏ để lần sau tạo lại.
  worker.onerror = (event) => {
    worker = null;
    rejectAll(event.message || "Bộ nhận dạng bị dừng");
  };
  return worker;
};

const request = (message, transfer) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ ...message, id }, transfer);
  });

export const isIOSDevice = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const onWhisperProgress = (listener) => {
  progressListeners.add(listener);
  return () => progressListeners.delete(listener);
};

export const preloadWhisper = () => request({ type: "load" }, []);

export const transcribePcm = async (pcm) => {
  const text = await request({ type: "transcribe", pcm }, [pcm.buffer]);
  // Whisper ghi chú tiếng không phải lời nói kiểu [BLANK_AUDIO], (music).
  return text.replace(/\[[^\]]*\]|\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
};

// Ghi bằng MediaRecorder, không qua AudioContext: iOS có thể giữ AudioContext ở trạng thái gián đoạn
// sau khi video đã phát, khi đó luồng Web Audio toàn im lặng dù micro vẫn thu.
// raw = tắt xử lý giọng nói của trình duyệt, iOS mở micro theo đường khác.
export const openMicCapture = async ({ raw = false, onLog } = {}) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: raw ? { echoCancellation: false, noiseSuppression: false, autoGainControl: false } : true,
  });
  const [track] = stream.getAudioTracks();
  track.onmute = () => onLog?.("track mute");
  track.onunmute = () => onLog?.("track unmute");
  track.onended = () => onLog?.("track ended");

  const chunks = [];
  const recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  recorder.onerror = (event) => onLog?.(`recorder lỗi: ${event.error?.name}`);
  recorder.start();

  const release = () => {
    track.onmute = track.onunmute = track.onended = null;
    stream.getTracks().forEach((item) => item.stop());
  };

  return {
    info: `${track.readyState}, muted=${track.muted}, ${recorder.mimeType}`,
    cancel: () => {
      recorder.ondataavailable = null;
      if (recorder.state !== "inactive") recorder.stop();
      release();
    },
    // peak để phân biệt micro thu toàn im lặng với thu được tiếng mà không nhận ra chữ.
    stop: () =>
      new Promise((resolve, reject) => {
        recorder.onstop = async () => {
          const trackState = `${track.readyState}, muted=${track.muted}`;
          release();
          const blob = new Blob(chunks, { type: recorder.mimeType });
          if (!blob.size) {
            resolve({ pcm: new Float32Array(0), peak: 0, seconds: 0, bytes: 0, trackState });
            return;
          }
          try {
            // OfflineAudioContext tự đổi về tần số của nó khi giải mã, không cần cử chỉ người dùng.
            const offline = new OfflineAudioContext(1, 1, WHISPER_SAMPLE_RATE);
            const decoded = await offline.decodeAudioData(await blob.arrayBuffer());
            const pcm = decoded.getChannelData(0).slice();
            let peak = 0;
            pcm.forEach((value) => {
              peak = Math.max(peak, Math.abs(value));
            });
            resolve({ pcm, peak, seconds: decoded.duration, bytes: blob.size, trackState });
          } catch (err) {
            reject(new Error(`giải mã ${blob.size} byte ${blob.type}: ${err.message}`));
          }
        };
        recorder.stop();
      }),
  };
};
