import glsl from 'glslify';



export const vertexOpacity = glsl`
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
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

  vec4 res =  projectionMatrix * modelViewPosition;
 
  gl_Position =  res;
   
}`;
