import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  beforeLoad: () => {
    window.location.replace("/pixi-three/docs/index.html");
  },
});
