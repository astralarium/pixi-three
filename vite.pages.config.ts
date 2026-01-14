import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Vite config for building the pages site (examples app)
export default defineConfig({
  resolve: {
    alias: {
      "@astralarium/pixi-three": resolve(__dirname, "src/index.ts"),
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  base: "/pixi-three/",
  publicDir: "dist-pages",
  server: {
    fs: {
      allow: [".", "dist-pages/docs"],
    },
  },
  build: {
    outDir: "dist-pages",
    copyPublicDir: false,
  },
});
