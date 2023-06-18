import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";
import { Card } from "./components/card";
import { cardsData } from "./data";

type TGridOptions = {
  tileSize: [number, number];
  xTiles: number;
  yTiles: number;
  shift: [number, number];
};

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const getGrid = ({ tileSize, xTiles, yTiles, shift }: TGridOptions) => {
  const result: [number, number][] = [];

  for (let x = 0; x < xTiles; x++) {
    for (let y = 0; y < yTiles; y++) {
      result.push([x * tileSize[0] + shift[0], y * tileSize[1] + shift[1]]);
    }
  }

  return result;
};

export const CardsList = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position?.lerp(new Vector3(1, 0, 0), 0.09);
    }
  });

  const totalCards = cardsData.length;
  const grid = getGrid({
    tileSize: [3.5, 4],
    xTiles: 8,
    yTiles: 4,
    shift: [-12, -5],
  });

  return (
    <mesh
      ref={meshRef}
      name="cube2"
      rotation={[0, 0, 0]}
      position={new Vector3(0, 0, -30)}
    >
      {cardsData.reverse().map((card, i) => {
        const x = grid?.[i]?.[0] || 0;
        const y = grid?.[i]?.[1] || 0;

        return (
          <Card
            key={card.title}
            position={new Vector3(x, y, getRandomArbitrary(2, 5))}
            totalCards={totalCards}
            image={card.image}
          />
        );
      })}
    </mesh>
  );
};
