import {
  CanvasView,
  RenderContext,
  ThreeRenderTexture,
  ThreeScene,
} from "@astralarium/pixi-three";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

import { FadeIn } from "#components/fade-in";
import { SpinnyCube } from "#components/spinny-cube";
import { SpinnyCubeWithStars } from "#components/spinny-cube-with-stars";

import { Frame } from "./-frame";

export const Route = createFileRoute("/example/three-render-texture")({
  component: ThreeRenderTextureExample,
});

function ThreeRenderTextureExample() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <Frame
      title="Three Render Texture"
      subtitle="Three.js render texture with events"
      sourceUrl="https://github.com/astralarium/pixi-three/blob/main/examples/routes/example/three-render-texture.tsx"
      canvasRef={canvasRef}
    >
      <RenderContext>
        <CanvasView alpha canvasRef={canvasRef}>
          <FadeIn>
            <ThreeScene>
              <SpinnyCube size={2} speed={0.5} position={[-1.5, 0, 0]}>
                <ThreeRenderTexture attach="colorNode" width={512} height={512}>
                  <SpinnyCubeWithStars size={2} speed={0.5} />
                </ThreeRenderTexture>
              </SpinnyCube>
              <SpinnyCube size={2} speed={0.5} position={[1.5, 0, 0]}>
                <ThreeRenderTexture attach="colorNode" width={512} height={512}>
                  <SpinnyCubeWithStars size={2} speed={0.5} />
                </ThreeRenderTexture>
              </SpinnyCube>
            </ThreeScene>
          </FadeIn>
        </CanvasView>
      </RenderContext>
    </Frame>
  );
}
