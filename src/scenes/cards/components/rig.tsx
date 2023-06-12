import { useFrame } from "@react-three/fiber";

export const Rig = () => {
  useFrame((state) => {
    // state.camera.position.lerp(
    //   new Vector3(-state.pointer.x / 2, state.pointer.y / 4, 4),
    //   state.camera.position.z
    // );
    //    state.camera.lookAt(-state.pointer.x / 2, state.pointer.y / 4, 0);
  });

  return null;
};
