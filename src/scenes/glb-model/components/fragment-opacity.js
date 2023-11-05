import glsl from "glslify";

export const fragmentOpacity = glsl`
  varying vec2 vUv;
  uniform sampler2D tex;
  uniform float scroll;
  uniform vec2 resolution;
  uniform vec2 pointerPos;

  void main() {

    float x =  clamp(pointerPos.x*300., 0., 1.);
    // vec2 newvUv = vec2( vUv.x/1.25, vUv.y) + vec2(0.5, 0.5);

    

    vec4 t = texture2D(tex, vUv) ;
    gl_FragColor = vec4(vUv, 1., 1.) ;
    gl_FragColor.a =1. - x;
    //gl_FragColor.a = 0.;

  }
`;
