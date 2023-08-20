import { glsl } from "../lib";

export const fragment = glsl`
  varying vec2 vUv;
  uniform sampler2D tex;

  void main() {

    vec2 newvUv = vec2( vUv.x, vUv.y) + vec2(0.5, 0.5);

    vec4 t = texture2D(tex, newvUv)  ;
    //gl_FragColor = vec4(vUv.x, 1.0, 0.0, 1.0);
    gl_FragColor = t;

   // if(t.r<0.1 && t.g<0.1 && t.b<0.1 ) discard;
  }
`;
