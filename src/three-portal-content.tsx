import { type RootState, useFrame, useThree } from "@react-three/fiber";
import {
  type ReactNode,
  type Ref,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import {
  DepthTexture,
  FloatType,
  type PerspectiveCamera,
  RenderTarget,
  type RenderTargetOptions,
  type Texture,
} from "three";
import type WebGPUBackend from "three/src/renderers/webgpu/WebGPUBackend.js";
import { type PostProcessing, type WebGPURenderer } from "three/webgpu";

/** @internal */
export interface PortalContentProps {
  ref?: Ref<RenderTarget>;
  width: number;
  height: number;
  resolution: number;
  renderTargetOptions?: RenderTargetOptions;
  children: ReactNode;
  onTextureUpdate?: (x: GPUTexture) => unknown;
  postProcessing?: (x: RootState) => PostProcessing;
  /** Frameloop mode: "always" renders every frame, "demand" only renders when frameRequested is true */
  frameloop?: "always" | "demand";
  /** Function to check if a frame render is requested (for frameloop="demand") */
  isFrameRequested?: () => boolean;
  /** Callback to clear the frame request after rendering */
  signalFrame?: () => void;
}

/** @internal */
export function PortalContent({
  ref,
  width,
  height,
  resolution,
  renderTargetOptions,
  children,
  onTextureUpdate,
  postProcessing,
  frameloop = "always",
  isFrameRequested,
  signalFrame,
}: PortalContentProps) {
  const state = useThree();
  const backendData = (
    (state.renderer as unknown as WebGPURenderer).backend as WebGPUBackend & {
      data: WeakMap<Texture, { texture: GPUTexture }>;
    }
  ).data;
  const { camera, setSize, setDpr } = state;

  const renderTarget = useRef(
    (() => {
      const val = new RenderTarget(
        width * resolution,
        height * resolution,
        renderTargetOptions,
      );
      if (renderTargetOptions?.depthBuffer) {
        val.depthTexture = new DepthTexture(
          width * resolution,
          height * resolution,
          FloatType,
        );
      }
      return val;
    })(),
  );

  useImperativeHandle(ref, () => renderTarget.current, []);

  useEffect(() => {
    const val = renderTarget.current;
    return () => val.dispose();
  }, []);

  useLayoutEffect(() => {
    renderTarget.current.setSize(width * resolution, height * resolution);
    if (renderTarget.current.depthTexture) {
      renderTarget.current.depthTexture.dispose();
      renderTarget.current.depthTexture = new DepthTexture(
        width * resolution,
        height * resolution,
        FloatType,
      );
    }
    if (renderTargetOptions?.samples) {
      renderTarget.current.samples = renderTargetOptions.samples;
    }
  }, [width, height, resolution, renderTargetOptions?.samples]);

  const onResize = useEffectEvent(
    (width: number, height: number, resolution: number) => {
      // eslint-disable-next-line react-hooks/immutability
      (camera as PerspectiveCamera).aspect = width / height;
      camera.updateProjectionMatrix();
      setSize(width, height);
      setDpr(resolution);
    },
  );

  useEffect(() => {
    onResize(width, height, resolution);
  }, [width, height, resolution]);

  const postProcessor = postProcessing ? postProcessing(state) : null;
  useFrame(
    () => {
      if (frameloop === "always" || isFrameRequested?.()) {
        const renderer = state.renderer as unknown as WebGPURenderer;
        const oldAutoClear = renderer.autoClear;
        const oldXrEnabled = renderer.xr.enabled;
        const oldIsPresenting = renderer.xr.isPresenting;
        const oldRenderTarget = renderer.getRenderTarget();
        // eslint-disable-next-line react-hooks/immutability
        renderer.autoClear = true;
        renderer.xr.enabled = false;
        renderer.xr.isPresenting = false;
        renderer.setRenderTarget(renderTarget.current);
        if (postProcessor) {
          postProcessor.render();
        } else {
          renderer.render(state.scene, state.camera);
        }
        if (onTextureUpdate) {
          const textureData = backendData.get(renderTarget.current.texture)!;
          onTextureUpdate(textureData.texture);
        }
        renderer.setRenderTarget(oldRenderTarget);
        renderer.autoClear = oldAutoClear;
        renderer.xr.enabled = oldXrEnabled;
        renderer.xr.isPresenting = oldIsPresenting;
        signalFrame?.();
      }
    },
    { phase: "render" },
  );
  return <>{children}</>;
}
