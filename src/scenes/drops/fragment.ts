// how many drops one click makes at most
export const maxDrops = 8;
// how many transitions can run at once (a click starts a new one)
export const maxLayers = 6;

const layerSamplers = Array.from(
  { length: maxLayers },
  (_, k) => `uniform sampler2D uLayer${k};`,
).join("\n");

// every running transition shows its image over the previous ones
const layerMix = Array.from(
  { length: maxLayers },
  (_, k) =>
    `color = mix(color, texture2D(uLayer${k}, uv + offset).rgb, reveals[${k}]);`,
).join("\n  ");

export const fragment = /* glsl */ `
varying vec2 vUv;

uniform sampler2D uBase;
${layerSamplers}
uniform float uTime;
uniform float uAspect;
uniform float uSpeed;
// softness of the edge of the new image
uniform float uEdge;
// how far the noise pushes the edge, and the size of its details (higher =
// smaller details)
uniform float uNoiseAmount;
uniform float uNoiseScale;
uniform float uWaveAmount;
uniform float uWaveFrequency;
uniform float uLight;
// xy - the place of the drop in uv, z - the time it falls; DROPS drops of
// every layer in a row
uniform vec3 uDrops[LAYERS * DROPS];

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void main() {
  vec2 uv = vUv;
  vec2 offset = vec2(0.0);
  float reveals[LAYERS];
  float light = 0.0;

  // the edge is uneven: the distance is shifted by two octaves of noise
  float n = noise(uv * uNoiseScale) * 0.65 + noise(uv * uNoiseScale * 2.3) * 0.35;

  for (int k = 0; k < LAYERS; k++) {
    reveals[k] = 0.0;

    for (int i = 0; i < DROPS; i++) {
      vec3 drop = uDrops[k * DROPS + i];
      vec2 delta = (uv - drop.xy) * vec2(uAspect, 1.0);
      float d = length(delta);
      float radius = max(uTime - drop.z, 0.0) * uSpeed;
      bool fallen = uTime > drop.z;

      float front = d + (n - 0.5) * 2.0 * uNoiseAmount;
      if (fallen) {
        reveals[k] = max(reveals[k], 1.0 - smoothstep(radius - uEdge, radius, front));
      }

      // wave: sharp ahead of the front, a fading tail behind it
      float x = front - radius;
      float envelope = x > 0.0 ? exp(-x * x * 400.0) : exp(x * 4.0);
      float fade = 1.0 - smoothstep(0.0, 2.2, radius);
      float wave = fallen ? sin(x * uWaveFrequency) * envelope * fade : 0.0;

      offset += normalize(delta + 1e-5) * wave * uWaveAmount;
      light += wave;
    }
  }

  vec3 color = texture2D(uBase, uv + offset).rgb;
  ${layerMix}
  color += light * uLight;

  gl_FragColor = vec4(color, 1.0);
  #include <encodings_fragment>
}
`;
