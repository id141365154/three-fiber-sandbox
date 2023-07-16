import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Vector2, Vector3, Vector4 } from "three";
import { glsl } from "../lib";

const vertex = glsl`

    varying vec3 Normal;
    varying vec3 Position;

    uniform float time;

  void main() {
    Normal = normalize(normalMatrix * normal);
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.y += sin(modelPosition.y * time);
    // modelPosition.x += sin(modelPosition.x * time);
    // modelPosition.z += sin(modelPosition.z * time);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition; 
  }`;

const fragment = glsl` 

varying vec3 Normal;
varying vec3 Position;

uniform vec3 Ka;
uniform vec3 Kd;
uniform vec3 Ks;
uniform vec4 LightPosition;
uniform vec3 LightIntensity;
uniform float Shininess;

vec3 phong() {
  vec3 n = normalize(Normal);
  vec3 s = normalize(vec3(LightPosition) - Position);
  vec3 v = normalize(vec3(-Position));
  vec3 r = reflect(-s, n);

  vec3 ambient = Ka;
  vec3 diffuse = Kd * max(dot(s, n), 0.0)*6.0;
  vec3 specular = Ks * pow(max(dot(r, v), 0.0), Shininess);

  return LightIntensity * (ambient + diffuse + specular);
}

void main() {
  vec3 blue = vec3(0.0, 0.0, 1.0);
  gl_FragColor = vec4(blue*phong(), 1.0);
}
`;

const WaveMaterial = shaderMaterial(
  {
    time: 0,
    resolution: new Vector2(),
    pointer: new Vector2(),
    Ka: new Vector3(1, 1, 1),
    Kd: new Vector3(1, 1, 1),
    Ks: new Vector3(3, 1, 1),
    LightIntensity: new Vector4(4.5, 0.5, 0.5, 1.0),
    LightPosition: new Vector4(0.0, 2000.0, 0.0, 1.0),
    Shininess: 100.0,
  },
  vertex[0],
  fragment[0]
);
extend({ WaveMaterial });

export const Cube = () => {
  const ref = useRef();
  const { viewport, size } = useThree();
  useFrame((state, delta) => {
    if (!ref.current) {
      return;
    }
    //@ts-expect-error
    ref.current.time += delta;
  });
  return (
    <mesh name="cube2" rotation={[0, 0, 0]} position={[0, 0, 0]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      {/* <meshPhysicalMaterial map={textureMap} /> */}
      {/* @ts-expect-error */}
      <waveMaterial
        ref={ref}
        key={WaveMaterial.key}
        resolution={[size.width * viewport.dpr, size.height * viewport.dpr]}
      />
    </mesh>
  );
};
