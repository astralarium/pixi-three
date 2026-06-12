import { useEffect, useLayoutEffect } from "react";
import {
  DepthTexture,
  FloatType,
  RenderTarget,
  type RenderTargetOptions,
} from "three";

import { useLazyRef } from "./use-lazy-ref";

/**
 * @internal
 *
 * Hook for creating and managing a {@link https://threejs.org/docs/#RenderTarget | Three.js RenderTarget}
 * with explicit pixel dimensions.
 *
 * @param pixelWidth - Target width in physical pixels
 * @param pixelHeight - Target height in physical pixels
 * @param options - Optional {@link https://threejs.org/docs/#RenderTarget | RenderTarget} options
 * @returns Ref to the RenderTarget
 * @category hook
 */
export function useRenderTargetSized(
  pixelWidth: number,
  pixelHeight: number,
  options?: RenderTargetOptions,
) {
  const renderTargetRef = useLazyRef(() => {
    const val = new RenderTarget(pixelWidth, pixelHeight, options);
    if (options?.depthBuffer) {
      val.depthTexture = new DepthTexture(pixelWidth, pixelHeight, FloatType);
    }
    return val;
  });

  useLayoutEffect(() => {
    renderTargetRef.current.setSize(pixelWidth, pixelHeight);
    // setSize does not resize the depth texture; recreate it, but only on a
    // real dimension change so mount and samples-only updates don't churn it
    const depthTexture = renderTargetRef.current.depthTexture;
    if (
      depthTexture &&
      (depthTexture.image.width !== pixelWidth ||
        depthTexture.image.height !== pixelHeight)
    ) {
      depthTexture.dispose();
      renderTargetRef.current.depthTexture = new DepthTexture(
        pixelWidth,
        pixelHeight,
        FloatType,
      );
    }
    if (options?.samples !== undefined) {
      renderTargetRef.current.samples = options.samples;
    }
  }, [pixelWidth, pixelHeight, options?.samples, renderTargetRef]);

  useEffect(() => {
    const val = renderTargetRef.current;
    return () => val.dispose();
  }, [renderTargetRef]);

  return renderTargetRef;
}
