import { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";

import { useFrame } from "@react-three/fiber";
import { useBounds } from "@react-three/drei";
import { useControls } from "leva";

import { fragment } from "./fragment";
import { vertex } from "./vertex";
import { images } from "../images";

export type TCubeRef = { offset: number; max: number };

// width of the pixel grid in pixels, one particle per grid pixel
const gridWidth = 1900;
// world size of the grid width
const worldSize = 30;
type TSortBy = "hue" | "saturation" | "lightness";

// How the particles are matched between the slides (see createSlidesData)
type TMatching = {
  // false: particle i stays on the pixel i of every image (no matching), so
  // every particle just flies to the same place of the next image
  enabled: boolean;
  // HSL component the particles are matched by
  by: TSortBy;
  // share of randomness in the matching, 0..1: 0 - strict sorting by `by`,
  // 1 - the order does not depend on the color at all
  randomness: number;
};

// Starting values of the settings, they are edited in the Leva panel
const defaults = {
  // 1: the scroll snaps to a slide and the transition then plays for
  //    `duration` seconds
  // 2: the transition progress follows the scroll position linearly (as in
  //    sand-slider)
  animationMode: 1,
  // seconds the transition to the neighbouring slide takes, regardless of how
  // fast the scroll (with snapping) itself is
  duration: 5,
  matching: {
    enabled: true,
    by: "lightness",
    randomness: 0.3,
  } as TMatching,
  // share of each half of the transition (scattering and gathering) over which
  // the start of the flights is spread along the image, 0 = all start together
  delaySpread: 0.5,
  // steady direction of the wind the particles scatter along
  windDir: [0, 1, 0] as [number, number, number],
  // how far the wind pushes the particles along its direction
  windPush: 1,
  // how far the gusts blow the particles around
  windTurbulence: 3.5,
  // size of the gusts: noise frequency per world unit, less = bigger gusts
  windScale: 2.5,
  // scatter distance, world units per unit of the wind offset above
  scatter: 10,
  // share of the transition in which the next image already gathers while the
  // current one is still scattering, 0 = one after another
  overlap: 0.5,
  // how much the scattered particles fade out, 1 = gone completely (a gap
  // until the next image starts to gather), 0 = no fading
  fadeOut: 0.6,
  // roughness of the wave front: shift of the start of a particle along the
  // wave (share of the image width), 0 = a straight front
  waveNoise: 0.1,
  // frequency of that noise per world unit, less = bigger waves in the front
  waveNoiseScale: 0.3,
  // how far back along its path the trail reaches (share of the transition)
  trailLength: 0,
  // longest trail, pixels
  maxTrail: 0,
  // particles with luma below this are not rendered
  minLuma: 0.1,
};

type TSlidesData = {
  geometry: BufferGeometry;
  positionAttrs: Float32BufferAttribute[];
  colorAttrs: Float32BufferAttribute[];
};

// Animated progress, 0..count-1: it moves to the slide the scroll has snapped
// to at a constant speed of 1 / duration slides per second.
export const slideState = { progress: 0 };

// Scroll position in slides (fractional), 0..count-1
const getScrollSlide = (ref: ForwardedRef<TCubeRef>, count: number) => {
  const current = typeof ref === "function" ? null : ref?.current;
  const scrollVal = current?.offset || 0;
  const max = current?.max || window.innerHeight;

  return Math.min(Math.max(scrollVal / max, 0), count - 1);
};

// Index of the slide the scroll position is closest to
export const getTargetSlide = (ref: ForwardedRef<TCubeRef>, count: number) =>
  Math.round(getScrollSlide(ref, count));

const advanceSlideProgress = (
  target: number,
  delta: number,
  duration: number,
) => {
  const step = delta / duration;
  const diff = target - slideState.progress;

  slideState.progress =
    Math.abs(diff) <= step
      ? target
      : slideState.progress + Math.sign(diff) * step;
};

// Splits the progress into the index of the current slide and the transition
// progress t (0..1) towards the next one. The last slide is the end of the
// transition between the two last slides (t = 1).
export const splitProgress = (progress: number, count: number) => {
  const lastIndex = Math.max(count - 2, 0);
  const index = Math.min(Math.floor(progress), lastIndex);

  return { index, t: count > 1 ? progress - index : 0 };
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// HSL components of the color, each 0..1
const hue = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) {
    return 0;
  }

  let h;
  if (max === r) {
    h = ((g - b) / d + 6) % 6;
  } else if (max === g) {
    h = (b - r) / d + 2;
  } else {
    h = (r - g) / d + 4;
  }
  return h / 6;
};

