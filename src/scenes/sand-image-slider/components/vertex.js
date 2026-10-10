import glsl from "glslify";

export const vertex = glsl`
#pragma glslify: cnoise = require(glsl-noise/classic/3d);

varying vec3 vColor;
// opacity of the particle, 1 at its place in an image, 1 - fadeOut in the
// scattered state
varying float vAlpha;
// direction of the movement on the screen, length of the trail and the size
// of the point sprite, all in pixels
varying vec2 vDir;
varying float vLen;
varying float vSize;
uniform vec2 resolution;
uniform float scroll;
uniform float worldSize;
// share of each half of the transition over which the start of the flights is
// spread along the image, 0..1 (0 = all particles start together)
uniform float delaySpread;
// where the particles scatter to: the wind has a steady direction, strength of
// the steady push and of the turbulence (world units) and size of the gusts
// (noise frequency); scatter multiplies the resulting offset
uniform vec3 windDir;
uniform float windPush;
uniform float windTurbulence;
uniform float windScale;
uniform float scatter;
// roughness of the wave front: how far (share of the image width) the noise
// moves the start of a particle along the wave, and the frequency of the noise
// per world unit
uniform float waveNoise;
// share of the transition in which the next image is already gathering while
// the current one is still scattering, 0..1 (0 = one after another)
uniform float overlap;
// how much the particles fade out while scattered, 0..1: 1 - they are gone
// completely (the image is empty until the next one starts to gather), less -
// they stay as a dim dust
uniform float fadeOut;
uniform float waveNoiseScale;
// how far back along its path the trail reaches, in transition progress: the
// trail is the path the particle passes during that time
uniform float trailLength;
// longest trail, pixels
uniform float maxTrail;
// position / col - current slide, posNext / colNext - next slide
// scroll - progress of the transition between them, 0..1
attribute vec3 posNext;
attribute vec3 col;
attribute vec3 colNext;

const float pointSize = 3.5;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// smootherstep: zero speed and acceleration at both ends
float ease(float t) {
  return t * t * t * (t * (t * 6. - 15.) + 10.);
}

// Eased progress of a particle in one half of the transition (u, 0..1). The
// particles with start = 0 go first, the ones with start = 1 start delaySpread
// of the half later, and every particle flies for the rest of it.
float leg(float u, float start) {
  return ease(clamp((u - start * delaySpread) / (1. - delaySpread), 0., 1.));
}

// Where the particle scatters to: a steady push along the wind plus gusts of
// a 3D noise. The noise depends on the position, so neighbouring particles are
// blown together, and every particle has its own strength, so they scatter.
vec3 scatterPoint() {
  vec3 np = vec3(position.xy * windScale, 0.);
  vec3 gust = vec3(
    cnoise(np),
    cnoise(np + vec3(17.3, 5.1, 9.7)),
    cnoise(np + vec3(41.9, 23.3, 3.1))
  );
  float own = mix(.4, 1.6, hash(position.xy));

  vec3 wind = (normalize(windDir) * windPush + gust * windTurbulence) * own;
  return position + wind * scatter;
}

// Eased progress of the scattering (x) and of the gathering (y) at the
// transition progress s.
// Both go from the left edge of the image to the right one: the scattering
// of the current image and the gathering of the next one.
vec2 legs(float s) {
  // place along the wave, 0 = left edge of the image, 1 = right edge, shifted
  // by the noise so the front of the wave is not a straight line
  float right = clamp(
    position.x / worldSize + .5 + cnoise(vec3(position.xy * waveNoiseScale, 3.7)) * waveNoise,
    0., 1.
  );
  float rightNext = clamp(
    posNext.x / worldSize + .5 + cnoise(vec3(posNext.xy * waveNoiseScale, 8.3)) * waveNoise,
    0., 1.
  );

  // The image scatters during the first span of the transition and the next
  // one gathers during the last span. Each span is (1 + overlap) / 2 of the
  // transition: with overlap = 0 the gathering starts when the scattering has
  // finished, otherwise it starts while the last particles are still flying away.
  float span = (1. + overlap) * .5;
  float away = leg(clamp(s / span, 0., 1.), right);
  float back = leg(clamp((s - (1. - span)) / span, 0., 1.), rightNext);

  return vec2(away, back);
}

// Position of the particle at the transition progress s
vec3 flight(float s) {
  vec2 e = legs(s);
  vec3 scattered = scatterPoint();

  return position + (scattered - position) * e.x + (posNext - scattered) * e.y;
}

vec2 toScreen(vec4 clip) {
  return clip.xy / clip.w * .5 * resolution;
}

void main() {
  // the particle takes the color of the next image while it gathers
  vec2 e = legs(scroll);
  vColor = mix(col, colNext, e.y);

  // The particle fades out in proportion to the way it has flown away from its
  // place (up to fadeOut) whatever the distance of its scatter point is. While
  // it gathers, it fades back in.
  vAlpha = 1. - fadeOut * e.x * (1. - e.y);

  // velocity of the particle (world units per unit of progress). It is zero
  // before the particle starts, while it hangs in the scattered state and
  // after it lands, so the trail appears only in flight
  float eps = .01;
  vec3 velocity = (flight(scroll + eps) - flight(scroll - eps)) / (2. * eps);

  vec3 head = flight(scroll);
  vec3 tail = head - velocity * trailLength;

  mat4 mvp = projectionMatrix * modelViewMatrix;
  vec2 delta = toScreen(mvp * vec4(head, 1.)) - toScreen(mvp * vec4(tail, 1.));
  float len = min(length(delta), maxTrail);

  vDir = len > 0. ? normalize(delta) : vec2(1., 0.);
  vLen = len;
  vSize = pointSize + len;

  // the sprite is centered between the head and the tail
  gl_PointSize = vSize;
  gl_Position = mvp * vec4((head + tail) * .5, 1.);
}`;
