import { type Instance } from "@react-three/fiber";
import { traverseFiber, useFiber } from "its-fine";
import { type RefObject } from "react";
import { Object3D } from "three";

/** @internal */
export function useAttachedObject(objectRef?: RefObject<Object3D>) {
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
