import { type ThreeElements, useFrame } from "@react-three/fiber";
import {
  type ReactNode,
  type Ref,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { type Mesh } from "three";

export interface SpinnyCubeProps {
  size?: number;
  speed?: number;
  children?: ReactNode;
}

export function SpinnyCube({
  size = 1,
  speed = 1,
  children,
  ref,
  ...props
}: ThreeElements["mesh"] & SpinnyCubeProps) {
  const meshRef = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useImperativeHandle(ref as Ref<Mesh>, () => meshRef.current!, []);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * (hovered ? 0.2 : 1) * speed;
      meshRef.current.rotation.y += delta * 0.5 * (hovered ? 0.2 : 1) * speed;
    }
  });

  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1 * size, 1 * size, 1 * size]} />
      <meshBasicNodeMaterial>{children}</meshBasicNodeMaterial>
    </mesh>
  );
}
