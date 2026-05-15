import { PixiTexture, usePixiViewContext } from "@astralarium/pixi-three";
import { type ThreeElements } from "@react-three/fiber";
import { Point } from "pixi.js";
import { type MutableRefObject, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { CirclePing } from "./circle-ping";
import { threeBlue } from "./lib/colors";
import { SpinnyCube, type SpinnyCubeProps } from "./spinny-cube";
import { SpinnyStar, type SpinnyStarColors } from "./spinny-star";

export interface SpinnyCubeWithStarsProps extends SpinnyCubeProps {
  initialColors?: SpinnyStarColors;
}

type MapClientToPixi = (
  client: Point | { clientX: number; clientY: number },
  out?: Point,
) => Point | null;

export function SpinnyCubeWithStars({
  size,
  speed,
  initialColors,
  ...props
}: ThreeElements["mesh"] & SpinnyCubeWithStarsProps) {
  const [ping, setPing] = useState<Point | null>(null);
  const mapClientToPixiRef = useRef<MapClientToPixi | null>(null);

  function handlePointerMissed(event: PointerEvent) {
    const mapClientToPixi = mapClientToPixiRef.current;
    if (!mapClientToPixi) return;

    const point = mapClientToPixi(event);
    if (point) {
      setPing(new Point(point.x, point.y));
      toast.info("PixiTexture missed!", {
        description: `Click at (${Math.round(point.x)}, ${Math.round(point.y)}) in texture`,
      });
    }
  }

  return (
    <SpinnyCube size={size} speed={speed} {...props}>
      <PixiTexture
        width={256}
        height={256}
        attach="colorNode"
        frameloop="always"
        onPointerMissed={handlePointerMissed}
      >
        <PixiTextureContent
          speed={speed}
          initialColors={initialColors}
          ping={ping}
          onPingComplete={() => setPing(null)}
          mapClientToPixiRef={mapClientToPixiRef}
        />
      </PixiTexture>
    </SpinnyCube>
  );
}

interface PixiTextureContentProps {
  speed?: number;
  initialColors?: SpinnyStarColors;
  ping: Point | null;
  onPingComplete: () => void;
  mapClientToPixiRef: MutableRefObject<MapClientToPixi | null>;
}

function PixiTextureContent({
  speed,
  initialColors,
  ping,
  onPingComplete,
  mapClientToPixiRef,
}: PixiTextureContentProps) {
  const { mapClientToPixi } = usePixiViewContext();

  // Store the mapping function in the ref so parent can access it
  useEffect(() => {
    mapClientToPixiRef.current = mapClientToPixi;
  }, [mapClientToPixiRef, mapClientToPixi]);

  return (
    <>
      <SpinnyStar speed={speed} initialColors={initialColors} />
      {ping && (
        <CirclePing
          position={ping}
          color={threeBlue[400]}
          startRadius={5}
          endRadius={60}
          duration={600}
          strokeWidth={4}
          onComplete={onPingComplete}
        />
      )}
    </>
  );
}
