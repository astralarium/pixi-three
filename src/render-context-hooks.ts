import type { FiberTunnel } from "fiber-tunnel";
import { createContext, type RefObject, useContext } from "react";

import { type PixiSyntheticEventSystem } from "./pixi-synthetic-event-system";

/**
 * @internal
 */
export interface RenderContextValue {
  tunnel: FiberTunnel;
  eventContainer: RefObject<HTMLDivElement>;
  pixiEvents: PixiSyntheticEventSystem | null;
  threeSceneTunnel: FiberTunnel;
  pixiTextureTunnel: FiberTunnel;
}

/**
 * @internal
 */
export const RenderContextValue = createContext<RenderContextValue | null>(
  null,
);

/**
 * @internal
 */
export function useRenderContext() {
  const context = useContext(RenderContextValue);
  if (context === null) {
    throw Error("useRenderContext() must be called within a <RenderContext />");
  }
  return context;
}
