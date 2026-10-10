import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import { useLazyRef } from "./use-lazy-ref";

/**
 * @category hook
 * @expand
 */
export interface CanvasViewSize {
  width: number;
  height: number;
  resolution: number;
}

interface CanvasTreeStore {
  subscribe: (callback: (size: CanvasViewSize) => void) => () => void;
  getSnapshot: () => CanvasViewSize;
  updateSnapshot: (update: Partial<CanvasViewSize>) => void;
  notifySubscribers: () => void;
}

/** @internal */
export interface CanvasTreeContextValue {
  store: CanvasTreeStore;
  invalidate: () => void;
}

/** @internal */
export const CanvasTreeContext = createContext<CanvasTreeContextValue | null>(
  null,
);

/**
 * Context value for a canvas tree node, stable while `invalidate` is.
 * @internal
 */
export function useCanvasTree(invalidate: () => void): CanvasTreeContextValue {
  const store = useCanvasTreeStore();
  return useMemo(() => ({ store, invalidate }), [store, invalidate]);
}

/**
 * Publishes a canvas tree node's size and requests a frame on change.
 * @internal
 */
export function useCanvasTreeSize(
  { store, invalidate }: CanvasTreeContextValue,
  { width, height, resolution }: CanvasViewSize,
) {
  useEffect(() => {
    store.updateSnapshot({ width, height, resolution });
    store.notifySubscribers();
    invalidate();
  }, [store, invalidate, width, height, resolution]);
}

function useCanvasTreeStore(): CanvasTreeStore {
  const storeRef = useLazyRef((): CanvasTreeStore => {
    const subscribers = new Set<(size: CanvasViewSize) => void>();
    let snapshot: CanvasViewSize = {
      width: 1,
      height: 1,
      resolution: window.devicePixelRatio,
    };
    return {
      subscribe(callback) {
        subscribers.add(callback);
        return () => {
          subscribers.delete(callback);
        };
      },
      getSnapshot() {
        return snapshot;
      },
      updateSnapshot(update) {
        snapshot = { ...snapshot, ...update };
      },
      notifySubscribers() {
        subscribers.forEach((callback) => {
          callback(snapshot);
        });
      },
    };
  });

  // Lazily-created singleton; stable for the component's lifetime
  // eslint-disable-next-line react-hooks/refs
  return storeRef.current;
}

/**
 * Hook for accessing the current viewport size from the nearest
 * {@link CanvasView}, {@link ThreeScene}, {@link ThreeRenderTexture}, {@link PixiTexture}.
 *
 * @category hook
 * @returns The current viewport size
 * @throws If called outside of a {@link CanvasView}
 */
export function useViewport(): CanvasViewSize {
  const context = useContext(CanvasTreeContext);
  if (context === null) {
    throw Error("useViewport() must be called within a <CanvasView />");
  }
  const size = useSyncExternalStore(
    context.store.subscribe,
    context.store.getSnapshot,
  );
  return size;
}

/**
 * The invalidate function for nearest canvas tree context.
 * This triggers a re-render when called.
 *
 * @category hook
 * @returns The invalidate function or noop with no context
 */
export function useInvalidate(): () => void {
  const context = useContext(CanvasTreeContext);
  return context?.invalidate ?? (() => {});
}

/**
 * Hook that invalidates every time the component renders.
 *
 * @category hook
 */
export function useEffectInvalidate() {
  const invalidate = useInvalidate();
  useEffect(invalidate);
}
