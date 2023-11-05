import glsl from "glslify";

export const fragment = glsl`
  varying vec2 vUv;
  uniform sampler2D tex;
  uniform float scroll;
  uniform vec2 resolution;
  uniform vec2 pointerPos;

  void main() {
     
    float x =  clamp(pointerPos.x, 0., 1.) * 2.;
    vec4 texture = texture2D(tex, vec2(vUv.x/1.25, vUv.y))  ;
     
    //gl_FragColor = texture * (1.- scroll/2.);

    gl_FragColor = vec4(vUv, 1., 1.);
    gl_FragColor.a = 1. -  x ;
     
 
  }
`;
