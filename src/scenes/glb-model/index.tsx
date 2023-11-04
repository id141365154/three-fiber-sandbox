import { extend, Canvas } from "@react-three/fiber";
import { UnrealBloomPass, EffectComposer } from "three-stdlib";
import { OrbitControls, Stats } from "@react-three/drei";
import { Slides, TCubeRef } from "./components/slides";

import "./styles.css";
import { PerspectiveCamera } from "@react-three/drei";

import { useRef } from "react";

extend({ UnrealBloomPass, EffectComposer });

type Props = {
  variant: "1" | "2";
};

export const GlbModels = ({ variant }: Props) => {
  const scrollRef = useRef<TCubeRef | null>(null);

  return (
    <div className="glb-models">
      <div className="canvas-container">
        <Canvas
          className="canvas"
          dpr={[1, 2]}
          //camera={{ position: [-5, 2, 10], fov: 10 }}
        >
          <Stats />
          <color attach="background" args={["#000"]} />

          <Slides ref={scrollRef} variant={variant} />

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

          <PerspectiveCamera makeDefault fov={10} position={[13, 0, 1]} />

          <OrbitControls makeDefault />

          {/* <Post ref={scrollRef} /> */}
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
