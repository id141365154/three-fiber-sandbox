import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

export const Rig = () => {
  useFrame((state) => {
    state.camera.position.lerp(
      new Vector3(-state.pointer.x / 2, state.pointer.y / 4, 4),
      0.1
    );
    state.camera.lookAt(-state.pointer.x / 2, state.pointer.y / 4, 0);
  });

  return null;
};
