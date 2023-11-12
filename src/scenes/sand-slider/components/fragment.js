import glsl from "glslify";

export const fragment = glsl`
  varying vec2 vUv;
  uniform sampler2D tex;
  uniform float scroll;
  uniform vec2 resolution;
  uniform vec2 pointerPos;

  void main() {

    float pi =  3.1415926535897932384626433832795;

    float period = clamp(cos(scroll*2.*pi), .2, 1.);
     
    vec4 texture = texture2D(tex, vec2(vUv.x/1.25, vUv.y))  ;
     

    gl_FragColor = vec4(vUv,1., 1.);
    gl_FragColor.a = period ;
     
 
  }
`;
