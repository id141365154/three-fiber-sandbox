import glsl from "glslify";

export const fragment = glsl`
  varying vec2 vUv;
  uniform sampler2D tex;
  uniform float scroll;
  uniform vec2 resolution;

  void main() {
     
    vec4 texture = texture2D(tex, vec2(vUv.x/1.25, vUv.y))  ;
     
    gl_FragColor = texture * (1.- scroll/2.);

    // gl_FragColor = vec4(vUv, 1., 1.);
     
 
  }
`;
