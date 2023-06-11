import { extend, Canvas, useLoader } from "@react-three/fiber";
import { UnrealBloomPass, EffectComposer } from "three-stdlib";
import { Stats } from "@react-three/drei";

import "./styles.css";
import {
  Environment,
  MeshReflectorMaterial,
  PerspectiveCamera,
} from "@react-three/drei";

import texture from "./floor-texture.webp";
import { TextureLoader } from "three";
import { Effects } from "./effects";
import { Rig } from "./components/rig";
import { Card } from "./components/card";

extend({ UnrealBloomPass, EffectComposer });

// studio.initialize();
// studio.extend(extension);
//const demoSheet = getProject("Demo Project").sheet("Demo Sheet");

export const SimpleScene = () => {
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
        <fog attach="fog" args={["#101010", 0, 10]} />

        <mesh
          name="cube"
          rotation={[Math.PI / 5, Math.PI / 4, 0]}
          position={[0, -0.14, 0]}
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial map={textureMap} />
        </mesh>
        <mesh
          name="cube2"
          rotation={[0, 0, 0]}
          position={[2, -0.44, -1.5]}
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial map={textureMap} />
        </mesh>

        <Card />
        <Effects />

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

        <PerspectiveCamera makeDefault fov={65} position={[0, 0, 4]}>
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

        <Rig />

        {/* <OrbitControls
          enableZoom={false}
          minDistance={3}
          maxDistance={5}
          makeDefault
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        /> */}

        {/* <CameraShake
          yawFrequency={0.1}
          pitchFrequency={0.1}
          rollFrequency={0.1}
        /> */}
      </Canvas>
    </div>
  );
};
