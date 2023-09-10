import glsl from 'glslify';

export const vertex2 = glsl`

#pragma glslify: ease = require(glsl-easings/quintic-in-out);
#pragma glslify: cnoise = require(glsl-noise/classic/3d)

varying vec2 vUv; 
varying vec3 vertexNormal; 
uniform float time;
uniform float scroll;
uniform vec2 resolution;
uniform vec2 pointerPos;
 
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
} 

void main() {
  vUv = uv;

  float easeScroll = ease(scroll);
    
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

  float pointSize = 5. * (1. - scroll);
  gl_PointSize = clamp(pointSize, 3., 8.);
   
  vec4 res =  projectionMatrix * modelViewPosition;
 
  vec2 pos;

  float r = random(res.xy) *2. -1. ;
    
  res.xy = res.xy + res.xy * scroll + r/5.*scroll  * time/5. ;

  
   

  gl_Position =  res;
   
}`;
