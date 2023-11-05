import glsl from 'glslify';



export const vertex = glsl`
#pragma glslify: cnoise = require(glsl-noise/classic/3d);
#pragma glslify: ease = require(glsl-easings/quintic-in-out);

varying vec2 vUv; 
varying vec3 vertexNormal; 
uniform float time;
uniform float scroll;
uniform vec2 resolution;
uniform vec2 pointerPos;
attribute vec3 inPos;

 
 
void main() {

 
  float x = scroll/2.;

  vUv = uv;
 
  vec3 mixed = mix(inPos, position, x);

  vec4 modelViewPosition = modelViewMatrix * vec4(mixed, 1.0);

  gl_PointSize = 2.0 ;

  float d = distance(position.xy, pointerPos);

  float pointer =  1.- smoothstep(0., .1, d); 
   
  vec4 res =  projectionMatrix * modelViewPosition;
  float n = cnoise( mixed /5. - time/10. ) * .5    ;
 

  float noiseIndex = clamp((x - 1.) *300., -1., 2.5 );

  res.y = res.y  + res.y * n * noiseIndex ;
   
  gl_Position =  res;
   
   
   
}`;
