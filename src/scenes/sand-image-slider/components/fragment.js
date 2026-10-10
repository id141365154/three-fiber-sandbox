import glsl from "glslify";

export const fragment = glsl`
  varying vec3 vColor;
  varying float vAlpha;
  varying vec2 vDir;
  varying float vLen;
  varying float vSize;
  // particles darker than this are not rendered
  uniform float minLuma;

  void main() {
    // if (dot(vColor, vec3(.299, .587, .114)) < 0.8) {
    //   discard;
    // }

    // pixel of the sprite relative to its center, y up like on the screen
    vec2 p = (gl_PointCoord - .5) * vSize;
    p.y = -p.y;

    // the particle is a 1.5 px wide segment: the head is at the front end of
    // the trail, the tail is behind it
    float along = dot(p, vDir);
    float across = dot(p, vec2(-vDir.y, vDir.x));
    float halfLen = vLen * .5 + .75;
    float inside = step(abs(across), .75) * step(abs(along), halfLen);

    // the trail fades from the head (1) to the tail (0); without a trail
    // there is no fade and the particle is a plain square
    float f = clamp((along + halfLen) / (2. * halfLen), 0., 1.);
    float fade = mix(1., f * f, smoothstep(0., 2., vLen));

    float alpha = inside * fade * vAlpha;
    if (alpha < .01) {
      discard;
    }

    gl_FragColor = vec4(vColor, alpha);
  }
`;
