import glsl from "glslify";

export const fragment = glsl`
  varying vec2 vUv;
  uniform sampler2D tex;
  uniform float scroll;

  void main() {
     
    vec2 newvUv = vec2( vUv.x/1.25, vUv.y) + vec2(0.5, 0.5);

   

    vec4 t = texture2D(tex, newvUv)  ;
    gl_FragColor = t;

    //if(t.r<0.1 && t.g<0.1 && t.b<0.1 ) discard;
  }
`;
