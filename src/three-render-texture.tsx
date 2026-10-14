import {
  type AttachType,
  type ComputeFunction,
  createPortal,
  type DomEvent,
  type RootState,
  useThree,
} from "@react-three/fiber";
import { fiberTunnel } from "fiber-tunnel";
import { Point } from "pixi.js";
import {
  type ReactNode,
  type Ref,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Mesh,
  Object3D,
  type Plane,
  Raycaster,
  type RenderTarget,
  type RenderTargetOptions,
  Scene,
  Texture,
  Vector2,
  Vector3,
} from "three";
import { texture } from "three/tsl";
import type { TextureNode } from "three/webgpu";

import {
  mapNdcToPixi as mapNdcToPixiUtil,
  mapNdcToUv,
  mapPixiToNdc as mapPixiToNdcUtil,
  mapThreeToNdc,
  mapUvToNdc,
  traceUvToThree,
  traceUvToThreeLocal,
} from "./bijections";
import { useViewport } from "./canvas-tree-context";
import {
  CanvasTreeContext,
  useCanvasTree,
  useCanvasTreeSize,
} from "./canvas-tree-context";
import { computeParent, useAttachedObjects } from "./three-fiber";
import { PortalContent } from "./three-portal-content";
import {
  type RaycastResult,
  ThreeSceneContext,
  useThreeSceneContext,
} from "./three-scene-context";
import { useRenderSchedule } from "./use-render-schedule";

/**
 * See {@link ThreeRenderTexture}.
 *
 * @category component
 * @expand
 */
export interface ThreeRenderTextureProps {
  /**
   * Render {@link https://threejs.org/docs/#TextureNode | TextureNode} Ref
   */
  ref?: Ref<TextureNode>;
  /**
   * RenderTarget Texture {@link https://r3f.docs.pmnd.rs/api/objects#attach | React Three Fiber attach}
   */
  attach?: AttachType;
  /**
   * Optional {@link https://threejs.org/docs/#Object3D | Object3D}s whose UVs map events onto this texture,
   * defaults to the nearest ancestor Object3D. Raycasts these objects alone; null hits nothing.
   * Pass an array to share this texture across many meshes.
   */
  objectRef?: RefObject<Object3D | Object3D[] | null>;
  /** Optional width of the texture, defaults to canvas parent bounds */
  width?: number;
  /** Optional height of the texture, defaults to canvas parent bounds */
  height?: number;
  /** Optional resolution of the texture, defaults to canvas parent resolution */
  resolution?: number;
  /**
   * Optional {@link https://threejs.org/docs/#RenderTarget | RenderTarget} options
   */
  options?: RenderTargetOptions;
  /** Optional event priority, defaults to 0 */
  eventPriority?: number;
  /** Optional frameloop, defaults to "always" */
  frameloop?: "always" | "demand";
  /**
   * Optional event compute for {@link https://r3f.docs.pmnd.rs/api/events | React Three Fiber events}, defaults to undefined
   */
  compute?: ComputeFunction;
  /** Optional FPS limit */
  fpsLimit?: number;
  /**
   * {@link https://r3f.docs.pmnd.rs/api/events | React Three Fiber}-style handler for pointer clicks that miss all Three.js objects in this render texture
   */
  onPointerMissed?: (event: MouseEvent) => void;
  /** Children will be rendered into a portal */
  children: ReactNode;
}

/**
 * A {@link https://threejs.org/docs/#RenderTarget | Three.js RenderTarget}
 * containing {@link https://r3f.docs.pmnd.rs | React Three Fiber} children.
 *
 * It must be inside a {@link ThreeScene} component.
 *
 * @category component
 * @param props - Component props
 * @example
 * ```tsx
 * <RenderContext>
 *   <CanvasView>
 *     <ThreeScene>
 *       <mesh>
 *         <boxGeometry />
 *         <meshBasicMaterial>
 *           <ThreeRenderTexture attach="map" width={512} height={512}>
 *             <SpinnyCube />
 *           </ThreeRenderTexture>
 *         </meshBasicMaterial>
 *       </mesh>
 *     </ThreeScene>
 *   </CanvasView>
 * </RenderContext>
 * ```
 */
