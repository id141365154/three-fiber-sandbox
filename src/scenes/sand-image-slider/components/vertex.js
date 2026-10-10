import glsl from "glslify";

export const vertex = glsl`
varying vec3 vColor;
uniform float scroll;
uniform float arcHeight;
uniform float worldSize;
// position / col - current slide, posNext / colNext - next slide
// scroll - progress of the transition between them, 0..1
attribute vec3 posNext;
attribute vec3 col;
attribute vec3 colNext;

void main() {
  float pi = 3.1415926535897932384626433832795;

  vec3 d = posNext - position;
  float dist = clamp(length(d) / worldSize, 0., 1.);

  // smootherstep: zero speed and acceleration at both ends
  float e = scroll * scroll * scroll * (scroll * (scroll * 6. - 15.) + 10.);

  float h = length(d);
  // the particle flies along an arc perpendicular to the image plane (z),
  // its height depends on the flight length and vanishes at both ends
  vec3 lift = vec3(0., 0., sin(e * pi) * h * dist);
  vec3 mixed = position + d * e + lift;

  vColor = mix(col, colNext, e);

  gl_PointSize = 1.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(mixed, 1.0);
}`;
