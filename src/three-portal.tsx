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

export interface PortalProps {
  ref?: Ref<RenderTarget>;
  frames: number;
  renderPriority: number;
  width: number;
  height: number;
  resolution: number;
  renderTargetOptions?: RenderTargetOptions;
  children: ReactNode;
  onTextureUpdate?: (x: GPUTexture) => unknown;
  postProcessing?: (x: RootState) => PostProcessing;
}

export function Portal({
  ref,
  frames,
  renderPriority,
  width,
  height,
  resolution,
  renderTargetOptions,
  children,
  onTextureUpdate,
  postProcessing,
}: PortalProps) {
  const state = useThree();
  const backendData = (
    (state.gl as unknown as WebGPURenderer).backend as WebGPUBackend & {
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
      (camera as PerspectiveCamera).aspect = width / height;
      camera.updateProjectionMatrix();
      setSize(width, height);
      setDpr(resolution);
    },
  );

  useEffect(() => {
    onResize(width, height, resolution);
  }, [width, height, resolution]);

  let count = 0;
  const postProcessor = postProcessing ? postProcessing(state) : null;
  useFrame(() => {
    if (frames === Infinity || count < frames) {
      const gl = state.gl as unknown as WebGPURenderer;
      const oldAutoClear = gl.autoClear;
      const oldXrEnabled = gl.xr.enabled;
      const oldIsPresenting = gl.xr.isPresenting;
      const oldRenderTarget = gl.getRenderTarget();
      gl.autoClear = true;
      gl.xr.enabled = false;
      gl.xr.isPresenting = false;
      gl.setRenderTarget(renderTarget.current);
      if (postProcessor) {
        postProcessor.render();
      } else {
        gl.render(state.scene, state.camera);
      }
      if (onTextureUpdate) {
        const textureData = backendData.get(renderTarget.current.texture)!;
        onTextureUpdate(textureData.texture);
      }
      gl.setRenderTarget(oldRenderTarget);
      gl.autoClear = oldAutoClear;
      gl.xr.enabled = oldXrEnabled;
      gl.xr.isPresenting = oldIsPresenting;
      count++;
    }
  }, renderPriority);
  return <>{children}</>;
}
