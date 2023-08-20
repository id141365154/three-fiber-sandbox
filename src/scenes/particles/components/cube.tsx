import { useScroll } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { ShaderMaterial, TextureLoader, Vector3 } from "three";

import textureFlower1 from "../flower.jpeg";
import textureFlower2 from "../flower2.jpeg";
import textureFlower3 from "../flower3.jpeg";
import textureFlower4 from "../flower4.jpeg";
import { fragment } from "./fragment";
import { vertex } from "./vertex";

function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

let value = 0;

export const Cube = () => {
  const ref = useRef<ShaderMaterial>(null);
  const flower1 = useLoader(TextureLoader, textureFlower1);
  const flower2 = useLoader(TextureLoader, textureFlower2);
  const flower3 = useLoader(TextureLoader, textureFlower3);
  const flower4 = useLoader(TextureLoader, textureFlower4);
  const data = useScroll();

  const slides = [flower1, flower2, flower3, flower4];

  useFrame((state, delta) => {
    // eslint-disable-next-line no-console
    const page = Math.round(data.offset * data.pages);
    const originalScroll = Math.sin(3 * Math.PI * data.offset) / 4;

    if (!ref.current) {
      return;
    }
    value += delta;

    // eslint-disable-next-line no-console
    //console.log("page", page);
    const slide = slides[page];

    ref.current.uniforms.time = {
      value: value,
    };
    ref.current.uniforms.scroll = {
      value: originalScroll,
    };

    ref.current.uniforms.tex = {
      value: slide,
    };
  });

  return (
    <points name="cube2" rotation={[0, 0, 0]} position={new Vector3(0, 0.0, 0)}>
      <planeGeometry args={[0.8, 1, 450, 450]} />

      <shaderMaterial
        ref={ref}
        vertexShader={vertex[0]}
        fragmentShader={fragment[0]}
        uniforms={{
          tex: {
            value: flower2,
          },
        }}
      />
    </points>
  );
};
