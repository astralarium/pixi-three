import {
  type DomEvent,
  type Instance,
  type RootState,
} from "@react-three/fiber";
import { traverseFiber, useFiber } from "its-fine";
import { type RefObject } from "react";
import { type Camera, Object3D } from "three";

/**
 * Resolves the objects whose UVs map events onto a texture:
 * `objectRef` when given, else the nearest ancestor Object3D.
 * @internal
 */
export function useAttachedObjects(
  objectRef?: RefObject<Object3D | Object3D[] | null>,
) {
  const fiber = useFiber();
  return function getAttachedObjects(): Object3D[] {
    if (objectRef) {
      const current = objectRef.current;
      if (current == null) return [];
      return Array.isArray(current) ? current : [current];
    }
    const object = (
      traverseFiber(fiber, true, (node) => {
        return (
          (node.stateNode as Instance<unknown>)?.object instanceof Object3D
        );
      })?.stateNode as Instance<Object3D> | undefined
    )?.object;
    return object ? [object] : [];
  };
}

/**
 * Runs the parent root's compute at most once per event.
 *
 * Shares r3f's per-event cache: r3f resets `raycaster.camera` to undefined on
 * roots owning interactive objects; null marks a miss. Requires the parent root
 * to own an interactive object, as pixi-three portals do.
 *
 * @returns Whether the parent raycaster holds this event's ray
 * @internal
 */
export function computeParent(event: DomEvent, previous: RootState) {
  const raycaster = previous.raycaster as { camera: Camera | null | undefined };
  if (raycaster.camera === undefined) {
    previous.events.compute?.(
      event,
      previous,
      previous.previousRoot?.getState(),
    );
    raycaster.camera ??= null;
  }
  return raycaster.camera !== null;
}
