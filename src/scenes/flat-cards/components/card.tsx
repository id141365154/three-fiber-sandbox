import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Mesh, Vector3 } from "three";
import { Image } from "@react-three/drei";

type Props = {
  position: Vector3;
  totalCards: number;
  image: string;
};
export const Card = ({ totalCards, image, position }: Props) => {
   
  const meshRef = useRef<Mesh>(null);

  const [hovered, setHover] = useState(false);

  const over = () => setHover(true);
  const out = () => setHover(false);

  useFrame(() => {
    const zPos = hovered ?  position.z+.5 :  position.z;
    if (meshRef.current) {
      meshRef.current?.position.lerp(new Vector3(position.x, position.y, zPos), 0.4);       
    }
  });
 

  return (
    <mesh ref={meshRef} name="cube2" rotation={[0, 0, 0]} position={position} onPointerEnter={over} onPointerLeave={out}  >
      <Image url={image} position={[0, 0, 0.01]} scale={[3, 3.2]} />
    </mesh>
  );
};
