import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, Plugin } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Plugin to serve typedoc output at /pixi-three/docs during dev
function serveDocsPlugin(): Plugin {
  return {
    name: "serve-docs",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith("/pixi-three/docs")) {
          // Rewrite URL to serve from pages/docs
          const filePath = req.url.replace("/pixi-three/docs", "/pages/docs");
          req.url =
            filePath === "/pages/docs" ? "/pages/docs/index.html" : filePath;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith("/pixi-three/docs")) {
          const filePath = req.url.replace("/pixi-three/docs", "/pages/docs");
          req.url =
            filePath === "/pages/docs" ? "/pages/docs/index.html" : filePath;
        }
        next();
      });
    },
  };
}

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
    serveDocsPlugin(),
  ],
  base: "/pixi-three/",
  server: {
    fs: {
      allow: [".", "pages/docs"],
    },
  },
  build: {
    outDir: "pages",
  },
});
