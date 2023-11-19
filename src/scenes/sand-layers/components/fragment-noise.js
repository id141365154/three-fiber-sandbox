import glsl from "glslify";

export const fragmentNoise = glsl`
  varying vec2 vUv;
  uniform sampler2D tex;
  uniform sampler2D noiseTex;
  uniform float scroll;
  uniform vec2 resolution;
  uniform vec2 pointerPos;

  void main() {

     
    vec4 texture = texture2D(tex, vec2(vUv.x/1.25, vUv.y))  ;
     
     
    
    gl_FragColor = texture;
     
     
 
  }
`;
