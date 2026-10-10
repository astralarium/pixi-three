# Plan: redraw only changed textures

A context change above many `PixiTexture`s re-renders and redraws every
one of them. In eternal-engine (96 cards × 4 render textures, dev build),
one cross-column move:

1. re-renders all 384 `PixiTextureBridged` (~45 ms r3f)
2. then a pixi commit re-renders and redraws all 96 cards' text and frame
   textures (~230 ms)
3. then 384 r3f `Portal`s re-render

StrictMode keyed reorders trigger the same cascade.

## Mechanism

- `useBridge` → its-fine `useContextMap` reads every ancestor context with
  `use()`. Any ancestor context value change re-renders the bridging
  component.
- `PixiTextureBridged` and `PixiTextureInternal` ship uncompiled (React
  Compiler skips them over `react-hooks` suppressions). Each re-render
  hands the tunnel `In` a new element and rebuilds the
  `CanvasTreeContext` and `PixiTextureContext` values.
- Every `useInvalidate` consumer reads `CanvasTreeContext`, so it
  re-renders; `useEffectInvalidate` then redraws its texture.
- Compiled bridging components (`ThreeSceneSprite`, `ThreeRoot`) cache
  their `<Bridge>` element. its-fine mutates one `ContextMap` in place,
  so bridged values freeze: context changes above them never arrive.
- Trigger in eternal-engine: a11y-tree's `A11yTreeMultiplexerContext`
  value carries `version`, bumped on every slot acquire and release.

## Decisions

- React context propagation already re-renders only consumers of changed
  values; the fix lets bridged subtrees bail out.
- `useBridge` returns a `BridgeValue` snapshot (context/value pairs,
  StrictMode flag). Its identity changes only when a bridged value
  changes. One module-level `Bridge` component renders it.
- `useCanvasTree(invalidate)` returns a memoized `CanvasTreeContext`
  value; `CanvasView`, `ThreeScene`, `ThreeRenderTexture` and
  `PixiTexture` use it.
- `useCanvasTreeSize` publishes a node's size and invalidates it on
  change; `CanvasView` invalidates on every size notification. A stable
  context value ends the accidental redraw that fresh values caused.
- `PixiTextureInternal` is `memo`; bridge updates reach only consumers of
  changed contexts.
- `ThreeRoot` keeps the latest bridged element in a ref; the async init
  renders it, and an effect re-renders on bridge or children change.
  (`useEffectEvent` is unavailable: `@pixi/react`'s reconciler predates
  it.)
- Example `/example/context-bridge` counts tile commits for a context read
  by one tile (provided above `RenderContext`) and one read by none
  (provided inside `ThreeScene`).

## Outcome

`/example/context-bridge`, 24 tiles:

| Action                       | Before                 | After             |
| ---------------------------- | ---------------------- | ----------------- |
| Bump unread context          | 24 tile commits        | 0                 |
| Bump read context            | 0 commits, stale value | 1 commit, current |

## Open items

- Measure eternal-engine's stress scene
  (`/debug/zoo/layout/tableau_stress`, procedure in eternal-engine
  `docs/skills/tableau-perf`).
- `PixiTextureBridged` stays uncompiled (`textureRef.current` read for
  `<primitive>`), so an unchanged bridge still re-renders its providers
  in a pixi commit. Compiling it removes that commit.
- `ThreeSceneContext` values are rebuilt on each `ThreeSceneSpriteInternal`
  and `ThreeRenderTexture` render, so a viewport resize re-renders every
  `PixiTextureBridged` below it.
- **Fonts:** a `PixiTexture` with canvas text draws once, so text drawn
  before its web font loads keeps fallback glyphs. pixi-three could
  redraw text textures on `document.fonts` `loadingdone`.
- **Two r3f copies:** pixi-three imports `@react-three/fiber`; apps using
  WebGPU hooks import `@react-three/fiber/webgpu`, a standalone bundle
  with its own reconciler. Decide which entry pixi-three binds to.
- a11y-tree: keep `A11yTreeMultiplexerContext`'s value stable
  (`../a11y-tree/plans/stable-multiplexer-context.md`).
