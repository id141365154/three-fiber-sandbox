import glsl from "glslify";

export const fragment = glsl`
 
#pragma glslify: cnoise = require(glsl-noise/classic/3d)

  varying vec2 vUv;
  uniform sampler2D tex;
  uniform sampler2D noise;
  uniform float scroll;
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 pointerPos;
 
  void main() {
     
  vec4 img = texture2D(tex, vUv);
   

  vec4 res =  img ;

  if(res.r == 0.){
    discard;
  }

  gl_FragColor = res;
     
     
 
  }
`;
