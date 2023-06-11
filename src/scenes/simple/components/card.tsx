import { useFrame, useLoader } from "@react-three/fiber";
import { useRef, useState } from "react";
import { MathUtils, Mesh, Vector3 } from "three";
import { TextureLoader } from "three";
import texture from "../floor-texture.webp";

const damp = MathUtils.damp;

export const Card = () => {
  const textureMap = useLoader(TextureLoader, texture);
  const meshRef = useRef<Mesh>(null);
  const [hovered, hover] = useState(false);
  //const { clicked, urls } = useSnapshot(state)
  //const click = () => (state.clicked = index === clicked ? null : index);
  const over = () => hover(true);
  const out = () => hover(false);
  useFrame((state, delta) => {
    const scale = hovered ? 2 : 1;

    const hoveredPosY = hovered ? 0.1 : -0.44;
    const hoveredRotateY = hovered ? Math.PI / 3 : 0;

    if (meshRef.current) {
      meshRef.current?.scale.lerp(new Vector3(scale, scale, scale), 0.4);
      meshRef.current?.position.lerp(new Vector3(-2, hoveredPosY, 0), 0.4);
      meshRef.current.rotation.y = damp(
        meshRef.current.rotation.y,
        hoveredRotateY,
        1,
        1
      );
    }

    //.current.material.color.lerp(c.set(hovered || clicked === index ? 'white' : '#aaa'), hovered ? 0.3 : 0.1)
  });

  const y = hovered ? 0.3 : 0;
  return (
    <mesh
      ref={meshRef}
      name="cube2"
      rotation={[0, 0, 0]}
      position={[-2, -0.44, 0]}
      onPointerOver={over}
      onPointerOut={out}
      castShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial map={textureMap} />
    </mesh>
  );
};
