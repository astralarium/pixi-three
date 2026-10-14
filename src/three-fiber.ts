import {
  type DomEvent,
  type Instance,
  type RootState,
} from "@react-three/fiber";
import { traverseFiber, useFiber } from "its-fine";
import { type RefObject } from "react";
import { type Camera, Object3D } from "three";

/** @internal */
export function useAttachedObject(objectRef?: RefObject<Object3D | null>) {
  const fiber = useFiber();
  return function getAttachedObject() {
    if (objectRef?.current) {
      return objectRef.current;
    } else {
      return (
        traverseFiber(fiber, true, (node) => {
          return (
            (node.stateNode as Instance<unknown>)?.object instanceof Object3D
          );
        })?.stateNode as Instance<Object3D> | undefined
      )?.object;
    }
  };
}

/**
 * @internal
 * Runs the parent root's compute at most once per event.
 *
 * Shares r3f's per-event cache: r3f resets `raycaster.camera` to undefined on
 * roots owning interactive objects; null marks a miss. Requires the parent root
 * to own an interactive object, as pixi-three portals do.
 *
 * @returns Whether the parent raycaster holds this event's ray
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
