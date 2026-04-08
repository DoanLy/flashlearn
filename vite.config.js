import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Tên này phải trùng chính xác với tên Repository bạn tạo trên GitHub
});
