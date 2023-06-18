import { useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";
import { TextureLoader } from "three";
import texture from "../floor-texture.webp";
import { Image } from "@react-three/drei";

type Props = {
  position: Vector3;
  totalCards: number;
  image: string;
};
export const Card = ({ totalCards, image, position }: Props) => {
  const textureMap = useLoader(TextureLoader, texture);
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef} name="cube2" rotation={[0, 0, 0]} position={position}>
      <Image url={image} position={[0, 0, 0.01]} scale={[3, 3.2]} />
      {/* <boxGeometry args={[2, 3.5, 0.01]} /> */}
      {/* <meshPhysicalMaterial map={textureMap} /> */}
    </mesh>
  );
};
