import { useRef, useState } from "react";
import { type ThreeElements, useFrame } from "@react-three/fiber";
import { type Mesh } from "three";
import { TextureNode } from "three/webgpu";
import { Graphics } from "pixi.js";
import { extend, useTick } from "@pixi/react";

import { PixiTexture } from "#pixi-texture";
import { usePixiTextureContext } from "#pixi-texture-context";

extend({ Graphics });

export function SpinnyCube(props: ThreeElements["mesh"]) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<Mesh>(null);
  // Hold state for hovered and clicked events
  const [_hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((_state, delta) => {
    ref.current!.rotation.x += delta;
    ref.current!.rotation.y += delta * 0.5;
  });

  const pixiTexture = useRef<TextureNode>(null!);

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicNodeMaterial>
        <PixiTexture
          ref={pixiTexture}
          width={clicked ? 64 : 128}
          height={clicked ? 64 : 128}
          attach="colorNode"
        >
          <SpinnyCubeTexture />
        </PixiTexture>
      </meshBasicNodeMaterial>
    </mesh>
  );
}

function randomColor() {
  return (
    0xff0000 * Math.random() +
    0x00ff00 * Math.random() +
    0x0000ff * Math.random()
  );
}

function SpinnyCubeTexture() {
  const [hover1, setHover1] = useState(false);
  const [hover2, setHover2] = useState(false);

  const star1 = useRef<Graphics>(null!);
  const star2 = useRef<Graphics>(null!);
  const star1_color1 = useRef(randomColor());
  const star1_color2 = useRef(randomColor());
  const star2_color1 = useRef(randomColor());
  const star2_color2 = useRef(randomColor());

  const { render } = usePixiTextureContext();
  const time = useRef(0);
  useTick((ticker) => {
    time.current += ticker.deltaMS;
    star1.current.rotation = ((time.current % 4000) / 4000) * 2 * Math.PI;
    star2.current.scale = Math.sin((time.current / 1000 / 2) * Math.PI) + 1.5;
    render();
  });

  function drawBackground(graphics: Graphics) {
    graphics.clear();
    graphics.rect(0, 0, 128, 128).fill(0x000000);
  }

  function drawStar1(graphics: Graphics) {
    graphics.clear();
    graphics.star(64, 64, 5, 32).stroke({
      width: 8,
      color: hover1 ? star1_color1.current : star1_color2.current,
    });
  }

  function drawStar2(graphics: Graphics) {
    graphics.clear();
    graphics.star(64, 64, 5, 32).stroke({
      width: 8,
      color: hover2 ? star2_color1.current : star2_color2.current,
    });
  }

  return (
    <>
      <pixiGraphics draw={drawBackground} />
      <pixiGraphics
        ref={star1}
        draw={drawStar1}
        origin={64}
        onPointerEnter={() => setHover1(true)}
        onPointerLeave={() => setHover1(false)}
      />
      <pixiGraphics
        ref={star2}
        draw={drawStar2}
        origin={64}
        onPointerEnter={() => setHover2(true)}
        onPointerLeave={() => setHover2(false)}
      />
    </>
  );
}
