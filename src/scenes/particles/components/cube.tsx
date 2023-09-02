import { useFrame, useLoader } from "@react-three/fiber";
import { forwardRef, useRef } from "react";
import { ShaderMaterial, TextureLoader, Vector3 } from "three";

import img1 from "../images/1.jpeg";
import img2 from "../images/2.jpeg";
import img3 from "../images/3.jpeg";
import img4 from "../images/4.jpeg";

import { fragment } from "./fragment";
import { vertex } from "./vertex";

let value = 0;

const Pi = 3.141592654;

export type TCubeRef = { offset: number; max: number };

export const Slides = forwardRef<TCubeRef>((props, forwarderRef) => {
  const ref = useRef<ShaderMaterial>(null);
  const texture1 = useLoader(TextureLoader, img1);
  const texture2 = useLoader(TextureLoader, img2);
  const texture3 = useLoader(TextureLoader, img3);
  const texture4 = useLoader(TextureLoader, img4);

  const slides = [texture1, texture2, texture3, texture4];

  useFrame((state, delta) => {
    // @ts-ignore
    const scrollVal = forwarderRef?.current?.offset || 0;
    // @ts-ignore
    const max = forwarderRef?.current?.max || window.innerHeight;

    const offset = (scrollVal * 100) / max / 100;

    const page = Math.round(offset);

    const x = Pi * offset;

    const scroll = Math.abs(Math.sin(Number(x.toFixed(3))));

    if (!ref.current) {
      return;
    }
    value += delta;

    const slide = slides[page] || 0;

    ref.current.uniforms.time = {
      value: value,
    };

    ref.current.uniforms.scroll = {
      value: scroll ?? 0,
    };

    ref.current.uniforms.tex = {
      value: slide,
    };
  });

  return (
    <points
      name="cube2"
      rotation={[0, 0, 0]}
      position={new Vector3(0, 0.0, 0.5)}
    >
      <planeGeometry args={[1 * 1.25, 1, 600 * 1.25, 600]} />

      <shaderMaterial
        ref={ref}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{
          time: {
            value: 0,
          },
          scroll: {
            value: 0,
          },
          tex: {
            value: slides[0],
          },
        }}
      />
    </points>
  );
});
