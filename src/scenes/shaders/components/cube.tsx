import { useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { MeshPhysicalMaterial, TextureLoader } from "three";
import { glsl } from "../lib";
import texture from "../floor-texture.webp";
import CustomShaderMaterial from "three-custom-shader-material";

const vertex = glsl`
varying vec2 vertexUV; 
varying vec3 vertexNormal; 
uniform float time;


 

  

 


void main() {
   
    vertexUV = uv;
    vertexNormal = normalize(normalMatrix * normal);
    
    float angleRadians = (time ) * PI / 180.0;

// Reference: https://www.youtube.com/watch?v=wRmeFtRkF-8
  vec3 result = vec3(
    position.x,
    sin(pow(position.x, 2.0)+pow(position.z, 2.0)+time)*0.2,
    position.z
  );
    

    csm_Position =  result;

}`;

const fragment = glsl` 
varying vec2 vertexUV; 
varying vec3 vertexNormal; 
 
uniform float time;

    void main() {
        float intentsity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)); 
        vec3 atmosphere = vec3(2.7, 0.7, 0.7) * pow(intentsity, 1.5);
        
        csm_DiffuseColor = vec4(vertexUV, sin(time*0.5), 1.0);
         
    }
`;

let value = 0;

export const Cube = () => {
  const textureMap = useLoader(TextureLoader, texture);
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
    <mesh name="cube2" rotation={[0, 0, 0]} position={[0, 0.2, 0]} castShadow>
      <boxGeometry args={[10, 0.2, 9, 100, 2, 100]} />
      <meshPhysicalMaterial map={textureMap} wireframe />

      <CustomShaderMaterial
        ref={ref}
        baseMaterial={MeshPhysicalMaterial}
        vertexShader={vertex[0]}
        fragmentShader={fragment[0]}
        bumpMap={textureMap}
        bumpScale={0.2}
        // wireframe
        // uniforms={{
        //   time: { value: ref.current },
        // }}
        //          uniforms={uniforms}
        //transparent
      />
    </mesh>
  );
};
