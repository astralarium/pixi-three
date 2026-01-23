import { type Container, Point } from "pixi.js";
import { createContext, type RefObject, useContext } from "react";
import { type Object3D, type Vector2 } from "three";

import {
  mapPixiToUv as mapPixiToUvUtil,
  mapUvToPixi as mapUvToPixiUtil,
  type UvToThreeResult,
} from "./bijections";
import { useViewport } from "./canvas-tree-context";
import { useCanvasView } from "./canvas-view-context";

/** @internal */
export interface PixiTextureContextValue {
  width: number;
  height: number;
  containerRef: RefObject<Container>;
  getAttachedObject: () => Object3D | undefined;
  /**
   * Hit tests a point against the Pixi container tree.
   * @param x - X coordinate in Pixi texture space
   * @param y - Y coordinate in Pixi texture space
   * @returns The Container that was hit, or null if no hit
   */
  hitTest: (x: number, y: number) => Container;
  /**
   * Maps Three.js UV coordinates (0-1) to Pixi texture coordinates.
   * @param uv - Three.js UV Vector2 (0-1 range)
   * @param point - Pixi Point to store the result
   */
  mapUvToPixi: (uv: Vector2, point: Point) => void;
  /**
   * Maps Pixi texture coordinates to Three.js UV coordinates (0-1).
   * @param point - Pixi Point in texture space
   * @param uv - Three.js UV Vector2 to store the result
   */
  mapPixiToParentUv: (point: Point, uv: Vector2) => void;
  /**
   * Maps Pixi texture coordinates to local coordinates on the parent Three mesh surface.
   * @param point - Pixi Point in texture space
   * @returns Array of results with position/normal in local mesh coords
   */
  mapPixiToParentThreeLocal: (point: Point) => UvToThreeResult[];
  /**
   * Maps Pixi texture coordinates to world coordinates in the parent Three scene.
   * @param point - Pixi Point in texture space
   * @returns Array of results with position/normal in parent world coords
   */
  mapPixiToParentThree: (point: Point) => UvToThreeResult[];
  /**
   * Maps Pixi texture coordinates to global Pixi parent coordinates.
   * @param point - Pixi Point in texture space
   * @param out - Pixi Point to store the result in global Pixi coords
   */
  mapPixiToParentPixi: (point: Point, out: Point) => void;
  /**
   * Maps local Pixi coordinates to CanvasView viewport coordinates.
   * @param localPoint - Pixi Point in local texture coordinates
   * @param viewportPoint - Pixi Point to store the viewport result
   */
  mapPixiToViewport: (localPoint: Point, viewportPoint: Point) => void;
  /**
   * Maps local Pixi coordinates to DOM client coordinates.
   * @param localPoint - Pixi Point in local texture coordinates
   * @param clientPoint - Pixi Point to store the client coordinates result
   */
  mapPixiToClient: (localPoint: Point, clientPoint: Point) => void;
  /**
   * Maps DOM client coordinates to local Pixi texture coordinates.
   * @param client - DOM client coordinates
   * @param pixiLocal - Pixi Point to store the local coordinates result
   */
  mapClientToPixi: (
    client: Point | { clientX: number; clientY: number },
    pixiLocal: Point,
  ) => void;
  /**
   * Maps viewport coordinates to local Pixi texture coordinates.
   * @param viewport - Viewport Point coordinates
   * @param pixiLocal - Pixi Point to store the local coordinates result
   */
  mapViewportToPixi: (viewport: Point, pixiLocal: Point) => void;
}

/** @internal */
export const PixiTextureContext = createContext<PixiTextureContextValue | null>(
  null,
);

/** @internal */
export function usePixiTextureContext() {
  const context = useContext(PixiTextureContext);
  if (context === null) {
    throw Error(
      "usePixiTextureContext() must be called within a <PixiTexture />",
    );
  }
  return context;
}

/** @internal */
export function usePixiTextureContextOptional() {
  return useContext(PixiTextureContext);
}

/**
 * Parent Three context for coordinate mapping from PixiTexture to parent Three scene.
 * Only available inside a PixiTexture context.
 *
 * @category hook
 * @expand
 */
export interface PixiViewParentThreeContextValue {
  /**
   * Maps Pixi texture coordinates to local coordinates on the parent Three mesh surface.
   * @param point - Pixi Point in texture space
   * @returns Array of results with position/normal in local mesh coords
   */
  mapPixiToParentThreeLocal: (point: Point) => UvToThreeResult[];
  /**
   * Maps Pixi texture coordinates to world coordinates in the parent Three scene.
   * @param point - Pixi Point in texture space
   * @returns Array of results with position/normal in parent world coords
   */
  mapPixiToParentThree: (point: Point) => UvToThreeResult[];
  /**
   * Maps Pixi texture coordinates to global Pixi parent coordinates.
   * @param point - Pixi Point in texture space
   * @param out - Pixi Point to store the result in global Pixi coords
   */
  mapPixiToParentPixi: (point: Point, out: Point) => void;
}

