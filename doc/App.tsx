import { CanvasContext } from "#canvas-context.tsx";
import { CanvasView } from "#canvas-view.tsx";
import { ThreeScene } from "#three-scene.tsx";
import { useState } from "react";
import { SpinnyCube } from "./examples/spinny-cube";

function App() {
  const [toggle, setToggle] = useState(true);

  return (
    <>
      <div className="bg-neutral-300 p-4">
        <h1 className="text-2xl">Pixi + Three</h1>
        <div className="mt-2 flex items-center gap-4">
          <button
            className="bg-amber-500 hover:bg-amber-400 cursor-pointer p-2 rounded-sm"
            onClick={() => setToggle((x) => !x)}
          >
            Toggle canvas
          </button>
          <span>
            Canvas is{" "}
            <span
              className={`${toggle ? "text-green-700" : "text-red-700"} font-bold`}
            >
              {toggle ? "mounted" : "unmounted"}
            </span>
          </span>
        </div>
      </div>
      {toggle && (
        <CanvasContext>
          <CanvasView>
            <ThreeScene>
              <SpinnyCube position={[-2, -2, 0]} />
              <SpinnyCube position={[0, -2, 0]} />
              <SpinnyCube position={[2, -2, 0]} />
              <SpinnyCube position={[-2, 0, 0]} />
              <SpinnyCube position={[0, 0, 0]} />
              <SpinnyCube position={[2, 0, 0]} />
              <SpinnyCube position={[-2, 2, 0]} />
              <SpinnyCube position={[0, 2, 0]} />
              <SpinnyCube position={[2, 2, 0]} />
            </ThreeScene>
          </CanvasView>
        </CanvasContext>
      )}
    </>
  );
}

export default App;
