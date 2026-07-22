import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

function getCommitHash() {
  // Vercel cung cấp sẵn SHA commit qua env var lúc build; local thì lấy từ git.
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
}

const pkgVersion = JSON.parse(readFileSync(new URL("./package.json", import.meta.url))).version;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Tên này phải trùng chính xác với tên Repository bạn tạo trên GitHub
  define: {
    __APP_VERSION__: JSON.stringify(pkgVersion),
    __BUILD_COMMIT__: JSON.stringify(getCommitHash()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
