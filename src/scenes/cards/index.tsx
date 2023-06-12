import { extend, Canvas } from "@react-three/fiber";
import { UnrealBloomPass, EffectComposer } from "three-stdlib";
import { Stats } from "@react-three/drei";

import "./styles.css";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import { cardsData } from "./data";
import { Scrolled } from "./scrolled";

extend({ UnrealBloomPass, EffectComposer });
const totalCards = cardsData.length;
const gap = 10;

const maxDistance = totalCards * gap;
export const Cards = () => {
  return (
    <div className="canvas-container">
      <Canvas
        dpr={[1, 2]}
        shadows="percentage"
        camera={{ position: [0, 0, 0], rotation: [0, 0, 0], fov: 90 }}
      >
        <Stats />

        <Scrolled>
          <PerspectiveCamera
            makeDefault
            fov={65}
            zoom={1}
            position={[-1, 0, maxDistance - 6]}
          >
            <ambientLight />
            <spotLight
              visible
              position={[10, 10, 5]}
              angle={0.15}
              penumbra={1}
              intensity={1}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
          </PerspectiveCamera>

          {/* <OrbitControls makeDefault enableZoom={false} /> */}
          <gridHelper args={[20, 20, 0xff0000, "teal"]} />
          <axesHelper args={[5]} />
        </Scrolled>

        <color attach="background" args={["#000000"]} />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
};
