import { type Container, type Point } from "pixi.js";
import { createContext, type RefObject, useContext } from "react";

/** @internal */
export interface CanvasViewContextValue {
  canvasRef: RefObject<HTMLCanvasElement>;
  containerRef: RefObject<Container>;
  mapViewportToClient: (viewportPoint: Point, out?: Point) => Point;
  mapClientToViewport: (
    client: Point | { clientX: number; clientY: number },
    out?: Point,
  ) => Point;
}

/** @internal */
export const CanvasViewContext = createContext<CanvasViewContextValue | null>(
  null,
);

/** @internal */
export function useCanvasView() {
  const context = useContext(CanvasViewContext);
  if (context === null) {
    throw Error("useCanvasView() must be called within a <CanvasView />");
  }
  return context;
}
