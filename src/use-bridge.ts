import { traverseFiber, useContextMap, useFiber } from "its-fine";
import { type Context, StrictMode, useMemo, useState } from "react";

/**
 * Renderer Context and StrictMode captured from a primary renderer.
 * @internal
 */
export interface BridgeValue {
  /** Ancestor contexts paired with their current values */
  contexts: readonly (readonly [Context<unknown>, unknown])[];
  /** Whether the primary renderer renders this subtree in StrictMode */
  strict: boolean;
}

/**
 * Captures renderer Context and StrictMode for a {@link Bridge}.
 * Identity changes only when a bridged value changes.
 * @internal
 */
export function useBridge(): BridgeValue {
  // its-fine mutates one ContextMap in place each render
  "use no memo";
  const fiber = useFiber();
  const contexts = Array.from(useContextMap());
  const [snapshot, setSnapshot] = useState(contexts);
  if (!sameContexts(snapshot, contexts)) {
    setSnapshot(contexts);
  }
  const strict = useMemo(
    () => !!traverseFiber(fiber, true, (node) => node.type === StrictMode),
    [fiber],
  );
  return useMemo(() => ({ contexts: snapshot, strict }), [snapshot, strict]);
}

function sameContexts(a: BridgeValue["contexts"], b: BridgeValue["contexts"]) {
  return (
    a.length === b.length &&
    a.every(
      ([context, value], i) => context === b[i][0] && Object.is(value, b[i][1]),
    )
  );
}
