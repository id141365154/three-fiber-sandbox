import { extend, Canvas, useLoader } from "@react-three/fiber";
import { UnrealBloomPass, EffectComposer } from "three-stdlib";
import {
  OrbitControls,
  Scroll,
  ScrollControls,
  Stats,
} from "@react-three/drei";
import { Cube } from "./components/cube";

import "./styles.css";
import { PerspectiveCamera } from "@react-three/drei";

import texture from "./floor-texture.webp";
import { TextureLoader } from "three";

import { Effects } from "./effects";

extend({ UnrealBloomPass, EffectComposer });

export const ParticlesScene = () => {
  const textureMap = useLoader(TextureLoader, texture);

  return (
    <div className="canvas-container">
      <Canvas
        dpr={[1, 2]}
        //shadows="percentage"
        camera={{ position: [-3, 2, 5], fov: 90 }}
      >
        <Stats />
        <color attach="background" args={["#000"]} />
        {/* <fog attach="fog" args={["#101010", 0, 10]} /> */}
        <ScrollControls pages={3} damping={0.3}>
          <Cube />
          <Effects />

          <OrbitControls makeDefault enableZoom={false} />
          <spotLight
            visible
            position={[10, 10, 5]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <Scroll html>
            {[0, 1, 2].reverse().map((item, i) => (
              <div
                key={i}
                style={{
                  marginLeft: "16px",
                  padding: "5rem",
                  height: "100vh",
                  widows: "300px",
                  color: "#fff",
                  background: "#4f4ff4",
                }}
              >
                <h2>{item}</h2>
              </div>
            ))}
          </Scroll>

          <PerspectiveCamera makeDefault fov={80} position={[0, 0, 1]} />
        </ScrollControls>

        {/* <CameraShake
          yawFrequency={0.1}
          pitchFrequency={0.1}
          rollFrequency={0.1}
        /> */}
      </Canvas>
    </div>
  );
};
