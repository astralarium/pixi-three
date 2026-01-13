import { type useApplication } from "@pixi/react";
import { createContext, type RefObject, useContext } from "react";
import type tunnel from "tunnel-rat";

import { type PixiDomEventSystem } from "./pixi-dom-event-system";
import { type PixiThreeEventSystem } from "./pixi-three-event-system";

/**
 * @internal
 */
export interface RenderContextValue {
  tunnel: ReturnType<typeof tunnel>;
  eventContainer: RefObject<HTMLDivElement>;
  pixiDomEvents: PixiDomEventSystem | null;
  threeSceneTunnel: ReturnType<typeof tunnel>;
  pixiTextureTunnel: ReturnType<typeof tunnel>;
  pixiTextureEvents: PixiThreeEventSystem | null;
  setPixiApplication: (x: ReturnType<typeof useApplication> | null) => void;
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
