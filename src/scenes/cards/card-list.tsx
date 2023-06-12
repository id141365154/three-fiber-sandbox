import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";
import { Card } from "./components/card";
import { cardsData } from "./data";

 
const gap = 10;

const totalCards = cardsData.length;

const maxDistance = totalCards * gap;

export const CardsList = () => {
  const meshRef = useRef<Mesh>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (meshRef.current) {
      const y = (maxDistance - 10) * scroll.offset;

      meshRef.current.position?.lerp(new Vector3(1, 0, y), 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      name="cube2"
      rotation={[0, 0, 0]}
      position={new Vector3(0, 0, 0)}
    >
      {cardsData.reverse().map((card, i) => {
        // const r = 5;

        // const angle = (i * Math.PI) / 4;
        // const x = r + ((step * i) / 2) * Math.cos(angle);
        // const y = r + ((step * i) / 2) * Math.sin(angle);

        return (
          <Card
            key={card.title}
            //position={new Vector3(x - 2, y - 2, i * 10)}
            position={new Vector3(-0.5 + i, 0, i * gap)}
            totalCards={totalCards}
            image={card.image}
          />
        );
      })}
    </mesh>
  );
};
