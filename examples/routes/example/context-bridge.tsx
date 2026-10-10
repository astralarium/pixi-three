import {
  CanvasView,
  PixiTexture,
  RenderContext,
  ThreeScene,
  useEffectInvalidate,
} from "@astralarium/pixi-three";
import { createFileRoute } from "@tanstack/react-router";
import { createContext, use, useEffect, useRef, useState } from "react";

import { Label } from "#components/label";
import { Button } from "#components/ui/button";

import { Frame } from "./-frame";

export const Route = createFileRoute("/example/context-bridge")({
  component: ContextBridge,
});

const COLUMNS = 6;
const ROWS = 4;

/** Provided above the canvas; read by the first tile */
const TickContext = createContext(0);
/** Provided inside the scene; read by no tile */
const NoiseContext = createContext(0);

/** Tile content commits since page load */
const commits = { tick: 0, static: 0 };

function ContextBridge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);
  const [noise, setNoise] = useState(0);

  return (
    <Frame
      title="Context Bridge"
      subtitle="Textures redraw only for contexts they read."
      sourceUrl="https://github.com/astralarium/pixi-three/blob/main/examples/routes/example/context-bridge.tsx"
      canvasRef={canvasRef}
    >
      <div className="flex flex-wrap items-center gap-4 px-4">
        <Button size="sm" onClick={() => setTick((n) => n + 1)}>
          Bump read context
        </Button>
        <Button size="sm" onClick={() => setNoise((n) => n + 1)}>
          Bump unread context
        </Button>
        <Commits />
      </div>
      <TickContext value={tick}>
        <RenderContext>
          <CanvasView alpha frameloop="demand" canvasRef={canvasRef}>
            <ThreeScene frameloop="demand">
              <NoiseContext value={noise}>
                {Array.from({ length: COLUMNS * ROWS }, (_, i) => (
                  <Tile key={i} index={i} />
                ))}
              </NoiseContext>
            </ThreeScene>
          </CanvasView>
        </RenderContext>
      </TickContext>
    </Frame>
  );
}

function Tile({ index }: { index: number }) {
  const x = (index % COLUMNS) - (COLUMNS - 1) / 2;
  const y = (ROWS - 1) / 2 - Math.floor(index / COLUMNS);
  return (
    // Pixi y runs down UV v; flip so text reads upright
    <mesh position={[x * 1.1, y * 1.1, 0]} scale={[1, -1, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicNodeMaterial>
        <PixiTexture
          width={128}
          height={128}
          attach="colorNode"
          frameloop="demand"
        >
          {index === 0 ? <TickLabel /> : <StaticLabel index={index} />}
        </PixiTexture>
      </meshBasicNodeMaterial>
    </mesh>
  );
}

function TickLabel() {
  const tick = use(TickContext);
  useEffectInvalidate();
  useEffect(() => {
    commits.tick++;
  });
  return <Label text={`tick ${tick}`} color={0x2563eb} />;
}

function StaticLabel({ index }: { index: number }) {
  useEffectInvalidate();
  useEffect(() => {
    commits.static++;
  });
  return <Label text={`#${index}`} color={0x64748b} />;
}

function Commits() {
  const [snapshot, setSnapshot] = useState({ ...commits });
  useEffect(() => {
    const id = setInterval(() => setSnapshot({ ...commits }), 250);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-muted-foreground font-mono text-sm">
      read-context tile commits: {snapshot.tick} · other tile commits:{" "}
      {snapshot.static}
    </span>
  );
}
