import {
  CanvasView,
  PixiTexture,
  RenderContext,
  ThreeScene,
  useEffectInvalidate,
} from "@astralarium/pixi-three";
import { extend } from "@pixi/react";
import { createFileRoute } from "@tanstack/react-router";
import { Graphics } from "pixi.js";
import { useRef, useState } from "react";
import { type Intersection, Mesh, type Raycaster } from "three";

import { Button } from "#components/ui/button";

import { Frame } from "./-frame";

extend({ Graphics });

export const Route = createFileRoute("/example/event-cost")({
  component: EventCost,
});

const TILE_COUNTS = [24, 96, 192] as const;
const TEXTURE_SIZE = 64;
/** Synthetic pointermoves per benchmark run */
const MOVES = 400;

/** Tile mesh raycast tests since the last reset */
const counter = { raycasts: 0 };

function countedRaycast(
  this: Mesh,
  raycaster: Raycaster,
  intersects: Intersection[],
) {
  counter.raycasts++;
  Mesh.prototype.raycast.call(this, raycaster, intersects);
}

interface BenchmarkResult {
  tiles: number;
  raycastsPerEvent: number;
  msPerEvent: number;
}

/** Sweeps synthetic pointermoves across the canvas, timing each dispatch */
function runBenchmark(canvas: HTMLCanvasElement, tiles: number) {
  const rect = canvas.getBoundingClientRect();
  const steps = Math.ceil(Math.sqrt(MOVES));
  counter.raycasts = 0;
  let ms = 0;
  for (let i = 0; i < MOVES; i++) {
    const x = rect.left + (((i % steps) + 0.5) / steps) * rect.width;
    const y = rect.top + ((Math.floor(i / steps) + 0.5) / steps) * rect.height;
    const event = new PointerEvent("pointermove", {
      clientX: x,
      clientY: y,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      bubbles: true,
    });
    const start = performance.now();
    canvas.dispatchEvent(event);
    ms += performance.now() - start;
  }
  return {
    tiles,
    raycastsPerEvent: counter.raycasts / MOVES,
    msPerEvent: ms / MOVES,
  };
}

function EventCost() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tiles, setTiles] = useState<number>(96);
  const [results, setResults] = useState<BenchmarkResult[]>([]);

  function benchmark() {
    if (!canvasRef.current) return;
    const result = runBenchmark(canvasRef.current, tiles);
    setResults((prev) => [result, ...prev]);
  }

  return (
    <Frame
      title="Event Cost"
      subtitle="Pointer cost per event across many event-enabled textures"
      sourceUrl="https://github.com/astralarium/pixi-three/blob/main/examples/routes/example/event-cost.tsx"
      canvasRef={canvasRef}
    >
      <div className="flex flex-wrap items-center gap-4 px-4">
        {TILE_COUNTS.map((count) => (
          <Button
            key={count}
            size="sm"
            variant={count === tiles ? "default" : "secondary"}
            onClick={() => setTiles(count)}
          >
            {count} tiles
          </Button>
        ))}
        <Button size="sm" onClick={benchmark}>
          Benchmark {MOVES} moves
        </Button>
      </div>
      <Results results={results} />
      <RenderContext>
        <CanvasView alpha frameloop="demand" canvasRef={canvasRef}>
          <ThreeScene frameloop="demand">
            {Array.from({ length: tiles }, (_, i) => (
              <Tile key={i} index={i} tiles={tiles} />
            ))}
          </ThreeScene>
        </CanvasView>
      </RenderContext>
    </Frame>
  );
}

function Tile({ index, tiles }: { index: number; tiles: number }) {
  const columns = Math.ceil(Math.sqrt(tiles * 1.5));
  const rows = Math.ceil(tiles / columns);
  const pitch = Math.min(6 / columns, 4 / rows);
  const x = (index % columns) - (columns - 1) / 2;
  const y = (rows - 1) / 2 - Math.floor(index / columns);
  return (
    <mesh
      position={[x * pitch, y * pitch, 0]}
      scale={pitch * 0.9}
      raycast={countedRaycast}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicNodeMaterial>
        <PixiTexture
          width={TEXTURE_SIZE}
          height={TEXTURE_SIZE}
          attach="colorNode"
          frameloop="demand"
        >
          <HoverTile />
        </PixiTexture>
      </meshBasicNodeMaterial>
    </mesh>
  );
}

function HoverTile() {
  const [hovered, setHovered] = useState(false);
  useEffectInvalidate();
  return (
    <pixiGraphics
      eventMode="static"
      draw={(graphics) => {
        graphics.clear();
        graphics
          .rect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
          .fill({ color: hovered ? 0x2563eb : 0x64748b });
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    />
  );
}

function Results({ results }: { results: BenchmarkResult[] }) {
  return (
    <ul className="text-muted-foreground h-24 overflow-y-auto px-4 pt-2 font-mono text-sm">
      {results.map((result, i) => (
        <li key={results.length - i}>
          {result.tiles} tiles: {result.raycastsPerEvent.toFixed(1)} mesh
          raycasts/event · {result.msPerEvent.toFixed(3)} ms/event
        </li>
      ))}
    </ul>
  );
}
