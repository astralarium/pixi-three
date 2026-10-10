# Plan: replace tunnel-rat with `fiber-tunnel`

## Why

tunnel-rat re-renders every `In` in a tunnel whenever any `In` mounts.
pixi-three routes every render texture through shared tunnels, so one
mount re-renders all of them. In eternal-engine (96 cards, about 390
render textures, dev build), patching pixi-three 0.3.0-alpha.4 onto
`fiberTunnel` (by swapping its import) gave:

| Interaction | tunnel-rat | `fiberTunnel` |
| --- | --- | --- |
| Hover-preview mount | 926 ms | 462 ms |
| StrictMode reorder | 634 ms | 335 ms |

- Pixi commits per cross-container move with preview: 4 → 2.
- Card output is identical, and there are no multiple-`Out` warnings.

## Scope

- Swap tunnel-rat for `fiberTunnel` in:
  - `src/render-context.tsx`: `canvasViewTunnel`, `threeSceneTunnel`,
    `pixiTextureTunnel`.
  - `src/three-render-texture.tsx`: `sceneTunnel`.
  - `src/three-scene.tsx`: `sceneTunnel`.
- Types in `src/three-scene-context.ts` and `src/render-context-hooks.ts`
  become `FiberTunnel`.
- Peer dependency `tunnel-rat` → `fiber-tunnel`; React peer
  `^19.0` → `^19.2`, matching fiber-tunnel.
- Each tunnel has exactly one `Out`, the package's contract. Extra
  `Out`s each render a copy and log a dev error. Verify across the
  examples.
- `CanvasView`, `PixiTexture` and `ThreeScene` render a `FiberAnchor`
  around the component that captures the context bridge (`useBridge`),
  so content tunneled across their roots by any library (a11y-tree)
  sorts at the boundary's tree position.
- Re-measure eternal-engine with the anchors in place: each anchored
  level adds a walk of its root to every Out render, and the numbers
  above predate anchors.
- Render timing matches tunnel-rat: an `In`'s content renders one
  commit after the `In` mounts, and an `Out` renders existing content
  in its mount commit.
- Release the next alpha, including the unreleased commits on `main`.

## Sequencing

1. Prototype against a11y-tree 0.2.2's `fiberTunnel` export. This is the
   measured setup.
2. Switch to `fiber-tunnel` 0.1.0 once it is published
   (`../fiber-tunnel/plans/initial-package.md`).
3. Release; eternal-engine drops its local patch.

## Open items (from the engine measurements)

- A cross-container move still re-renders all render-texture components
  once (about 390; minified `vo` in 0.3.0-alpha.4) and all pixi-side
  its-fine bridges (about 8.9k, about 50 ms). The trigger is unknown;
  trace what invalidates them.
- Under StrictMode, a keyed reorder re-renders all render textures.
  Find the effect replay that drives it.
