import type { ReactNode } from "react";

export type ExampleMeta = {
  label: string;
  to: string;
  description: ReactNode;
};

export const EXAMPLES: readonly ExampleMeta[] = [
  {
    label: "Basic Scene",
    to: "/example/basic-scene",
    description: (
      <>
        <span className="text-pixi-red font-bold">Pixi</span>
        {" + "}
        <span className="text-three-blue font-bold">Three</span> integration.
      </>
    ),
  },
  {
    label: "Bijections",
    to: "/example/bijections",
    description: "Coordinate system mapping",
  },
  {
    label: "Three Render Texture",
    to: "/example/three-render-texture",
    description: "Three.js render texture with events",
  },
  {
    label: "Three Pointer Capture",
    to: "/example/three-pointer-capture",
    description: "Drag meshes even when pointer leaves",
  },
  {
    label: "On-Demand Rendering",
    to: "/example/demand-rendering",
    description: "Save power on mobile devices",
  },
  {
    label: "Context Bridge",
    to: "/example/context-bridge",
    description: "Textures redraw only for contexts they read",
  },
  {
    label: "Event Cost",
    to: "/example/event-cost",
    description: "Pointer cost per event across many textures",
  },
  {
    label: "Shared Texture",
    to: "/example/shared-texture",
    description: "One Pixi texture with events across many meshes",
  },
  {
    label: "Unmount Context",
    to: "/example/unmount-context",
    description: "Unmount the <RenderContext>",
  },
  {
    label: "Video Preview",
    to: "/example/video-preview",
    description: "Preview transparent video",
  },
];
