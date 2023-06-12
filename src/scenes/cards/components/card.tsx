import { Image, useScroll } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";
import { TextureLoader } from "three";
import texture from "../floor-texture.webp";

type Props = {
  position: Vector3;
  totalCards: number;
  image: string;
};
export const Card = ({ totalCards, image, position }: Props) => {
  const textureMap = useLoader(TextureLoader, texture);
  const meshRef = useRef<Mesh>(null);

  const scroll = useScroll();

  useFrame(() => {
    if (meshRef.current) {
      const z = Math.sin(scroll.offset * 50);

      meshRef.current.position?.lerp(new Vector3(0, 0, position.z), 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      name="cube2"
      rotation={[0, 0, 0]}
      position={new Vector3(0, 0, 0)}
    >
      <Image url={image} position={new Vector3(0, 0, 0.1)} scale={[3, 3]} />
      <boxGeometry args={[1.5, 1.9, 0.1]} />
      <meshPhysicalMaterial map={textureMap} />
    </mesh>
  );
};
