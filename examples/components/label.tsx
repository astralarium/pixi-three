import { extend } from "@pixi/react";
import { Graphics, Text } from "pixi.js";

extend({ Graphics, Text });

const SIZE = 128;

function drawBackground(color: number) {
  return (graphics: Graphics) => {
    graphics.clear();
    graphics.rect(0, 0, SIZE, SIZE).fill({ color });
  };
}

/** 128×128 colored square with centered white text */
export function Label({ text, color }: { text: string; color: number }) {
  return (
    <>
      <pixiGraphics draw={drawBackground(color)} />
      <pixiText
        text={text}
        anchor={0.5}
        x={SIZE / 2}
        y={SIZE / 2}
        style={{ fill: 0xffffff, fontSize: 28 }}
      />
    </>
  );
}
