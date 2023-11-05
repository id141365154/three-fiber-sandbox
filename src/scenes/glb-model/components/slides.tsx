import { forwardRef, useRef } from "react";
import { ShaderMaterial, Vector2, Vector3 } from "three";

// @ts-ignore
import nikeModel from "./nike.glb";
// @ts-ignore
import shoeModel from "./shoe.glb";

import { useGLTF } from "@react-three/drei";

import { fragment } from "./fragment";
import { vertex } from "./vertex";
import { vertexOpacity } from "./vertex-opacity";
import { fragmentOpacity } from "./fragment-opacity";
import { useFrame } from "@react-three/fiber";
import { randFloat } from "three/src/math/MathUtils";

type Props = {
  variant: "1" | "2";
};

export type TCubeRef = { offset: number; max: number };

let time = 0;

export const Slides = forwardRef<TCubeRef, Props>((props, forwarderRef) => {
  const ref = useRef<ShaderMaterial>(null);
  const ref2 = useRef<ShaderMaterial>(null);
  const nike = useGLTF(nikeModel);
  const shoe = useGLTF(shoeModel);

  useFrame((state, delta) => {
    if (!ref.current || !ref2.current) {
      return;
    }

    // @ts-ignore
    const scrollVal = forwarderRef?.current?.offset || 0;
    // @ts-ignore
    const max = forwarderRef?.current?.max || window.innerHeight;

    const offset = (scrollVal * 100) / max / 100;

    ref.current.uniforms.scroll = {
      value: offset ?? 0,
    };

    time += delta;
    ref.current.uniforms.time = {
      value: time,
    };

    // @ts-ignore
    ref.current.uniforms.pointerPos.value = state.pointer;
    ref2.current.uniforms.pointerPos.value = state.pointer;
  });

  // @ts-ignore
  const nikeMaterial = nike.materials.NikeShoe;
  nikeMaterial.wireframe = false;
  /* @ts-ignore */
  const geometry = nike.nodes.defaultMaterial.geometry;

  geometry.attributes.newPos = geometry.attributes.position.clone();

  for (let index = 0; index < geometry.attributes.newPos.count; index++) {
    const x = geometry.attributes.newPos.getX(index);

    const w = geometry.attributes.newPos.getW(index);

    const X = randFloat(-100, 1) + (index / 200) * Math.cos(index);
    const Y = randFloat(1, 100) + (index / 100) * Math.sin(index) - index / 40;

    geometry.attributes.newPos.setXYZW(index, x, X, Y, w);
  }

  return (
    <>
      <group position={[0, 0, 0]}>
        <points
          receiveShadow
          castShadow
          /* @ts-ignore */
          geometry={geometry}
          /* @ts-ignore */
          material={nikeMaterial}
        >
          <shaderMaterial
            transparent
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
        <mesh
          receiveShadow
          castShadow
          /* @ts-ignore */
          geometry={geometry}
          /* @ts-ignore */
          material={nikeMaterial}
        >
          <shaderMaterial
            ref={ref2}
            transparent
            vertexShader={vertexOpacity}
            fragmentShader={fragmentOpacity}
            uniforms={{
              resolution: {
                value: new Vector2(window.innerWidth, window.innerHeight),
              },

              pointerPos: {
                value: new Vector3(0, 0, 0),
              },
            }}
          />
        </mesh>
      </group>
    </>
  );
});
