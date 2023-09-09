import glsl from 'glslify';

export const vertex = glsl`

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

  gl_PointSize = 10.0;
   
  vec4 res =  projectionMatrix * modelViewPosition;
 
  float d = distance(position.xy, pointerPos);

  float n = cnoise(position * 6. + time/5. )*10.;
   
  float pointer =  1.- smoothstep(0., .8, d); 
  vec2 pos;
  pos.x = res.x +  res.x * n * easeScroll * 2.;
  pos.y = res.y +  res.y * n * easeScroll * .5;

  float pointSize = 5. * (1. - easeScroll);
  gl_PointSize = clamp(pointSize, 2., 8.) ;
    
  res.xy = pos;
  res.w =  res.w + n*.2 * easeScroll;

  res.w = (1. - n/300. * pointer)- 0.5;

  gl_Position =  res;
   
}`;
