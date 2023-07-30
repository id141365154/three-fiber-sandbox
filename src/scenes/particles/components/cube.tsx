import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { DoubleSide, Vector3 } from "three";

import { glsl } from "../lib";

const vertex = glsl`
varying vec3 vUv; 
 
void main() {
   
  vUv = position; 

  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewPosition; 

}`;

const fragment = glsl` 
varying vec3 vUv;
    void main() {
      gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
    }
`;

let value = 0;

export const Cube = () => {
  const ref = useRef();

  useFrame((state, delta) => {
    if (!ref.current) {
      return;
    }
    value += delta;
    //@ts-expect-error
    ref.current.uniforms.time = {
      value: value,
    };
  });

  return (
    <points name="cube2" rotation={[0, 0, 0]} position={new Vector3(0, 0.2, 0)}>
      <boxGeometry args={[2, 2, 2, 100, 100, 100]} />

      <shaderMaterial
        side={DoubleSide}
        vertexShader={vertex[0]}
        fragmentShader={fragment[0]}
        wireframe
      />
    </points>
  );
};