const saturation = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  return max === min ? 0 : (max - min) / (1 - Math.abs(max + min - 1));
};

const lightness = (r: number, g: number, b: number) =>
  (Math.max(r, g, b) + Math.min(r, g, b)) / 2;

const sortKeys = { hue, saturation, lightness };

const indexRange = 2 ** 24;

// Indices of the colors (rgb triples) sorted by the chosen HSL component with
// a random shift (randomness) added to every key. The key and the index
// are packed into one double (24 + 24 bits) so the native numeric sort can be
// used.
const argsortByColor = (
  colors: Float32Array,
  { by, randomness }: TMatching,
) => {
  const key = sortKeys[by];
  const count = colors.length / 3;
  const packed = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    const k = key(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
    // the key is in -randomness..1 + randomness, bring it back to 0..1
    const shifted = k + (Math.random() * 2 - 1) * randomness;
    const normalized = (shifted + randomness) / (1 + 2 * randomness);
    packed[i] = Math.round(normalized * (indexRange - 1)) * indexRange + i;
  }
  packed.sort();

  const order = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    order[i] = packed[i] % indexRange;
  }
  return order;
};

// One particle per pixel of the width x height grid, in raster order. The
// image is scaled to cover the grid.
const imageToPoints = (
  img: HTMLImageElement,
  width: number,
  height: number,
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("2d context is not available");
  }

  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  const { data } = ctx.getImageData(0, 0, width, height);

  const count = width * height;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const x = i % width;
    const y = Math.floor(i / width);

    // all particles lie in the z = 0 plane
    positions[i * 3] = ((x + 0.5 - width / 2) / width) * worldSize;
    positions[i * 3 + 1] = ((height / 2 - y - 0.5) / width) * worldSize;
    positions[i * 3 + 2] = 0;

    colors[i * 3] = data[i * 4] / 255;
    colors[i * 3 + 1] = data[i * 4 + 1] / 255;
    colors[i * 3 + 2] = data[i * 4 + 2] / 255;
  }

  return { positions, colors };
};

// The shader always blends a pair of slides, so the geometry holds only the
// current (position, col) and the next (posNext, colNext) attributes.
// Attributes of all slides are kept aside and swapped by setSlide.
//
// Particle i is the same particle in every slide. In slide k it stands on the
// pixel of image k whose HSL component (matching.by, with a random shift) has the
// same rank as the one it had in slide k - 1. Matching by rank keeps it one-to-one,
// so every pixel of every image gets exactly one particle.
const createSlidesData = (
  loaded: HTMLImageElement[],
  matching: TMatching,
): TSlidesData => {
  // grid takes the aspect ratio of the first image
  const width = gridWidth;
  const height = Math.round(
    (gridWidth * loaded[0].naturalHeight) / loaded[0].naturalWidth,
  );
  const count = width * height;

  const positionAttrs: Float32BufferAttribute[] = [];
  const colorAttrs: Float32BufferAttribute[] = [];

  let prevColors: Float32Array | null = null;

  loaded.forEach((img) => {
    const pixels = imageToPoints(img, width, height);
    let positions = pixels.positions;
    let colors = pixels.colors;

    if (matching.enabled && prevColors) {
      const source = argsortByColor(prevColors, matching);
      const target = argsortByColor(pixels.colors, matching);
      const pixelOf = new Uint32Array(count);
      for (let rank = 0; rank < count; rank++) {
        pixelOf[source[rank]] = target[rank];
      }

      positions = new Float32Array(count * 3);
      colors = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        for (let c = 0; c < 3; c++) {
          positions[i * 3 + c] = pixels.positions[pixelOf[i] * 3 + c];
          colors[i * 3 + c] = pixels.colors[pixelOf[i] * 3 + c];
        }
      }
    }

    prevColors = colors;
    positionAttrs.push(new Float32BufferAttribute(positions, 3));
    colorAttrs.push(new Float32BufferAttribute(colors, 3));
  });

  const geometry = new BufferGeometry();
  const data = { geometry, positionAttrs, colorAttrs };
  setSlide(data, 0);

  return data;
};

