/*
 * Bảng màu "sticker" — teal / vàng nắng / coral trên nền giấy xám nhạt,
 * viền mực đậm. Các họ màu gốc của Tailwind được ÁNH XẠ LẠI sang bảng này
 * để toàn bộ class `bg-blue-600`, `text-slate-500`… đang có sẵn trong
 * App.jsx tự đổi tông mà không phải sửa hàng nghìn className (giữ nguyên
 * mọi logic/tính năng).
 *
 *   blue / indigo / sky / teal  → teal (màu chính)
 *   violet / purple / red / rose → coral (màu nhấn ấm)
 *   amber / yellow              → sun (vàng highlight)
 *   orange                      → cam-coral (nhấn nóng)
 *   cyan                        → aqua (teal sáng, dùng trong game nền tối)
 *   green / emerald / lime      → green (trạng thái "đã thuộc")
 *   slate / gray / zinc / …     → ink (trung tính hơi ngả xanh, đầu tối = mực)
 */

const teal = {
  50: "#EAF7F5",
  100: "#CDECE7",
  200: "#9EDAD1",
  300: "#6AC4B8",
  400: "#43AFA2",
  500: "#2E9E93",
  600: "#23847C",
  700: "#1D6A64",
  800: "#17544F",
  900: "#133F3C",
  950: "#0A2523",
};

const aqua = {
  50: "#ECFBF8",
  100: "#D2F6EF",
  200: "#A6EDE1",
  300: "#7FE7D9",
  400: "#4ADCC8",
  500: "#22C9B3",
  600: "#12A794",
  700: "#0F8577",
  800: "#0E6A5F",
  900: "#0D554D",
  950: "#04302B",
};

const sun = {
  50: "#FFFCE8",
  100: "#FFF6C2",
  200: "#FFEE8A",
  300: "#FFE55C",
  400: "#FFD92E",
  500: "#FBC700",
  600: "#D9A400",
  700: "#AD7F00",
  800: "#86620A",
  900: "#6B4E0C",
  950: "#3E2C04",
};

const coral = {
  50: "#FFF1EF",
  100: "#FFDFDB",
  200: "#FFC2BA",
  300: "#FCA096",
  400: "#F57F72",
  500: "#E8604F",
  600: "#CF4838",
  700: "#AC382B",
  800: "#8B2E24",
  900: "#712720",
  950: "#3E110D",
};

const flame = {
  50: "#FFF4ED",
  100: "#FFE5D5",
  200: "#FFC7A9",
  300: "#FFB48A",
  400: "#FF9463",
  500: "#F97A45",
  600: "#E0602C",
  700: "#B84A20",
  800: "#943C1D",
  900: "#78331B",
  950: "#41180B",
};

const green = {
  50: "#EDFAF1",
  100: "#D2F2DC",
  200: "#A6E4BC",
  300: "#6FD096",
  400: "#40B873",
  500: "#269E5C",
  600: "#1A8049",
  700: "#16653B",
  800: "#135030",
  900: "#103F28",
  950: "#072016",
};

const ink = {
  50: "#F5F7F6",
  100: "#EBEEEC",
  200: "#DBE0DE",
  300: "#BAC3C0",
  400: "#8B9794",
  500: "#67736F",
  600: "#4C5A56",
  700: "#3A4744",
  800: "#24302E",
  900: "#16211F",
  950: "#0B1413",
};

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: teal,
        indigo: teal,
        sky: teal,
        teal: teal,
        cyan: aqua,
        violet: coral,
        purple: coral,
        fuchsia: coral,
        red: coral,
        rose: coral,
        pink: coral,
        orange: flame,
        amber: sun,
        yellow: sun,
        green: green,
        emerald: green,
        lime: green,
        slate: ink,
        gray: ink,
        zinc: ink,
        neutral: ink,
        stone: ink,
        // Bí danh gọi thẳng theo tên bảng màu khi viết class mới
        brand: teal,
        sun: sun,
        coral: coral,
        ink: ink,
      },
      boxShadow: {
        sticker: "3px 4px 0 0 #16211F",
        "sticker-sm": "2px 3px 0 0 #16211F",
        "sticker-lg": "5px 6px 0 0 #16211F",
      },
    },
  },
  plugins: [],
};
