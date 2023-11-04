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
  vec4 modelViewPosition = modelViewMatrix * vec4(mix(position, newPos, x), 1.0);
  //vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

  gl_PointSize = 2.0;

  float d = distance(position.xy, pointerPos);

  float n = cnoise(position  + time/2. ) * 10.;

   
   
  float pointer =  1.- smoothstep(0., .1, d); 
   
  vec4 res =  projectionMatrix * modelViewPosition;
 
  
  gl_Position =  res +  x * n*20. ;
   
}`;
