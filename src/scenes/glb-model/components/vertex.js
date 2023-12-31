import glsl from 'glslify';



export const vertex = glsl`
#pragma glslify: cnoise = require(glsl-noise/classic/3d)

varying vec2 vUv; 
varying vec3 vertexNormal; 
uniform float time;
uniform float scroll;
uniform vec2 resolution;
uniform vec2 pointerPos;
attribute vec3 newPos;
attribute vec2 newUv;
 
 
void main() {

  float x =  clamp(pointerPos.x/30., 0., 1.);

  vUv = uv;

  vec3 mixed = mix(position, newPos, x);

  vec4 modelViewPosition = modelViewMatrix * vec4(mixed, 1.0);

  gl_PointSize = 2.0  ;

  float d = distance(position.xy, pointerPos);

  

   
   
  float pointer =  1.- smoothstep(0., .1, d); 
   
  vec4 res =  projectionMatrix * modelViewPosition;
  float n = cnoise( mixed /2.  ) * 1.   ;
  res.y = res.y  + res.y * n * x * 1200. ;
   
   
  
  gl_Position =  res;
   
   
   
}`;
