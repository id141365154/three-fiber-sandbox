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
uniform sampler2D tex;
attribute vec3 noisePos;
 
void main() {

  vUv = uv;
  vec4 img = texture2D(tex, vUv);

 

  vec3 mixed = mix(position,noisePos, 0. );
  
  
  if(img.r >= 0. ){
    
     
    mixed = mix(position,noisePos,  scroll/200.);
     
    float n = cnoise(  mixed  ) * 10.   ;
    mixed.y = mixed.y + mixed.y * n * scroll/10.;
     
    
  }

  if(img.r >= .2 ){
    
    mixed = mix(position,noisePos,  scroll/ 130. );
     
    float n = cnoise(  mixed/100.  ) * 10.   ;
    mixed.y = mixed.y + mixed.y * n * scroll/10.;
  }

  if(img.r >= .5){
    mixed = mix(position,noisePos,  scroll/30. );
    float n = cnoise(  mixed / 200.   ) * 10.   ;
    mixed.y = mixed.y + mixed.y * n * scroll* 2.;
  }

  if(img.r >= .6){
    mixed = mix(position,noisePos,  scroll/9. );
    float n = cnoise(  mixed / 20. ) * 15.   ;
    mixed.y = mixed.y + mixed.y * n * scroll * 2.;
  }

  if(img.r >= .7){
    
    mixed = mix(position,noisePos,  scroll/6. );
    float n = cnoise(  mixed * 1.2  ) * 3.   ;
    mixed.y = mixed.y + mixed.y * n * scroll;
  }

  if(img.r >= .8){
    mixed = mix(position,noisePos,  scroll/2. );
    float n = cnoise(  mixed * 1.2  ) * 10.   ;
    mixed.y = mixed.y + mixed.y * n * scroll;
  }

  if(img.r >= .95){
    
    mixed = mix(position,noisePos,  scroll );
     
    float n = cnoise(  mixed  ) * 30.   ;
    mixed.y = mixed.y + mixed.y * n * scroll;
     
  }

   

  vec4 modelViewPosition = modelViewMatrix * vec4(mixed, 1.0); 

  gl_PointSize = 2.;

  vec4 res =  projectionMatrix * modelViewPosition;

  gl_Position =  res;   
   
}`;
