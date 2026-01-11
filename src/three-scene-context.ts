import { type Container } from "pixi.js";
import { createContext, type RefObject, useContext } from "react";
import type tunnel from "tunnel-rat";

export interface ThreeSceneContextValue {
  containerRef: RefObject<Container>;
  sceneTunnel: ReturnType<typeof tunnel>;
}

export const ThreeSceneContext = createContext<ThreeSceneContextValue | null>(
  null,
);

export function useThreeSceneContext() {
  const context = useContext(ThreeSceneContext);
  if (context === null) {
    throw Error(
      "useThreeSceneContext() must be called within a <ThreeScene />",
    );
  }
  return context;
}