/**
 * Context value for Pixi view coordinate mapping.
 * Works in PixiTexture (inside ThreeScene) and CanvasView.
 *
 * @category hook
 * @expand
 */
export interface PixiViewContextValue {
  /** Width of the Pixi container */
  width: number;
  /** Height of the Pixi container */
  height: number;
  /**
   * Maps Three.js UV coordinates (0-1) to Pixi coordinates.
   * @param uv - Three.js UV Vector2 (0-1 range)
   * @param point - Pixi Point to store the result
   */
  mapUvToPixi: (uv: Vector2, point: Point) => void;
  /**
   * Maps Pixi coordinates to Three.js UV coordinates (0-1).
   * @param point - Pixi Point in local coordinates
   * @param uv - Three.js UV Vector2 to store the result
   */
  mapPixiToUv: (point: Point, uv: Vector2) => void;
  /**
   * Maps local Pixi coordinates to CanvasView viewport coordinates.
   * @param localPoint - Pixi Point in local coordinates
   * @param viewportPoint - Pixi Point to store the viewport result
   */
  mapPixiToViewport: (localPoint: Point, viewportPoint: Point) => void;
  /**
   * Maps local Pixi coordinates to DOM client coordinates.
   * @param localPoint - Pixi Point in local coordinates
   * @param clientPoint - Pixi Point to store the client coordinates result
   */
  mapPixiToClient: (localPoint: Point, clientPoint: Point) => void;
  /**
   * Maps DOM client coordinates to local Pixi coordinates.
   * @param client - DOM client coordinates
   * @param pixiLocal - Pixi Point to store the local coordinates result
   */
  mapClientToPixi: (
    client: Point | { clientX: number; clientY: number },
    pixiLocal: Point,
  ) => void;
  /**
   * Maps viewport coordinates to local Pixi coordinates.
   * @param viewport - Viewport Point coordinates
   * @param pixiLocal - Pixi Point to store the local coordinates result
   */
  mapViewportToPixi: (viewport: Point, pixiLocal: Point) => void;
  /**
   * Parent Three coordinate mapping functions.
   * Only available inside a PixiTexture context.
   */
  parentThree?: PixiViewParentThreeContextValue;
}

/**
 * Hook to access Pixi coordinate bijection functions.
 * Works in both PixiTexture (inside ThreeScene) and CanvasView contexts.
 *
 * When inside a PixiTexture, returns bijections for the texture dimensions.
 * When inside a CanvasView (but not PixiTexture), returns bijections for the canvas viewport.
 *
 * @category hook
 * @returns Bijection functions for coordinate mapping
 * @throws Error if called outside of a CanvasView
 */
export function usePixiViewContext(): PixiViewContextValue {
  const textureContext = useContext(PixiTextureContext);
  const viewport = useViewport();
  const { containerRef, mapViewportToClient, mapClientToViewport } =
    useCanvasView();

  if (textureContext) {
    return {
      width: textureContext.width,
      height: textureContext.height,
      mapUvToPixi: textureContext.mapUvToPixi,
      mapPixiToUv: textureContext.mapPixiToParentUv,
      mapPixiToViewport: textureContext.mapPixiToViewport,
      mapPixiToClient: textureContext.mapPixiToClient,
      mapClientToPixi: textureContext.mapClientToPixi,
      mapViewportToPixi: textureContext.mapViewportToPixi,
      parentThree: {
        mapPixiToParentThreeLocal: textureContext.mapPixiToParentThreeLocal,
        mapPixiToParentThree: textureContext.mapPixiToParentThree,
        mapPixiToParentPixi: textureContext.mapPixiToParentPixi,
      },
    };
  }

  const _viewportPoint = new Point();
  const bounds = { width: viewport.width, height: viewport.height };
  return {
    width: viewport.width,
    height: viewport.height,
    mapUvToPixi: (uv: Vector2, point: Point) =>
      mapUvToPixiUtil(uv, point, bounds),
    mapPixiToUv: (point: Point, uv: Vector2) =>
      mapPixiToUvUtil(point, uv, bounds),
    mapPixiToViewport: (localPoint: Point, viewportPoint: Point) =>
      containerRef.current.toGlobal(localPoint, viewportPoint),
    mapPixiToClient: (localPoint: Point, clientPoint: Point) => {
      containerRef.current.toGlobal(localPoint, _viewportPoint);
      mapViewportToClient(_viewportPoint, clientPoint);
    },
    mapClientToPixi: (
      client: Point | { clientX: number; clientY: number },
      pixiLocal: Point,
    ) => {
      mapClientToViewport(client, _viewportPoint);
      containerRef.current.toLocal(_viewportPoint, undefined, pixiLocal);
    },
    mapViewportToPixi: (viewportPoint: Point, pixiLocal: Point) => {
      containerRef.current.toLocal(viewportPoint, undefined, pixiLocal);
    },
  };
}
