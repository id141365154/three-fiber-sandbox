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

import { fragment } from "./fragment";
import { vertex } from "./vertex";
import { images } from "../images";

export type TCubeRef = { offset: number; max: number };

// width of the pixel grid in pixels, one particle per grid pixel
const gridWidth = 1900;
// world size of the grid width
const worldSize = 30;
// false: particle i stays on the pixel i of every image (no matching by
// lightness), so every particle just flies to the same place of the next image
const sortParticles = true;
// 1: the scroll snaps to a slide and the transition then plays for
//    transitionDuration seconds
// 2: the transition progress follows the scroll position linearly (as in
//    sand-slider)
const animationMode = 1 as 1 | 2;
// HSL component the particles are matched by: "hue" | "saturation" | "lightness"
const sortBy: "hue" | "saturation" | "lightness" = "lightness";

type TSlidesData = {
  geometry: BufferGeometry;
  positionAttrs: Float32BufferAttribute[];
  colorAttrs: Float32BufferAttribute[];
};

// seconds the transition to the neighbouring slide takes, regardless of how
// fast the scroll (with snapping) itself is
const transitionDuration = 5;

// Animated progress, 0..count-1: it moves to the slide the scroll has snapped
// to at a constant speed of 1 / transitionDuration slides per second.
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

const advanceSlideProgress = (target: number, delta: number) => {
  const step = delta / transitionDuration;
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

// Indices of the colors (rgb triples) sorted by the chosen HSL component. The
// key and the index are packed into one double (24 + 24 bits) so the native
// numeric sort can be used.
const argsortByColor = (colors: Float32Array) => {
  const key = sortKeys[sortBy];
  const count = colors.length / 3;
  const packed = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    const k = key(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
    packed[i] = Math.round(k * (indexRange - 1)) * indexRange + i;
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
// pixel of image k whose HSL component (sortBy) has the same rank as the one
// it had in slide k - 1. Matching by rank keeps it one-to-one,
// so every pixel of every image gets exactly one particle.
const createSlidesData = (loaded: HTMLImageElement[]): TSlidesData => {
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

    if (sortParticles && prevColors) {
      const source = argsortByColor(prevColors);
      const target = argsortByColor(pixels.colors);
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
    // height of the arc of a flight as long as the whole grid width
    arcHeight: { value: 10 },
    worldSize: { value: worldSize },
    // particles with luma below this are not rendered
    minLuma: { value: 0.1 },
    pointerPos: { value: new Vector3(0, 0, 0) },
  },
});

export const Slides = forwardRef<TCubeRef>((props, forwarderRef) => {
  const [slides, setSlides] = useState<TSlidesData | null>(null);
  const slideIndex = useRef(0);
  const bounds = useBounds();

  useEffect(() => {
    let cancelled = false;

    Promise.all(images.map(loadImage)).then((loaded) => {
      if (!cancelled) {
        slideIndex.current = 0;
        setSlides(createSlidesData(loaded));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // geometry appears after the images are loaded, so refit the camera then
  useEffect(() => {
    if (slides) {
      bounds.refresh().clip().fit();
    }
  }, [slides, bounds]);

  useFrame((state, delta) => {
    if (animationMode === 1) {
      advanceSlideProgress(
        getTargetSlide(forwarderRef, images.length),
        Math.min(delta, 0.1),
      );
    } else {
      slideState.progress = getScrollSlide(forwarderRef, images.length);
    }
    const { index, t } = splitProgress(slideState.progress, images.length);

    if (slides && index !== slideIndex.current) {
      slideIndex.current = index;
      setSlide(slides, index);
    }

    material.uniforms.scroll.value = t;

    material.uniforms.pointerPos.value = state.pointer;
  });

  if (!slides) {
    return null;
  }

  return (
    <group position={[0, 0, 0]} scale={[0.1, 0.1, 0.1]} rotation={[0, 1, 0]}>
      <points geometry={slides.geometry} material={material} />
    </group>
  );
});
