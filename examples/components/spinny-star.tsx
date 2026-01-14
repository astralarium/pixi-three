import { useViewport } from "@astralarium/pixi-three";
import { extend, useTick } from "@pixi/react";
import { Graphics, Point } from "pixi.js";
import { useRef, useState } from "react";

extend({ Graphics });

function randomColor() {
  return (
    0xff0000 * Math.random() +
    0x00ff00 * Math.random() +
    0x0000ff * Math.random()
  );
}

export interface SpinnyStarProps {
  speed?: number;
}

export function SpinnyStar({ speed = 1 }: SpinnyStarProps) {
  const size = useViewport();
  const center = new Point(size.width / 2, size.height / 2);
  const scale = Math.min(size.width, size.height);
  const radius = scale / 4;
  const width = scale / 16;

  const [hover1, setHover1] = useState(false);
  const [hover2, setHover2] = useState(false);

  const star1 = useRef<Graphics>(null!);
  const star2 = useRef<Graphics>(null!);
  const star1_color1 = useRef(randomColor());
  const star1_color2 = useRef(randomColor());
  const star2_color1 = useRef(randomColor());
  const star2_color2 = useRef(randomColor());

  const time1 = useRef(0);
  const time2 = useRef(0);
  useTick((ticker) => {
    time1.current += ticker.deltaMS * (hover1 ? 0.2 : 1) * speed;
    time2.current += ticker.deltaMS * (hover2 ? 0.2 : 1) * speed;
    star1.current.rotation = ((time1.current % 4000) / 4000) * 2 * Math.PI;
    star2.current.scale = Math.sin((time2.current / 1000 / 2) * Math.PI) + 1.5;
  });

  function drawStar1(graphics: Graphics) {
    graphics.clear();
    graphics.star(center.x, center.y, 5, radius).stroke({
      width,
      color: star1_color1.current,
    });
  }
  function drawStar1_hover(graphics: Graphics) {
    graphics.clear();
    graphics.star(center.x, center.y, 5, radius).stroke({
      width,
      color: star1_color2.current,
    });
  }

  function drawStar2(graphics: Graphics) {
    graphics.clear();
    graphics.star(center.x, center.y, 5, radius).stroke({
      width,
      color: star2_color1.current,
    });
  }

  function drawStar2_hover(graphics: Graphics) {
    graphics.clear();
    graphics.star(center.x, center.y, 5, radius).stroke({
      width,
      color: star2_color2.current,
    });
  }

  return (
    <>
      <pixiGraphics
        ref={star1}
        eventMode="static"
        draw={hover1 ? drawStar1_hover : drawStar1}
        origin={center}
        onPointerEnter={() => setHover1(true)}
        onPointerLeave={() => setHover1(false)}
      />
      <pixiGraphics
        ref={star2}
        eventMode="static"
        draw={hover2 ? drawStar2_hover : drawStar2}
        origin={center}
        onPointerEnter={() => setHover2(true)}
        onPointerLeave={() => setHover2(false)}
      />
    </>
  );
}
