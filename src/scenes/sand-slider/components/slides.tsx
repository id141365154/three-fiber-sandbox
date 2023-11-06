import { forwardRef, useRef } from "react";
import {
  Float32BufferAttribute,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";

import { useFrame } from "@react-three/fiber";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

// eslint-disable-next-line no-console

import { fragment } from "./fragment";
import { vertex } from "./vertex";

import font from "./font.json";
import { GeometryUtils } from "./utils";

export type TCubeRef = { offset: number; max: number };

let time = 0;
const particles = 10000;

const loader = new FontLoader();
const myFont = loader.parse(font);

const strings = new Map([
  ["1", "APPS"],
  ["2", "WEB"],
  ["3", "IoT"],
  ["4", "#1"],
]);

const s = strings.get("1") || "";

const geometry = new TextGeometry(s, {
  font: myFont,
  size: 10,
  height: 3,
  steps: 20,
  depth: 0.1,
  curveSegments: 2,
});

strings.forEach((str, i) => {
  const geo = new TextGeometry(str, {
    font: myFont,
    size: 10,
    height: 3,
    steps: 20,
    depth: 0.1,
    curveSegments: 2,
  });

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

  //  geometry.attributes.inPos = geometry.attributes.position.clone();

  // for (let index = 0; index < geometry.attributes.position.count; index++) {
  //   const z = geometry.attributes.position.getZ(index);
  //   const y = geometry.attributes.position.getY(index);
  //   const w = geometry.attributes.position.getW(index);
  //   const Xin = randFloat(1, 3) - index * 0.5;

  //   //const Y = randFloat(1, 100) + (index / 100) * Math.sin(index) - index / 40;
  //   geometry.attributes.inPos.setXYZW(index, Xin, y, z, w);
  // }

  return (
    <>
      <group
        position={[0, 0, 1.5]}
        scale={[0.1, 0.1, 0.1]}
        rotation={[0, 1, 0]}
      >
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
