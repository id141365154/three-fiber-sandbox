import { forwardRef, useRef } from "react";
import {
  Float32BufferAttribute,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";

import { useFrame } from "@react-three/fiber";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import {
  TextGeometry,
  TextGeometryParameters,
} from "three/examples/jsm/geometries/TextGeometry";

import { fragment } from "./fragment";
import { vertex } from "./vertex";

import font from "./font.json";
import { GeometryUtils } from "./utils";

export type TCubeRef = { offset: number; max: number };

let time = 0;
const particles = 5000;

const loader = new FontLoader();
const myFont = loader.parse(font);

const strings = new Map([
  ["1", "React"],
  ["2", "Three"],
  ["3", "Fiber"],
  ["4", "Awesome"],
]);

const s = strings.get("1") || "";

const textParams: TextGeometryParameters = {
  font: myFont,
  size: 10,
  height: 3,
  steps: 10,
  depth: 0.1,
  curveSegments: 2,
};

const geometry = new TextGeometry(s, textParams);

strings.forEach((str, i) => {
  const geo = new TextGeometry(str, textParams);

  geo.center();

  const points = GeometryUtils.randomPointsInBufferGeometry(geo, particles);

  const positions = [];

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    positions.push(p.x, p.y, p.z);
  }
  const pos = new Float32BufferAttribute(positions, 3);

  if (i === "1") {
    geometry.setAttribute("position", pos);
  } else {
    geometry.setAttribute(`pos${i}`, pos);
  }
});

export const Slides = forwardRef<TCubeRef>((props, forwarderRef) => {
  const ref = useRef<ShaderMaterial>(null);

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
      <group position={[0, 0, 0]} scale={[0.1, 0.1, 0.1]} rotation={[0, 1, 0]}>
        <points geometry={geometry}>
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
                value: new Vector3(0, 0, 0),
              },
            }}
          />
        </points>
      </group>
    </>
  );
});
