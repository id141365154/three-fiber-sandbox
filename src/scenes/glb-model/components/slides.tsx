import { forwardRef, useRef } from "react";
import { ShaderMaterial, Vector2, Vector3 } from "three";

// @ts-ignore
import nikeModel from "./nike.glb";

import { useGLTF } from "@react-three/drei";

import { fragment } from "./fragment";
import { vertex } from "./vertex";
import { useFrame } from "@react-three/fiber";
import { randFloat } from "three/src/math/MathUtils";

type Props = {
  variant: "1" | "2";
};

export type TCubeRef = { offset: number; max: number };

let time = 0;

export const Slides = forwardRef<TCubeRef, Props>((props, forwarderRef) => {
  const ref = useRef<ShaderMaterial>(null);
  const nike = useGLTF(nikeModel);

  useFrame((state, delta) => {
    if (!ref.current) {
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
  });

  // @ts-ignore
  const nikeMaterial = nike.materials.NikeShoe;
  nikeMaterial.wireframe = true;
  /* @ts-ignore */
  const geometry = nike.nodes.defaultMaterial.geometry;

  geometry.attributes.newPos = geometry.attributes.position.clone();

  for (let index = 0; index < geometry.attributes.newPos.count; index++) {
    geometry.attributes.newPos.setXYZW(
      index,
      randFloat(-600, 600),
      randFloat(-600, 600),
      randFloat(-600, 600)
    );
  }
  //.applyMatrix3(randomizeMatrix);

  // eslint-disable-next-line no-console
  console.log("geometry", geometry);
  //geometry.wireframe = true;
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
      </group>
    </>
  );
});
