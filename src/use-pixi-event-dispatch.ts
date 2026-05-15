import {
  type Container,
  EventBoundary,
  FederatedPointerEvent,
  FederatedWheelEvent,
  Point,
} from "pixi.js";
import { createContext, type RefObject, useContext, useState } from "react";

import {
  type PixiRootEvents,
  type PixiSyntheticEventSystem,
} from "./pixi-synthetic-event-system";
import { useRenderContext } from "./render-context-hooks";

/**
 * Context to pass fresh pixiEvents to PixiTextureInternal, bypassing Bridge's stale capture.
 * Bridge captures context values at render time, but pixiEvents is set asynchronously
 * after Application initializes. This context is unknown to Bridge so it won't be overridden.
 * @internal
 */
export const PixiEventsContext = createContext<PixiSyntheticEventSystem | null>(
  null,
);

/** @internal */
export interface UsePixiEventDispatchOptions {
  containerRef: RefObject<Container>;
  canvasRef: RefObject<HTMLCanvasElement | HTMLElement>;
}

/** @internal */
export type UsePixiEventDispatchResult = (
  event: Event,
  point: Point | null,
  onPointerMissed?: (event: PointerEvent) => void,
) => void;

/**
 * Hook that manages Pixi event dispatch infrastructure.
 * Creates and manages the EventBoundary and root federated events,
 * and provides a dispatchEvent function for forwarding events to Pixi containers.
 *
 * @internal
 * @param options - The container and canvas refs
 * @returns The dispatch function
 */
export function usePixiEventDispatch({
  containerRef,
  canvasRef,
}: UsePixiEventDispatchOptions): UsePixiEventDispatchResult {
  // Try PixiEventsContext first (for PixiTexture), fall back to RenderContext (for CanvasView)
  const pixiEventsFromContext = useContext(PixiEventsContext);
  const { pixiEvents: pixiEventsFromRenderContext } = useRenderContext();
  const pixiEvents = pixiEventsFromContext ?? pixiEventsFromRenderContext;

  const [eventBoundary] = useState(() => new EventBoundary());
  const [rootEvents] = useState<PixiRootEvents>(() => ({
    pointerEvent: new FederatedPointerEvent(eventBoundary),
    wheelEvent: new FederatedWheelEvent(eventBoundary),
  }));

  function dispatchEvent(
    event: Event,
    point: Point | null,
    onPointerMissed?: (event: PointerEvent) => void,
  ) {
    if (!pixiEvents || !containerRef.current || !canvasRef.current) return;
    pixiEvents.dispatch(
      event,
      point,
      containerRef.current,
      eventBoundary,
      rootEvents,
      canvasRef.current as HTMLElement,
      onPointerMissed,
    );
  }

  return dispatchEvent;
}
