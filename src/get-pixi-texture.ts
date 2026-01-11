import {
  type Container,
  type GpuTextureSystem,
  type WebGLRenderer,
  type WebGPURenderer,
} from "pixi.js";
import { ExternalTexture } from "three";

export type PixiRenderer = WebGPURenderer | WebGLRenderer;

export interface PixiTextureProps {
  renderer: WebGPURenderer | WebGLRenderer;
  container: Container;
}

export function getPixiTexture({ renderer, container }: PixiTextureProps) {
  const renderTexture = renderer.generateTexture({
    target: container,
    textureSourceOptions: {
      autoGenerateMipmaps: true,
    },
  });
  const gpuTexture = (renderer.texture as GpuTextureSystem).getGpuSource(
    renderTexture._source,
  );
  const texture = new ExternalTexture(gpuTexture);
  return texture;
}
