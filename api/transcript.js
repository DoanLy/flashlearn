// Vercel serverless function: lấy phụ đề YouTube dạng srv3 XML — có mốc thời gian theo
// TỪNG TỪ (<s t="offset_ms">word</s>) thay vì theo dòng như .srt của DownSub. Browser không
// gọi thẳng YouTube được vì CORS nên phải đi qua proxy này.
//
// YouTube chặn bot-check tuỳ CLIENT innertube và tuỳ IP: client ANDROID chạy tốt từ IP dân cư
// nhưng từ IP datacenter (Vercel) bị "Sign in to confirm you're not a bot" (LOGIN_REQUIRED).
// Vì vậy thử LẦN LƯỢT nhiều client — các client "thiết bị lạ" (VR, TV, iOS) thường không bị
// check bot. Thêm ?debug=1 để xem kết quả từng client khi cần chẩn đoán.
// Nếu tất cả đều bị chặn → trả lỗi rõ ràng, UI sẽ hướng dẫn quay lại dán file .srt thủ công.

const CLIENTS = [
  {
    name: "ANDROID_VR",
    body: {
      clientName: "ANDROID_VR",
      clientVersion: "1.62.27",
      deviceMake: "Oculus",
      deviceModel: "Quest 3",
      androidSdkVersion: 32,
      osName: "Android",
      osVersion: "12L",
      hl: "en",
    },
    ua: "com.google.android.apps.youtube.vr.oculus/1.62.27 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
  },
  {
    name: "IOS",
    body: {
      clientName: "IOS",
      clientVersion: "20.10.4",
      deviceMake: "Apple",
      deviceModel: "iPhone16,2",
      osName: "iPhone",
      osVersion: "18.3.2.22D82",
      hl: "en",
    },
    ua: "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)",
  },
  {
    name: "ANDROID",
    body: {
      clientName: "ANDROID",
      clientVersion: "20.10.38",
      androidSdkVersion: 30,
      osName: "Android",
      osVersion: "11",
      hl: "en",
    },
    ua: "com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip",
  },
  {
    name: "TVHTML5_EMBED",
    body: {
      clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
      clientVersion: "2.0",
      hl: "en",
    },
    thirdParty: { embedUrl: "https://www.youtube.com/" },
    ua: "Mozilla/5.0 (PlayStation; PlayStation 4/12.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15",
  },
  {
    name: "MWEB",
    body: { clientName: "MWEB", clientVersion: "2.20250311.03.00", hl: "en" },
    ua: "Mozilla/5.0 (iPad; CPU OS 16_7_10 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1,gzip(gfe)",
  },
];

async function tryClient(client, videoId) {
  const context = { client: client.body };
  if (client.thirdParty) context.thirdParty = client.thirdParty;
  const pr = await fetch("https://www.youtube.com/youtubei/v1/player", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": client.ua,
    },
    body: JSON.stringify({ context, videoId }),
  });
  const data = await pr.json();
  const tracks =
    data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  return {
    tracks: tracks && tracks.length ? tracks : null,
    playability: data?.playabilityStatus?.status || null,
    reason: data?.playabilityStatus?.reason || null,
    title: data?.videoDetails?.title || null,
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const videoId = String(req.query.v || "").trim();
  const debug = req.query.debug === "1";
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    res.status(400).json({ error: "invalid_video_id" });
    return;
  }
  const attempts = [];
  for (const client of CLIENTS) {
    let r;
    try {
      r = await tryClient(client, videoId);
    } catch (e) {
      attempts.push({ client: client.name, error: String(e && e.message) });
      continue;
    }
    attempts.push({
      client: client.name,
      playability: r.playability,
      reason: r.reason,
      tracks: r.tracks ? r.tracks.length : 0,
    });
    if (!r.tracks) continue;
    // Ưu tiên phụ đề tiếng Anh người làm (chuẩn nhất), rồi tới auto-generated tiếng Anh,
    // cuối cùng là track đầu tiên bất kể ngôn ngữ.
    const en = (t) => t.languageCode && t.languageCode.startsWith("en");
    const track =
      r.tracks.find((t) => en(t) && t.kind !== "asr") ||
      r.tracks.find((t) => en(t)) ||
      r.tracks[0];
    let xml = "";
    try {
      const xr = await fetch(track.baseUrl, {
        headers: { "User-Agent": client.ua },
      });
      xml = await xr.text();
    } catch (e) {
      attempts[attempts.length - 1].xmlError = String(e && e.message);
      continue;
    }
    if (!xml || xml.length < 50 || !xml.includes("<timedtext")) {
      attempts[attempts.length - 1].xmlError = `bad_xml_len_${xml.length}`;
      continue;
    }
    // Phụ đề của một video công khai gần như không đổi — cache CDN 1 ngày cho rẻ/nhanh.
    if (!debug)
      res.setHeader(
        "Cache-Control",
        "s-maxage=86400, stale-while-revalidate=604800",
      );
    res.status(200).json({
      videoId,
      lang: track.languageCode,
      kind: track.kind || "manual",
      title: r.title,
      via: client.name,
      ...(debug ? { attempts } : {}),
      xml,
    });
    return;
  }
  const anyNoCaptions = attempts.some(
    (a) => a.playability === "OK" && !a.tracks,
  );
  res.status(anyNoCaptions ? 404 : 502).json({
    error: anyNoCaptions ? "no_captions" : "all_clients_blocked",
    attempts,
  });
}
