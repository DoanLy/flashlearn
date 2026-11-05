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

const resampleForWhisper = async (samples, sampleRate) => {
  if (sampleRate === WHISPER_SAMPLE_RATE) return samples;
  const length = Math.ceil((samples.length * WHISPER_SAMPLE_RATE) / sampleRate);
  const offline = new OfflineAudioContext(1, length, WHISPER_SAMPLE_RATE);
  const buffer = offline.createBuffer(1, samples.length, sampleRate);
  buffer.copyToChannel(samples, 0);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0).slice();
};

// Phải gọi trong lượt bấm: AudioContext được tạo và resume trước await đầu tiên, không thì iOS giữ suspended.
export const openMicCapture = async () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContextClass();
  const resuming = context.resume();
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    await resuming;
  } catch (err) {
    stream?.getTracks().forEach((track) => track.stop());
    context.close();
    throw err;
  }

  const chunks = [];
  const source = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(4096, 1, 1);
  const silence = context.createGain();
  silence.gain.value = 0;
  processor.onaudioprocess = (event) => {
    chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
  };
  source.connect(processor);
  processor.connect(silence);
  silence.connect(context.destination);

  const release = () => {
    processor.onaudioprocess = null;
    source.disconnect();
    processor.disconnect();
    silence.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    context.close();
  };

  return {
    contextState: context.state,
    cancel: release,
    // peak để phân biệt micro thu toàn im lặng với thu được tiếng mà không nhận ra chữ.
    stop: async () => {
      const sampleRate = context.sampleRate;
      const state = context.state;
      release();
      const samples = new Float32Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
      let offset = 0;
      let peak = 0;
      chunks.forEach((chunk) => {
        samples.set(chunk, offset);
        offset += chunk.length;
        chunk.forEach((value) => {
          peak = Math.max(peak, Math.abs(value));
        });
      });
      return {
        pcm: samples.length ? await resampleForWhisper(samples, sampleRate) : samples,
        peak,
        seconds: samples.length / sampleRate,
        state,
      };
    },
  };
};
