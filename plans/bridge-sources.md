# Plan: fiber-tunnel bridged tunnels

A changed ancestor context value re-renders every pixi-three bridge below
it. At 384 textures (dev build) one unread bump costs ~380 ms. fiber-tunnel
0.2.0 bridged tunnels re-render only content that reads a changed value,
in fiber order.

## Decisions

- `fiber-tunnel` `^0.2.0`, peer and dev dependency. its-fine stays:
  `three-fiber.ts` (`useFiber`) and `FiberProvider`.
- Every tunnel is `fiberTunnel({ bridge: true })`:
  - `src/render-context.tsx`: `canvasViewTunnel`, `threeSceneTunnel`,
    `pixiTextureTunnel`.
  - `src/three-scene.tsx`, `src/three-render-texture.tsx`: `sceneTunnel`.
- `CanvasView`, `ThreeScene` and `PixiTexture` content wraps in its-fine
  `FiberProvider`, so `useFiber` resolves in the Out's root.
- `ThreeRoot` renders `ContextBridge` > `FiberProvider` > children.
- `Bridge`, `BridgeValue` and `useBridge` are deleted, exports included.
- Errors and suspensions in content reach boundaries above the
  component, as with r3f's `<Canvas>`. `CanvasView` docs note the one
  commit before an urgent suspend's fallback.
- `plans/texture-redraw.md` points at fiber-tunnel's bridge.

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
- `FiberAnchor` around `CanvasView`, `PixiTexture` and `ThreeScene` orders
  nothing: bridged Ins drop the anchor context, so other libraries'
  tunnels inside content lose order. fiber-tunnel 0.3.0 anchors content
  at its In (`plans/bridged-content.md` §1). On 0.3.0, pixi-three:
  - drops `FiberAnchor` entirely, folding `CanvasViewBridged` and
    `PixiTextureBridged` into their components. User content reaches the
    pixi and r3f roots only through bridged Ins; an In rendered directly
    in either root needs the anchors back.
  - drops `{ bridge: true }`: 0.3.0 bridges by default.
- Dev error "Detected multiple renderers concurrently rendering the same
  context provider": every clash is @pixi/react's application context.
  fiber-tunnel's provider fixes leave it unchanged; cause tracked in
  fiber-tunnel's `plans/bridged-content.md` §2.
- `PixiEventsContext` may be redundant: bridged `RenderContextValue`
  carries `pixiEvents` live.
- Measure eternal-engine's stress scene (`/debug/zoo/layout/tableau_stress`,
  procedure in eternal-engine `docs/skills/tableau-perf`). Under
  0.3.0-alpha.4 a cross-container move re-rendered every render texture
  and ~8.9k pixi-side its-fine bridges (~50 ms); confirm both are gone.
- Under StrictMode, a keyed reorder re-renders all render textures. Find
  the effect replay that drives it.
