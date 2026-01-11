# Pixi-Three

Write declarative apps seamlessly blending 2d and 3d components in React.

## Installation

```bash
npm install @astralarium/pixi-three @pixi/react @react-three/fiber pixi.js three
```

Pixi-Three assumes the `hidden` Tailwind class is available. If not, you may see an extra canvas.

## Usage

- `<CanvasContext>`: Context manager for all canvas views, which share GPU resources. Contains DOM children, including CanvasView.

- `<CanvasView>`: A canvas DOM element. Contains React Pixi children.

- `<ThreeScene>`: A Pixi Sprite. Contains React Three Fiber children.

- `<PixiTexture>`: A Three TextureNode. Contains React Pixi children.

```tsx
<CanvasContext>
  <CanvasView>
    <ThreeScene>
      <SpinnyCube /> // Three.js Object
    </ThreeScene>
    <SpinnySprite /> // Pixi.js Sprite
  </CanvasView>
</CanvasContext>
```

See [a full working example](./doc/App.tsx)

## Development

```bash
pnpm install
pnpm dev
```
