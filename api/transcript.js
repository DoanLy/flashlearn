// Vercel serverless function: lấy phụ đề YouTube dạng srv3 XML — có mốc thời gian theo
// TỪNG TỪ (<s t="offset_ms">word</s>) thay vì theo dòng như .srt của DownSub. Browser không
// gọi thẳng YouTube được vì CORS nên phải đi qua proxy này.
//
// Dùng innertube client ANDROID: đã kiểm chứng (2026-07) là client này trả captionTracks với
// baseUrl dùng được không cần POT token; client WEB trả "Video unavailable" khi gọi server-side.
// Nếu một ngày YouTube chặn (datacenter IP / đổi API) → trả lỗi rõ ràng, client sẽ hướng dẫn
// người dùng quay lại cách dán file .srt thủ công.

const INNERTUBE_BODY = (videoId) => ({
  context: {
    client: {
      clientName: "ANDROID",
      clientVersion: "20.10.38",
      androidSdkVersion: 30,
      hl: "en",
    },
  },
  videoId,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const videoId = String(req.query.v || "").trim();
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    res.status(400).json({ error: "invalid_video_id" });
    return;
  }
  try {
    const pr = await fetch("https://www.youtube.com/youtubei/v1/player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(INNERTUBE_BODY(videoId)),
    });
    const data = await pr.json();
    const tracks =
      data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks || !tracks.length) {
      res.status(404).json({
        error: "no_captions",
        playability: data?.playabilityStatus?.status || null,
        reason: data?.playabilityStatus?.reason || null,
      });
      return;
    }
    // Ưu tiên phụ đề tiếng Anh người làm (chuẩn nhất), rồi tới auto-generated tiếng Anh,
    // cuối cùng là track đầu tiên bất kể ngôn ngữ.
    const en = (t) => t.languageCode && t.languageCode.startsWith("en");
    const track =
      tracks.find((t) => en(t) && t.kind !== "asr") ||
      tracks.find((t) => en(t)) ||
      tracks[0];
    const xr = await fetch(track.baseUrl);
    const xml = await xr.text();
    if (!xml || xml.length < 50 || !xml.includes("<timedtext")) {
      res.status(502).json({ error: "empty_transcript" });
      return;
    }
    // Phụ đề của một video công khai gần như không đổi — cache CDN 1 ngày cho rẻ/nhanh.
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json({
      videoId,
      lang: track.languageCode,
      kind: track.kind || "manual",
      title: data?.videoDetails?.title || null,
      xml,
    });
  } catch (e) {
    res.status(502).json({ error: "fetch_failed", message: String(e && e.message) });
  }
}
