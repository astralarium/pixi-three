import { FiberProvider } from "its-fine";
import {
  Fragment,
  type PropsWithChildren,
  type ReactNode,
  StrictMode,
} from "react";

import { type BridgeValue } from "./use-bridge";

/**
 * Provides a {@link BridgeValue} to a secondary renderer.
 * @internal
 */
export function Bridge({
  contexts,
  strict,
  children,
}: PropsWithChildren<BridgeValue>) {
  const Root = strict ? StrictMode : Fragment;
  return (
    <Root>
      <FiberProvider>
        {contexts.reduce<ReactNode>(
          (node, [Context, value]) => (
            <Context value={value}>{node}</Context>
          ),
          children,
        )}
      </FiberProvider>
    </Root>
  );
}
