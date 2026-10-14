import {
  CanvasView,
  PixiTexture,
  RenderContext,
  ThreeScene,
} from "@astralarium/pixi-three";
import { type ThreeElements, useFrame } from "@react-three/fiber";
import { createFileRoute } from "@tanstack/react-router";
import {
  createContext,
  type PropsWithChildren,
  type RefObject,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { type Mesh, type Object3D } from "three";
import { type TextureNode } from "three/webgpu";

import { DraggableCube } from "#components/draggable-cube";
import { FadeIn } from "#components/fade-in";
import { HoverBox } from "#components/hover-box";

import { Frame } from "./-frame";

export const Route = createFileRoute("/example/shared-texture")({
  component: SharedTextureExample,
});

function SharedTextureExample() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <Frame
      title="Shared Texture"
      subtitle="One Pixi texture with events across many meshes; drag the green cube"
      sourceUrl="https://github.com/astralarium/pixi-three/blob/main/examples/routes/example/shared-texture.tsx"
      canvasRef={canvasRef}
    >
      <RenderContext>
        <CanvasView alpha canvasRef={canvasRef}>
          <FadeIn>
            <ThreeScene>
              <SharedScreen>
                <Screen position={[-2, 0, 0]} speed={0.1} />
                <Screen position={[0, 0, 0]} speed={0.15} />
                <Screen position={[2, 0, 0]} speed={0.2} />
              </SharedScreen>
            </ThreeScene>
          </FadeIn>
        </CanvasView>
      </RenderContext>
    </Frame>
  );
}

/** Shared texture and the registry of meshes displaying it */
interface SharedScreenValue {
  texture: TextureNode;
  /** Meshes receiving events for the texture; each Screen registers itself */
  meshesRef: RefObject<Object3D[]>;
}

const SharedScreenContext = createContext<SharedScreenValue | null>(null);

function SharedScreen({ children }: PropsWithChildren) {
  const [texture, setTexture] = useState<TextureNode | null>(null);
  const meshesRef = useRef<Object3D[]>([]);

  return (
    <>
      {/* Unattached: each Screen's material reads the node from context */}
      <PixiTexture
        ref={setTexture}
        objectRef={meshesRef}
        width={460}
        height={460}
        frameloop="always"
      >
        <HoverBox x={20} y={20} scale={2} />
        <HoverBox x={240} y={20} scale={2} />
        <HoverBox x={20} y={240} scale={2} />
        <HoverBox x={240} y={240} scale={2} />
        <ThreeScene>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <DraggableCube color="#22c55e" />
        </ThreeScene>
      </PixiTexture>
      {texture && (
        <SharedScreenContext value={{ texture, meshesRef }}>
          {children}
        </SharedScreenContext>
      )}
    </>
  );
}

function Screen({
  speed = 1,
  ...props
}: ThreeElements["mesh"] & { speed?: number }) {
  const { texture, meshesRef } = use(SharedScreenContext)!;
  const meshRef = useRef<Mesh>(null!);

  useEffect(() => {
    const meshes = meshesRef.current;
    const mesh = meshRef.current;
    meshes.push(mesh);
    return () => {
      meshes.splice(meshes.indexOf(mesh), 1);
    };
  }, [meshesRef]);

  useFrame((_state, delta) => {
    meshRef.current.rotation.x += delta * 0.5 * speed;
    meshRef.current.rotation.y += delta * speed;
  });

  return (
    <mesh {...props} ref={meshRef}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshBasicNodeMaterial colorNode={texture} />
    </mesh>
  );
}
