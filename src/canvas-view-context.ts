import { type Container } from "pixi.js";
import { createContext, type RefObject, useContext } from "react";

export interface CanvasViewContextValue {
  canvasRef: RefObject<HTMLCanvasElement>;
  containerRef: RefObject<Container>;
}

export const CanvasViewContext = createContext<CanvasViewContextValue | null>(
  null,
);

export function useCanvasView() {
  const context = useContext(CanvasViewContext);
  if (context === null) {
    throw Error(
      "useCanvasViewContext() must be called within a <CanvasViewContent />",
    );
  }
  return context;
}
