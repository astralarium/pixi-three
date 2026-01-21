import { PixiTexture, usePixiTextureEvents } from "@astralarium/pixi-three";
import { type ThreeElements } from "@react-three/fiber";
import { Container } from "pixi.js";
import { useRef } from "react";

import { SpinnyCube, type SpinnyCubeProps } from "./spinny-cube";
import { SpinnyStar, type SpinnyStarColors } from "./spinny-star";

export interface SpinnyCubeWithStarsProps extends SpinnyCubeProps {
  initialColors?: SpinnyStarColors;
}

export function SpinnyCubeWithStars({
  size,
  speed,
  initialColors,
  ...props
}: ThreeElements["mesh"] & SpinnyCubeWithStarsProps) {
  const containerRef = useRef<Container>(null!);

  const eventHandlers = usePixiTextureEvents(containerRef);

  return (
    <SpinnyCube size={size} speed={speed} {...props} {...eventHandlers}>
      <PixiTexture
        containerRef={containerRef}
        width={256}
        height={256}
        attach="colorNode"
        frameloop="always"
      >
        <SpinnyStar speed={speed} initialColors={initialColors} />
      </PixiTexture>
    </SpinnyCube>
  );
}
