import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats, Bounds } from "@react-three/drei";
import { Slides, TCubeRef } from "./components/slides";

import "./styles.css";
import { PerspectiveCamera } from "@react-three/drei";

import { forwardRef, useRef } from "react";
import { images } from "./images";

export const Scene = forwardRef<TCubeRef>((_, scrollRef) => {
  return (
    <>
      <Stats />
      <color attach="background" args={["#000"]} />

      <Bounds fit clip observe margin={2.5}>
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

export const SandImageSlider = () => {
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
        {images.map((src, index) => (
          <div className="page" key={src}>
            <div className="content">{index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