const setSlide = (
  { geometry, positionAttrs, colorAttrs }: TSlidesData,
  index: number,
) => {
  const next = Math.min(index + 1, positionAttrs.length - 1);

  geometry.setAttribute("position", positionAttrs[index]);
  geometry.setAttribute("posNext", positionAttrs[next]);
  geometry.setAttribute("col", colorAttrs[index]);
  geometry.setAttribute("colNext", colorAttrs[next]);
};

const material = new ShaderMaterial({
  transparent: true,
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
    scroll: { value: 0 },
    worldSize: { value: worldSize },
    // the rest is set from the Leva panel (see `defaults` for the meaning)
    delaySpread: { value: defaults.delaySpread },
    windDir: { value: new Vector3(...defaults.windDir) },
    windPush: { value: defaults.windPush },
    windTurbulence: { value: defaults.windTurbulence },
    windScale: { value: defaults.windScale },
    scatter: { value: defaults.scatter },
    overlap: { value: defaults.overlap },
    fadeOut: { value: defaults.fadeOut },
    waveNoise: { value: defaults.waveNoise },
    waveNoiseScale: { value: defaults.waveNoiseScale },
    trailLength: { value: defaults.trailLength },
    maxTrail: { value: defaults.maxTrail },
    minLuma: { value: defaults.minLuma },
    pointerPos: { value: new Vector3(0, 0, 0) },
  },
});

type TSlidesProps = {
  // called once the images are loaded and the particles are ready to show
  onReady?: () => void;
};

