// Chạy Whisper trong worker để không treo giao diện lúc tải model và lúc nhận dạng.
import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;

const MODEL = "Xenova/whisper-tiny.en";

let transcriberPromise = null;

const loadTranscriber = () => {
  if (transcriberPromise) return transcriberPromise;
  const files = {};
  transcriberPromise = pipeline("automatic-speech-recognition", MODEL, {
    device: "wasm",
    dtype: "q8",
    progress_callback: (info) => {
      if (info.status !== "progress") return;
      files[info.file] = { loaded: info.loaded, total: info.total };
      const all = Object.values(files);
      const loaded = all.reduce((sum, file) => sum + file.loaded, 0);
      const total = all.reduce((sum, file) => sum + file.total, 0);
      self.postMessage({ type: "progress", percent: total ? Math.round((loaded / total) * 100) : 0 });
    },
  }).catch((err) => {
    // Lỗi mạng lúc tải model: lần bấm sau được tải lại.
    transcriberPromise = null;
    throw err;
  });
  return transcriberPromise;
};

self.onmessage = async ({ data }) => {
  try {
    const transcriber = await loadTranscriber();
    if (data.type === "load") {
      self.postMessage({ id: data.id, text: "" });
      return;
    }
    const result = await transcriber(data.pcm, { chunk_length_s: 30, stride_length_s: 5 });
    self.postMessage({ id: data.id, text: result.text });
  } catch (err) {
    self.postMessage({ id: data.id, error: String(err?.message || err) });
  }
};
