import { CanvasView, RenderContext, ThreeScene } from "@astralarium/pixi-three";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

import { DraggableCube } from "#components/draggable-cube";
import { FadeIn } from "#components/fade-in";

import { Frame } from "./-frame";

export const Route = createFileRoute("/example/three-pointer-capture")({
  component: ThreePointerCaptureExample,
});

function ThreePointerCaptureExample() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <Frame
      title="Three Pointer Capture"
      subtitle="Drag meshes even when pointer leaves"
      sourceUrl="https://github.com/astralarium/pixi-three/blob/main/examples/routes/example/three-pointer-capture.tsx"
      canvasRef={canvasRef}
    >
      <RenderContext>
        <CanvasView alpha canvasRef={canvasRef}>
          <FadeIn>
            <ThreeScene>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <DraggableCube position={[-1.5, 0, 0]} color="#f04d5e" />
              <DraggableCube position={[1.5, 0, 0]} color="#0477db" />
              <gridHelper
                args={[10, 10, "#666", "#333"]}
                rotation-x={Math.PI / 2}
                position-z={-2}
              />
            </ThreeScene>
          </FadeIn>
        </CanvasView>
      </RenderContext>
    </Frame>
  );
}
