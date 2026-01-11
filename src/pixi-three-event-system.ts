import {
  type DomEvent,
  type EventHandlers,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  type Bounds,
  type Container,
  type EventBoundary,
  type Point,
  Rectangle,
  type Renderer,
} from "pixi.js";
import type { RefObject } from "react";
import { type Vector2 } from "three";

import {
  type EventGuard,
  MISSED_POINT,
  PixiSyntheticEventSystem,
} from "./pixi-synthetic-event-system";

export interface PixiThreeEventBindOptions {
  container: RefObject<Container>;
  eventBoundary?: string | EventBoundary;
  guard?: EventGuard<ThreeEvent<DomEvent>, EventHandlers>;
}

/**
 * Event system for Three.js integration with Pixi.js.
 * Extends PixiSyntheticEventSystem to provide UV-based coordinate mapping
 * from Three.js raycasting intersections.
 */
export class PixiThreeEventSystem extends PixiSyntheticEventSystem<
  ThreeEvent<DomEvent>,
  EventHandlers
> {
  constructor(renderer: Renderer) {
    super(renderer);
  }

  /**
   * Override mapEventToPoint to use Three.js-specific UV mapping.
   * Maps a Three.js event (with intersection data) to a point in Pixi space.
   * @param point - The point to write the result to
   * @param event - The source event (ThreeEvent with intersection data)
   * @param eventBoundary - The event boundary context
   */
  protected override mapEventToPoint(
    point: Point,
    event: Event,
    eventBoundary: EventBoundary,
  ): void {
    const threeEvent = event as unknown as ThreeEvent<DomEvent>;
    const [intersection] = threeEvent.intersections;
    if (!intersection) {
      point.copyFrom(MISSED_POINT);
      return;
    }
    const uv = intersection.uv;
    if (!uv) {
      point.copyFrom(MISSED_POINT);
      return;
    }
    return this.mapUvToPoint(
      point,
      uv,
      eventBoundary.rootTarget.hitArea instanceof Rectangle
        ? eventBoundary.rootTarget.hitArea
        : eventBoundary.rootTarget.getBounds(),
    );
  }

  /**
   * Maps UV coordinates to Pixi pixel coordinates.
   * @param point - The point to write the result to
   * @param uv - UV coordinates (0-1 range)
   * @param bounds - The bounds to map within
   */
  public mapUvToPoint(point: Point, uv: Vector2, bounds: Rectangle | Bounds) {
    point.x = uv.x * bounds.width + bounds.x;
    point.y = uv.y * bounds.height + bounds.y;
  }

  /**
   * Binds Three.js event handlers to Pixi containers.
   * @param container - Container(s) or bind options
   * @param handlers - Optional event handlers to chain
   * @returns EventHandlers object for use with react-three-fiber
   */
  public bind(
    domElement: RefObject<HTMLElement>,
    container:
      | RefObject<Container>
      | PixiThreeEventBindOptions
      | (RefObject<Container> | PixiThreeEventBindOptions)[],
    handlers?: EventHandlers,
  ): EventHandlers {
    return {
      ...this.bindFactory(
        [
          {
            key: "onPointerUp",
            handler: "handlePointerUp",
          },
          {
            key: "onPointerDown",
            handler: "handlePointerDown",
          },
          {
            key: "onPointerOver",
            handler: "handlePointerOverOut",
          },
          {
            key: "onPointerOut",
            handler: "handlePointerOverOut",
          },
          {
            key: "onPointerEnter",
            handler: "handlePointerOverOut",
          },
          {
            key: "onPointerLeave",
            handler: "handlePointerOverOut",
          },
          {
            key: "onPointerMove",
            handler: "handlePointerMove",
          },
          {
            key: "onPointerCancel",
            handler: "handlePointerUp",
          },
          {
            key: "onWheel",
            handler: "handleWheel",
          },
        ],
        domElement,
        container,
        handlers,
      ),
      onLostPointerCapture: (event: ThreeEvent<PointerEvent>) => {
        handlers?.onLostPointerCapture?.(event);
      },
    };
  }
}
