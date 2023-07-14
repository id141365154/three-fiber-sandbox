import { extend, useFrame } from "@react-three/fiber";
import { UnrealBloomPass, EffectComposer } from "three-stdlib";
import { CameraShake, OrbitControls } from "@react-three/drei";

import "./styles.css";
import { PerspectiveCamera } from "@react-three/drei";
import { cardsData } from "./data";

import { CardsList } from "./card-list";
import { MOUSE, Vector3 } from "three";
import { useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

extend({ UnrealBloomPass, EffectComposer });
const totalCards = cardsData.length;
const gap = 10;

const maxDistance = totalCards * gap;

var minPan = new Vector3(-6, -1, 0);
var maxPan = new Vector3(8, 5, 0);
var _v = new Vector3();

export const Scene = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useFrame(({ camera }) => {
    if (controlsRef.current) {
      controlsRef.current.target.clamp(minPan, maxPan);
    }
  });
  return (
    <>
      <CardsList />

      <PerspectiveCamera makeDefault fov={65} zoom={1} position={[0, 0, 10]}>
        <ambientLight />
        <spotLight
          visible
          position={[10, 10, 0]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
      </PerspectiveCamera>

      <OrbitControls
        makeDefault
        dampingFactor={0.04}
        enableDamping
        enablePan
        zoomSpeed={0.1}
        enableRotate={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        maxAzimuthAngle={2 * Math.PI}
        minAzimuthAngle={2 * Math.PI}
        minDistance={10}
        maxDistance={16}
        mouseButtons={{
          LEFT: MOUSE?.PAN,
        }}
        ref={controlsRef}
      />

      <CameraShake
        maxYaw={0}
        maxPitch={0.05}
        maxRoll={0}
        yawFrequency={0}
        pitchFrequency={0.1}
        rollFrequency={0}
      />

      {/* <gridHelper args={[20, 20, 0xff0000, "teal"]} />
      <axesHelper args={[5]} /> */}

      <color attach="background" args={["#000000"]} />

       
    </>
  );
};
