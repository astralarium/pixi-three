import { type Container, type Point } from "pixi.js";
import { createContext, type RefObject, useContext } from "react";
import {
  type Intersection,
  type Object3D,
  type Plane,
  type Vector2,
  type Vector3,
} from "three";
import type tunnel from "tunnel-rat";

/**
 * Intersection result for Plane raycasts.
 * @category hook
 */
export interface PlaneIntersection {
  distance: number;
  point: Vector3;
  object: Plane;
}

/**
 * Infers the intersection result type from a raycast target.
 * - Plane → PlaneIntersection
 * - Object3D[] → Intersection with inferred item type
 * - Object3D → Intersection<T>
 * @internal
 */
export type RaycastResult<T> = T extends Plane
  ? PlaneIntersection
  : T extends (infer U)[]
    ? U extends Object3D
      ? Intersection<U>
      : Intersection<Object3D>
    : T extends Object3D
      ? Intersection<T>
      : Intersection<Object3D>;

/**
 * Parent Three context for coordinate mapping from ThreeScene to parent Three scene.
 * Only available inside a ThreeRenderTexture context.
 *
 * @category hook
 * @expand
 */
export interface ThreeViewParentThreeContextValue {
  /**
   * Maps a Three.js world position to UV coordinates.
   * @param vec3 - Three.js Vector3 in world coordinates
   * @param uv - Vector2 to store the UV result
   */
  mapThreeToParentUv: (vec3: Vector3, uv: Vector2) => void;
  /**
   * Maps a Three.js world position to local coordinates on the parent Three mesh surface.
   * @param vec3 - Three.js Vector3 in world coordinates
   * @param out - Vector3 to store the result in local mesh coords
   */
  mapThreeToParentThreeLocal: (vec3: Vector3, out: Vector3) => void;
  /**
   * Maps a Three.js world position to world coordinates in the parent Three scene.
   * @param vec3 - Three.js Vector3 in world coordinates
   * @param out - Vector3 to store the result in parent world coords
   */
  mapThreeToParentThree: (vec3: Vector3, out: Vector3) => void;
}

/**
 * Context value for Three view coordinate mapping.
 * Works in ThreeScene (inside CanvasView) and ThreeRenderTexture.
 *
 * @category hook
 * @expand
 */
export interface ThreeSceneContextValue {
  /** @internal */
  containerRef: RefObject<Container>;
  /** @internal */
  sceneTunnel: ReturnType<typeof tunnel>;
  /**
   * Maps a Pixi Point (in local sprite coordinates) to Three.js NDC coordinates (-1 to 1).
   * @param point - Pixi Point in local coordinates
   * @param ndc - Vector2 to store the NDC result
   */
  mapPixiToNdc: (point: Point, ndc: Vector2) => void;
  /**
   * Maps Three.js NDC coordinates (-1 to 1) to a Pixi Point (in local sprite coordinates).
   * @param ndc - Vector2 with NDC coordinates
   * @param point - Pixi Point to store the result
   */
  mapNdcToPixi: (ndc: Vector2, point: Point) => void;
  /**
   * Maps a Three.js world position to local Pixi sprite coordinates.
   * @param vec3 - Three.js Vector3 in world coordinates
   * @param point - Pixi Point to store the result in local sprite coords
   */
  mapThreeToParentPixiLocal: (vec3: Vector3, point: Point) => void;
  /**
   * Maps a Three.js world position to global Pixi parent coordinates.
   * @param vec3 - Three.js Vector3 in world coordinates
   * @param point - Pixi Point to store the result in global Pixi coords
   */
  mapThreeToParentPixi: (vec3: Vector3, point: Point) => void;
  /**
   * Maps a Three.js world position to CanvasView viewport coordinates.
   * @param vec3 - Three.js Vector3 in world coordinates
   * @param point - Pixi Point to store the viewport result
   */
  mapThreeToViewport: (vec3: Vector3, point: Point) => void;
  /**
   * Maps a Three.js world position to DOM client coordinates.
   * @param vec3 - Three.js Vector3 in world coordinates
   * @param clientPoint - Pixi Point to store the client coordinates result
   */
  mapThreeToClient: (vec3: Vector3, clientPoint: Point) => void;
  /**
   * Maps DOM client coordinates to NDC coordinates.
   * @param client - DOM client coordinates
   * @param ndc - Vector2 to store the NDC result
   */
  mapClientToNdc: (
    client: Point | { clientX: number; clientY: number },
    ndc: Vector2,
  ) => void;
  /**
   * Maps viewport coordinates to NDC coordinates.
   * @param viewport - Viewport Point coordinates
   * @param ndc - Vector2 to store the NDC result
   */
  mapViewportToNdc: (viewport: Point, ndc: Vector2) => void;
  /**
   * Raycasts from NDC coordinates through the camera.
   * @param ndc - NDC coordinates (-1 to 1)
   * @param target - Optional target object(s) or plane to intersect. Default, scene children.
   * @param recursive - Whether to recursively traverse children. Default true.
   * @returns Array of intersections
   */
  raycastNdc: <T extends Object3D | Plane | Object3D[] = Object3D>(
    ndc: Vector2,
    target?: T,
    recursive?: boolean,
  ) => RaycastResult<T>[];
  /**
   * Raycasts from DOM client coordinates through the camera.
   * @param client - DOM client coordinates (Point with x/y or clientX/clientY)
   * @param target - Optional target object(s) or plane to intersect. Default, scene children.
   * @param recursive - Whether to recursively traverse children. Default true.
   * @returns Array of intersections
   */
  raycastClient: <T extends Object3D | Plane | Object3D[] = Object3D>(
    client: Point | { clientX: number; clientY: number },
    target?: T,
    recursive?: boolean,
  ) => RaycastResult<T>[];
  /**
   * Raycasts from viewport coordinates through the camera.
   * @param viewport - Viewport Point coordinates
   * @param target - Optional target object(s) or plane to intersect. Default, scene children.
   * @param recursive - Whether to recursively traverse children. Default true.
   * @returns Array of intersections
   */
  raycastViewport: <T extends Object3D | Plane | Object3D[] = Object3D>(
    viewport: Point,
    target?: T,
    recursive?: boolean,
  ) => RaycastResult<T>[];
  /**
   * Parent Three coordinate mapping functions.
   * Only available inside a ThreeRenderTexture context.
   */
  parentThree?: ThreeViewParentThreeContextValue;
}

/** @internal */
export const ThreeSceneContext = createContext<ThreeSceneContextValue | null>(
  null,
);

/**
 * Hook to access the Three.js scene context.
 * Provides coordinate mapping utilities between Pixi and Three.js coordinate spaces.
 *
 * @category hook
 * @returns ThreeSceneContextValue with bijection functions for coordinate mapping
 * @throws Error if called outside of a ThreeScene component
 */
export function useThreeSceneContext() {
  const context = useContext(ThreeSceneContext);
  if (context === null) {
    throw Error(
      "useThreeSceneContext() must be called within a <ThreeScene />",
    );
  }
  return context;
}

/** @internal */
export function useThreeSceneContextOptional() {
  return useContext(ThreeSceneContext);
}
