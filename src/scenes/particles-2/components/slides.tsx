import { useFrame, useLoader } from "@react-three/fiber";
import { forwardRef, useRef } from "react";
import { ShaderMaterial, TextureLoader, Vector2, Vector3 } from "three";

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

  const slides = [texture3, texture1, texture2, texture4];

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

    ref.current.uniforms.pointerPos.value = state.pointer;
  });
  const points = 500;
  return (
    <points
      name="cube2"
      rotation={[0, 0, 0]}
      position={new Vector3(0, 0.0, 0.5)}
      // onPointerMove={(e) => {
      //   // eslint-disable-next-line no-console
      //   //console.log("e.point", e.point);
      //   if (!ref.current) {
      //     return;
      //   }
      //   // eslint-disable-next-line no-console
      //   //console.log("e", e.point);
      //   ////alert("p");
      //   //ref.current.uniforms.pointerPos.value = e.point;
      // }}
    >
      <planeGeometry args={[1, 1, points * 1.25, points]} />

      <shaderMaterial
        ref={ref}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{
          resolution: {
            value: new Vector2(window.innerWidth, window.innerHeight),
          },
          time: {
            value: 0,
          },
          scroll: {
            value: 0,
          },
          tex: {
            value: slides[0],
          },
          pointerPos: {
            value: new Vector3(
              0.10020708081678344,
              0.2366080311766521,
              0.7114697690371564
            ),
          },
        }}
      />
    </points>
  );
});
