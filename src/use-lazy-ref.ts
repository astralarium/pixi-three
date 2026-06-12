import { type RefObject, useRef } from "react";

/**
 * A ref initialized lazily on first render.
 * StrictMode-safe: `init` runs at most once per component instance.
 *
 * @internal
 */
export function useLazyRef<T>(init: () => T): RefObject<T> {
  const ref = useRef<T | null>(null);
  if (ref.current === null) {
    ref.current = init();
  }
  return ref as RefObject<T>;
}
