import glsl from "glslify";

export const fragment = glsl`
  varying vec2 vUv;
  uniform sampler2D tex;
  uniform float scroll;
  uniform vec2 resolution;

  void main() {
    // vec2 newvUv = vec2( vUv.x/1.25, vUv.y) + vec2(0.5, 0.5);

   

    vec4 t = texture2D(tex, vUv)  ;
    gl_FragColor = vec4(vUv, 1., 1.);

  }
`;
