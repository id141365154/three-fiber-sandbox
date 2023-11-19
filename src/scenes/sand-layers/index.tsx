import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats, Bounds } from "@react-three/drei";
import { Slides, TCubeRef } from "./components/slides";

import "./styles.css";
import { PerspectiveCamera } from "@react-three/drei";

import { forwardRef, useRef } from "react";

const pages = new Array(10).fill(null);

const Scene = forwardRef<TCubeRef>((_, scrollRef) => {
  return (
    <>
      <Stats />
      <color attach="background" args={["#000"]} />

      <Bounds fit clip observe>
        <Slides ref={scrollRef} />
      </Bounds>

      <fog attach="fog" args={["white", 50, 190]} />
      <spotLight
        visible
        position={[10, 10, 5]}
        angle={0.15}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <spotLight
        visible
        position={[-10, 10, 5]}
        angle={0.15}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <PerspectiveCamera
        makeDefault
        // aspect={window.innerWidth / window.innerHeight}
        fov={10}
        position={[18, 0, 10]}
      />
      <OrbitControls makeDefault />
    </>
  );
});

export const SandLayers = () => {
  const scrollRef = useRef<TCubeRef | null>(null);
  return (
    <div className="glb-models">
      <div className="canvas-container">
        <Canvas className="canvas" dpr={[1, 2]}>
          <Scene ref={scrollRef} />
        </Canvas>
      </div>
      <div
        onScroll={(e) => {
          scrollRef.current = {
            //@ts-ignore
            offset: e.target?.scrollTop,
            //@ts-ignore
            max: e.target.offsetHeight,
          };
        }}
        className="scrollable"
      >
        {pages.map((_, i) => (
          <div key={i} className="page">
            <div className="content">{i}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
