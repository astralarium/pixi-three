# Plan: fiber-tunnel bridged tunnels

A changed ancestor context value re-renders every pixi-three bridge below
it. At 384 textures (dev build) one unread bump costs ~380 ms. fiber-tunnel
bridged tunnels re-render only content that reads a changed value, in fiber
order.

## Decisions

- `fiber-tunnel` `^0.4.0`, peer and dev dependency. its-fine stays:
  `three-fiber.ts` (`useFiber`) and `FiberProvider`. r3f content keeps a
  `FiberProvider` (`ThreeRoot`, `ThreeScene`), as r3f's `<Canvas>` does,
  for r3f libraries that call its-fine.
- Every tunnel is `fiberTunnel()`, bridged by default:
  - `src/render-context.tsx`: `canvasViewTunnel`, `threeSceneTunnel`,
    `pixiTextureTunnel`.
  - `src/three-scene.tsx`, `src/three-render-texture.tsx`: `sceneTunnel`.
- `CanvasView`, `ThreeScene` and `PixiTexture` content wraps in its-fine
  `FiberProvider`, so `useFiber` resolves in the Out's root. These
  components carry no `FiberAnchor`: user content reaches the pixi and r3f
  roots only through bridged Ins. An In rendered directly in either root
  needs an anchor.
- `FiberAnchor` wraps `ThreeRoot` and passes its bridge; `ThreeRoot`
  renders `ContextBridge` > `FiberProvider` > children.
- One `scheduler` copy: `overrides: scheduler: ^0.27.0`. @pixi/react pins
  `react-reconciler@0.31.0` (`scheduler@^0.25`); a second Scheduler
  interleaves pixi and r3f renders, and the two secondary renderers
  clobber each other's context values. README documents the override for
  apps.
- `Bridge`, `BridgeValue` and `useBridge` are deleted, exports included.
- Errors and suspensions in content reach boundaries above the
  component, as with r3f's `<Canvas>`. `CanvasView` docs note the one
  commit before an urgent suspend's fallback.

## Verification

`/example/context-bridge`, dev build:

- Tile commits: 1 per read bump, 0 per unread bump.
- Examples render without uncaught errors.
- At 384 tiles: unread bump React work, Out re-sort vs reconciliation,
  texture mount, texture props update, transition bump, tile re-sort,
  commit time with and without the commit hook.
- Owner hand-off: unmount the owning tile, bump a context another tile
  reads.

## Open items

- `/example/context-bridge` takes a `tiles` parameter and controls for a
  transition bump, a texture mount, and a tile unmount.
- Upstream: once @pixi/react's `react-reconciler` uses `scheduler@^0.27`,
  drop the override and README note.
- `PixiEventsContext` may be redundant: bridged `RenderContextValue`
  carries `pixiEvents` live.
- Measure eternal-engine's stress scene (`/debug/zoo/layout/tableau_stress`,
  procedure in eternal-engine `docs/skills/tableau-perf`). Under
  0.3.0-alpha.4 a cross-container move re-rendered every render texture
  and ~8.9k pixi-side its-fine bridges (~50 ms); confirm both are gone.
- Under StrictMode, a keyed reorder re-renders all render textures. Find
  the effect replay that drives it.
