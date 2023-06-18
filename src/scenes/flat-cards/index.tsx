import { extend, Canvas } from "@react-three/fiber";
import { UnrealBloomPass, EffectComposer } from "three-stdlib";
import { Stats } from "@react-three/drei";

import "./styles.css";

import { Scene } from "./scene";

extend({ UnrealBloomPass, EffectComposer });

export const FlatCards = () => {
  return (
    <div className="canvas-container">
      <Canvas
        dpr={[1, 2]}
        shadows="percentage"
        camera={{ position: [0, 0, 0], rotation: [0, 0, 0], fov: 90 }}
      >
        <Stats />
        <Scene />
      </Canvas>
    </div>
  );
};
