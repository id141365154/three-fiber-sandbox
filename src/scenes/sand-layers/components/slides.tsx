import { forwardRef, useEffect, useRef } from "react";
import {
  GLSL1,
  PlaneGeometry,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";

import { useFrame, useLoader } from "@react-three/fiber";

import { fragment } from "./fragment";
import { vertex } from "./vertex";

import img from "./images/watch.png";
import noiseImg from "./images/smoke.jpeg";
import { randFloat } from "three/src/math/MathUtils";

export type TCubeRef = { offset: number; max: number };

let time = 0;
const points = 1000;

export const Slides = forwardRef<TCubeRef>((props, forwarderRef) => {
  const ref = useRef<ShaderMaterial>(null);
  const refPlaneGeom = useRef<PlaneGeometry>(null);
  const [texture, noiseTexture] = useLoader(TextureLoader, [img, noiseImg]);

  useEffect(() => {
    if (!refPlaneGeom.current) {
      return;
    }

    refPlaneGeom.current.attributes.noisePos =
      refPlaneGeom.current.attributes.position.clone();
    const noisePos = refPlaneGeom.current.attributes.noisePos;

    for (
      let index = 0;
      index < refPlaneGeom.current.attributes.noisePos.count;
      index++
    ) {
      const w = noisePos.getW(index);
      const z = noisePos.getZ(index);

      const X = randFloat(0, 10) * Math.cos(index) + 15;
      const Y = (randFloat(0, 0) * Math.sin(index)) / 2;

      noisePos.setXYZW(index, X, Y, z, w);
    }
  }, []);

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

  return (
    <>
      <group
        position={[0, 0, 0.5]}
        scale={[0.1, 0.1, 0.1]}
        rotation={[0, 1, 0]}
      >
        <points>
          <planeGeometry args={[1, 1, points, points]} ref={refPlaneGeom} />
          <shaderMaterial
            glslVersion={GLSL1}
            ref={ref}
            vertexShader={vertex}
            fragmentShader={fragment}
            uniforms={{
              tex: {
                value: texture,
              },
              noise: {
                value: noiseTexture,
              },
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
                value: new Vector3(0, 0, 0),
              },
            }}
          />
        </points>
      </group>
    </>
  );
});