export const Slides = forwardRef<TCubeRef, TSlidesProps>(
  (props, forwarderRef) => {
    const { onReady } = props;
    const [loaded, setLoaded] = useState<HTMLImageElement[] | null>(null);
    const [slides, setSlides] = useState<TSlidesData | null>(null);
    const slideIndex = useRef(0);
    const built = useRef(false);
    const bounds = useBounds();

    // Settings panel (Leva)
    const animation = useControls("Animation", {
      mode: {
        value: defaults.animationMode,
        options: { "Snap, then timed": 1, "Follow scroll": 2 },
      },
      duration: { value: defaults.duration, min: 0.5, max: 15, step: 0.1 },
    });
    const wave = useControls("Wave", {
      delaySpread: {
        value: defaults.delaySpread,
        min: 0,
        max: 0.95,
        step: 0.01,
      },
      overlap: { value: defaults.overlap, min: 0, max: 1, step: 0.01 },
      waveNoise: { value: defaults.waveNoise, min: 0, max: 0.5, step: 0.01 },
      waveNoiseScale: {
        value: defaults.waveNoiseScale,
        min: 0.05,
        max: 2,
        step: 0.05,
      },
    });
    const wind = useControls("Wind", {
      windDir: { value: defaults.windDir, step: 0.1 },
      windPush: { value: defaults.windPush, min: 0, max: 10, step: 0.1 },
      windTurbulence: {
        value: defaults.windTurbulence,
        min: 0,
        max: 10,
        step: 0.1,
      },
      windScale: { value: defaults.windScale, min: 0.1, max: 6, step: 0.1 },
      scatter: { value: defaults.scatter, min: 0, max: 30, step: 0.5 },
      fadeOut: { value: defaults.fadeOut, min: 0, max: 1, step: 0.01 },
    });
    const trail = useControls("Trail", {
      trailLength: {
        value: defaults.trailLength,
        min: 0,
        max: 0.5,
        step: 0.01,
      },
      maxTrail: { value: defaults.maxTrail, min: 0, max: 80, step: 1 },
    });
    const display = useControls("Display", {
      minLuma: { value: defaults.minLuma, min: 0, max: 1, step: 0.01 },
    });
    // the matching is built once from the images, so a change rebuilds it
    const matching = useControls("Matching", {
      enabled: defaults.matching.enabled,
      by: {
        value: defaults.matching.by,
        options: ["hue", "saturation", "lightness"] as TSortBy[],
      },
      randomness: {
        value: defaults.matching.randomness,
        min: 0,
        max: 1,
        step: 0.01,
      },
    });

    useEffect(() => {
      let cancelled = false;

      Promise.all(images.map(loadImage)).then((result) => {
        if (!cancelled) {
          setLoaded(result);
        }
      });

      return () => {
        cancelled = true;
      };
    }, []);

    useEffect(() => {
      if (!loaded) {
        return;
      }

      // the first build goes at once, the next ones wait until the controls
      // stop moving
      const id = setTimeout(
        () => {
          built.current = true;
          // makes the first frame set the attributes of the current slide
          slideIndex.current = -1;
          setSlides(createSlidesData(loaded, matching));
        },
        built.current ? 400 : 0,
      );

      return () => clearTimeout(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded, matching.enabled, matching.by, matching.randomness]);

    // free the buffers of the geometry that has been replaced
    useEffect(() => () => slides?.geometry.dispose(), [slides]);

    // geometry appears after the images are loaded, so refit the camera then
    useEffect(() => {
      if (slides) {
        bounds.refresh().clip().fit();
        onReady?.();
      }
    }, [slides, bounds, onReady]);

    useFrame((state, delta) => {
      if (animation.mode === 1) {
        advanceSlideProgress(
          getTargetSlide(forwarderRef, images.length),
          Math.min(delta, 0.1),
          animation.duration,
        );
      } else {
        slideState.progress = getScrollSlide(forwarderRef, images.length);
      }
      const { index, t } = splitProgress(slideState.progress, images.length);

      if (slides && index !== slideIndex.current) {
        slideIndex.current = index;
        setSlide(slides, index);
      }

      const uniforms = material.uniforms;
      uniforms.scroll.value = t;
      uniforms.delaySpread.value = wave.delaySpread;
      uniforms.overlap.value = wave.overlap;
      uniforms.waveNoise.value = wave.waveNoise;
      uniforms.waveNoiseScale.value = wave.waveNoiseScale;
      uniforms.windDir.value.set(...wind.windDir);
      uniforms.windPush.value = wind.windPush;
      uniforms.windTurbulence.value = wind.windTurbulence;
      uniforms.windScale.value = wind.windScale;
      uniforms.scatter.value = wind.scatter;
      uniforms.fadeOut.value = wind.fadeOut;
      uniforms.trailLength.value = trail.trailLength;
      uniforms.maxTrail.value = trail.maxTrail;
      uniforms.minLuma.value = display.minLuma;
      // the trail is measured in device pixels, like gl_PointSize
      uniforms.resolution.value
        .set(state.size.width, state.size.height)
        .multiplyScalar(state.viewport.dpr);

      uniforms.pointerPos.value = state.pointer;
    });

    if (!slides) {
      return null;
    }

    return (
      <group position={[0, 0, 0]} scale={[0.1, 0.1, 0.1]} rotation={[0, 1, 0]}>
        <points geometry={slides.geometry} material={material} />
      </group>
    );
  },
);
