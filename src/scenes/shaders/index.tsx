import { extend, Canvas, useLoader } from "@react-three/fiber";
import { UnrealBloomPass, EffectComposer } from "three-stdlib";
import { OrbitControls, Stats } from "@react-three/drei";
import { Cube } from "./components/cube";

import "./styles.css";
import {
  Environment,
  MeshReflectorMaterial,
  PerspectiveCamera,
} from "@react-three/drei";

import texture from "./floor-texture.webp";
import { TextureLoader } from "three";

extend({ UnrealBloomPass, EffectComposer });

// studio.initialize();
// studio.extend(extension);
//const demoSheet = getProject("Demo Project").sheet("Demo Sheet");

export const ShadersScene = () => {
  const textureMap = useLoader(TextureLoader, texture);

  return (
    <div className="canvas-container">
      <Canvas
        dpr={[1, 2]}
        shadows="percentage"
        camera={{ position: [-3, 2, 5], fov: 90 }}
      >
        <Stats />
        <color attach="background" args={["black"]} />
        {/* <fog attach="fog" args={["#101010", 0, 10]} /> */}

        <Cube />

        <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.92, 0]}>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial transparent color="black" opacity={0.2} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.93, 0]}>
          <planeGeometry args={[10, 10]} />
          <MeshReflectorMaterial
            roughnessMap={textureMap}
            roughness={5}
            blur={[400, 100]}
            resolution={1024}
            mixBlur={10}
            opacity={0.1}
            depthScale={10}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.25}
            mirror={0.8}
          />
        </mesh>

        <Environment preset="warehouse" />
        <spotLight
          visible
          position={[10, 10, 5]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <PerspectiveCamera
          makeDefault
          fov={100}
          position={[0, 0, 4]}
        ></PerspectiveCamera>

        <OrbitControls makeDefault />

        {/* <CameraShake
          yawFrequency={0.1}
          pitchFrequency={0.1}
          rollFrequency={0.1}
        /> */}
      </Canvas>
    </div>
  );
};
