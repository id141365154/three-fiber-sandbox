import glsl from "glslify";

export const fragment = glsl`
  varying vec3 vColor;
  // particles darker than this are not rendered
  uniform float minLuma;

  void main() {
    // if (dot(vColor, vec3(.299, .587, .114)) < 0.8) {
    //   discard;
    // }

    gl_FragColor = vec4(vColor, 1.);
  }
`;
