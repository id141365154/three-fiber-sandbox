import { extend, Canvas } from "@react-three/fiber";
import { UnrealBloomPass, EffectComposer } from "three-stdlib";
import { OrbitControls, Stats, Bounds } from "@react-three/drei";
import { Slides, TCubeRef } from "./components/slides";

import "./styles.css";
import { PerspectiveCamera } from "@react-three/drei";

import { forwardRef, useRef } from "react";
import { Effects } from "./effects";

extend({ UnrealBloomPass, EffectComposer });

export const Scene = forwardRef<TCubeRef>((_, scrollRef) => {
  return (
    <>
      <Stats />
      <color attach="background" args={["#000"]} />

      <Bounds fit clip observe margin={2.5}>
        <Slides ref={scrollRef} />
      </Bounds>

      <Effects ref={scrollRef} />
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

export const SandSlider = () => {
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
        <div className="page">
          <div className="content">1</div>
        </div>
        <div className="page">
          <div className="content">2</div>
        </div>
        <div className="page">
          <div className="content">3</div>
        </div>
        <div className="page">
          <div className="content">4</div>
        </div>
      </div>
    </div>
  );
};
