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
attribute vec3 pos2;
attribute vec3 pos3;
attribute vec3 pos4;

 
 
void main() {

  float pi =  3.1415926535897932384626433832795;
 
  float x = scroll;

  vUv = uv;
 
  vec3 mixed = mix(position, pos2, x);


  float period = abs(sin(x*pi));
  
  if(x>=1.){
     mixed = mix(pos2, pos3, x - 1.);
  }
  if(x>=2.){
    mixed = mix(pos3, pos4, x - 2.);
  }

 

  vec4 modelViewPosition = modelViewMatrix * vec4(mixed, 1.0);

   

  gl_PointSize = 1.5 ;

 
  vec4 res =  projectionMatrix * modelViewPosition;
  float n = cnoise(  mixed /3. - time/3. ) * 1.3   ;
 

   

  res.y = res.y  + res.y * n * period;

   
   
   
  gl_Position =  res;
   
   
   
}`;