export function ThreeRenderTexture({
  ref,
  attach,
  objectRef,
  width: widthProp,
  height: heightProp,
  resolution: resolutionProp,
  options,
  eventPriority: eventPriorityProp,
  frameloop: frameloopProp,
  compute,
  fpsLimit,
  onPointerMissed,
  children,
}: ThreeRenderTextureProps) {
  // Defaults live here: React Compiler skips destructured prop defaults
  const eventPriority = eventPriorityProp ?? 0;
  const frameloop = frameloopProp ?? "always";
  const size = useViewport();
  const [scene] = useState(() => new Scene());

  const width = widthProp ?? size.width;
  const height = heightProp ?? size.height;
  const resolution = resolutionProp ?? size.resolution;
  const { isFrameRequested, invalidate, signalFrame } = useRenderSchedule({
    fpsLimit,
  });
  const canvasTree = useCanvasTree(invalidate);
  useCanvasTreeSize(canvasTree, { width, height, resolution });

  const parentThreeSceneContext = useThreeSceneContext();
  const { containerRef } = parentThreeSceneContext;
  const [textureNode] = useState(() => texture(new Texture()));
  // Same node; the render target callback swaps its `value` through this ref
  const textureRef = useRef(textureNode);
  const { camera } = useThree();

  const getAttachedObjects = useAttachedObjects(objectRef);

  useImperativeHandle(ref, () => textureNode);

  useEffect(
    () => () => {
      textureNode.dispose();
    },
    [textureNode],
  );

  const bounds = { width, height };

  function mapPixiToNdc(point: Point, out?: Vector2) {
    return mapPixiToNdcUtil(point, bounds, out);
  }

  function mapNdcToPixi(ndc: Vector2, out?: Point) {
    return mapNdcToPixiUtil(ndc, bounds, out);
  }

  const _ndc = new Vector2();
  const _uv = new Vector2();
  const [raycaster] = useState(() => new Raycaster());

  function mapThreeToParentUv(vec3: Vector3, out?: Vector2) {
    // Project world vec3 through camera to NDC
    mapThreeToNdc(vec3, camera, _ndc);

    // Map NDC to UV
    return mapNdcToUv(_ndc, out);
  }

  function traceThreeToParentThreeLocal(vec3: Vector3) {
    mapThreeToParentUv(vec3, _uv);

    return getAttachedObjects().flatMap((object) =>
      object instanceof Mesh ? traceUvToThreeLocal(_uv, object) : [],
    );
  }

  function traceThreeToParentThree(vec3: Vector3) {
    mapThreeToParentUv(vec3, _uv);

    return getAttachedObjects().flatMap((object) =>
      object instanceof Mesh ? traceUvToThree(_uv, object) : [],
    );
  }

  function mapThreeToParentPixiLocal(vec3: Vector3, out?: Point) {
    const [trace] = traceThreeToParentThree(vec3);
    if (!trace) return null;
    return parentThreeSceneContext.mapThreeToParentPixiLocal(
      trace.position,
      out,
    );
  }

  function mapThreeToParentPixi(vec3: Vector3, out?: Point) {
    const [trace] = traceThreeToParentThree(vec3);
    if (!trace) return null;
    return parentThreeSceneContext.mapThreeToParentPixi(trace.position, out);
  }

  /** Projects every parent trace of vec3; `out` holds the first point */
  function projectTraces(
    vec3: Vector3,
    out: Point | undefined,
    project: (vec: Vector3, out?: Point) => Point[],
  ) {
    const points: Point[] = [];
    for (const trace of traceThreeToParentThree(vec3)) {
      points.push(
        ...project(trace.position, points.length === 0 ? out : undefined),
      );
    }
    return points;
  }

  function mapThreeToViewport(vec3: Vector3, out?: Point) {
    return projectTraces(vec3, out, parentThreeSceneContext.mapThreeToViewport);
  }

  function mapThreeToClient(vec3: Vector3, out?: Point) {
    return projectTraces(vec3, out, parentThreeSceneContext.mapThreeToClient);
  }

  function mapClientToNdc(
    client: Point | { clientX: number; clientY: number },
    out?: Vector2,
  ) {
    const intersections = parentThreeSceneContext.raycastClient(
      client,
      getAttachedObjects(),
      false,
    );
    const uv = intersections[0]?.uv;
    if (uv) {
      return mapUvToNdc(uv, out);
    }
    return null;
  }

  function mapViewportToNdc(viewport: Point, out?: Vector2) {
    const intersections = parentThreeSceneContext.raycastViewport(
      viewport,
      getAttachedObjects(),
      false,
    );
    const uv = intersections[0]?.uv;
    if (uv) {
      return mapUvToNdc(uv, out);
    }
    return null;
  }

  function raycastNdc<T extends Object3D | Plane | Object3D[] = Object3D>(
    ndc: Vector2,
    target?: T,
    recursive?: boolean,
  ): RaycastResult<T>[] {
    raycaster.setFromCamera(ndc, camera);
    if (target) {
      if (Array.isArray(target)) {
        return raycaster.intersectObjects(
          target,
          recursive,
        ) as RaycastResult<T>[];
      } else if ("isPlane" in target) {
        const point = new Vector3();
        const hit = raycaster.ray.intersectPlane(target as Plane, point);
        if (hit) {
          return [
            {
              distance: raycaster.ray.origin.distanceTo(point),
              point,
              object: target,
            } as RaycastResult<T>,
          ];
        }
        return [];
      } else {
        return raycaster.intersectObject(
          target,
          recursive,
        ) as RaycastResult<T>[];
      }
    }
    return raycaster.intersectObjects(
      scene.children,
      recursive,
    ) as RaycastResult<T>[];
  }

  function raycastClient<T extends Object3D | Plane | Object3D[] = Object3D>(
    client: Point | { clientX: number; clientY: number },
    target?: T,
    recursive?: boolean,
  ): RaycastResult<T>[] {
    if (!mapClientToNdc(client, _ndc)) {
      return [];
    }
    return raycastNdc(_ndc, target, recursive);
  }

  function raycastViewport<T extends Object3D | Plane | Object3D[] = Object3D>(
    viewport: Point,
    target?: T,
    recursive?: boolean,
  ): RaycastResult<T>[] {
    if (!mapViewportToNdc(viewport, _ndc)) {
      return [];
    }
    return raycastNdc(_ndc, target, recursive);
  }

  function computeFn(event: DomEvent, state: RootState, previous?: RootState) {
    if (!previous) {
      return false;
    }
    if (!computeParent(event, previous)) {
      return false;
    }
    const [intersection] = previous.raycaster.intersectObjects(
      getAttachedObjects(),
      false,
    );
    if (!intersection) {
      return false;
    }
    const uv = intersection.uv;
    if (!uv) {
      return false;
    }
    mapUvToNdc(uv, state.pointer);
    state.raycaster.setFromCamera(state.pointer, state.camera);
  }

  const [sceneTunnel] = useState(() => fiberTunnel());

  return (
    <>
      <CanvasTreeContext value={canvasTree}>
        <ThreeSceneContext
          value={{
            containerRef,
            sceneTunnel,
            mapPixiToNdc,
            mapNdcToPixi,
            mapThreeToParentPixiLocal,
            mapThreeToParentPixi,
            mapThreeToViewport,
            mapThreeToClient,
            mapClientToNdc,
            mapViewportToNdc,
            raycastNdc,
            raycastClient,
            raycastViewport,
            parentThree: {
              mapThreeToParentUv,
              traceThreeToParentThreeLocal,
              traceThreeToParentThree,
            },
          }}
        >
          {createPortal(
            <PortalContent
              ref={(renderTarget: RenderTarget | null) => {
                if (renderTarget) {
                  textureRef.current.value = renderTarget.texture;
                }
              }}
              width={width}
              height={height}
              resolution={resolution}
              renderTargetOptions={options}
              frameloop={frameloop}
              isFrameRequested={isFrameRequested}
              signalFrame={signalFrame}
            >
              {children}
              <sceneTunnel.Out />
              {/* Without an element that receives pointer events state.pointer will always be 0/0 */}
              <group onPointerOver={() => null} />
            </PortalContent>,
            scene,
            {
              events: {
                compute: compute ?? computeFn,
                priority: eventPriority,
              },
              size: { top: 0, left: 0, width, height },
              onPointerMissed,
            },
          )}
        </ThreeSceneContext>
      </CanvasTreeContext>
      <primitive object={textureNode} attach={attach} />
    </>
  );
}
