import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import { MathUtils, SRGBColorSpace, Texture } from "three";
import { useControls } from "leva";

import { fragment, maxDrops, maxLayers } from "./fragment";
import { vertex } from "./vertex";
import { images } from "./images";

import "./styles.css";

// the plane has the proportions of the images (16:9)
const planeWidth = 16;
const planeHeight = 9;
const aspect = planeWidth / planeHeight;

// a transition that is running: the image comes out of the drops of one click
type TLayer = {
  texture: Texture;
  // x, y, time of every drop in a row
  drops: Float32Array;
  endsAt: number;
};

// a drop that has not fallen yet: its start time is far in the future
const idle = 1e9;

const Drops = () => {
  const textures = useTexture(images);
  const viewport = useThree((state) => state.viewport);

  const settings = useControls("drops", {
    dropsCount: { value: 1, min: 1, max: maxDrops, step: 1 },
    // how far beyond the front of the earlier drops the next one falls (in
    // heights of the plane); a drop inside an earlier circle would be invisible
    dropSpread: { value: 0.07, min: 0, max: 0.5, step: 0.01 },
    // pause between the drops of one click, seconds
    dropDelay: { value: 0.25, min: 0, max: 1, step: 0.01 },
    // speed of the front, in heights of the plane per second
    speed: { value: 0.8, min: 0.1, max: 3, step: 0.05 },
    // softness of the edge of the new image
    edge: { value: 0.06, min: 0.005, max: 0.5, step: 0.005 },
    // how far the noise pushes the edge of a circle
    noiseAmount: { value: 0.1, min: 0, max: 0.5, step: 0.005 },
    // size of the details of the edge, higher = smaller
    noiseScale: { value: 3.5, min: 1, max: 30, step: 0.5 },
    waveAmount: { value: 0.01, min: 0, max: 0.05, step: 0.001 },
    waveFrequency: { value: 28, min: 5, max: 150, step: 1 },
    light: { value: 0.01, min: 0, max: 0.3, step: 0.005 },
  });
  // the handlers below live in the closure of the first render
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // the state of the transitions lives in refs: a re-render is not needed
  const nextImage = useRef(0);
  // running transitions, the oldest first; each is drawn over the previous
  const layers = useRef<TLayer[]>([]);

  const uniforms = useMemo(() => {
    const result: Record<string, { value: unknown }> = {
      uBase: { value: textures[0] },
      uTime: { value: 0 },
      uAspect: { value: aspect },
      uSpeed: { value: 0 },
      uEdge: { value: 0 },
      uNoiseAmount: { value: 0 },
      uNoiseScale: { value: 0 },
      uWaveAmount: { value: 0 },
      uWaveFrequency: { value: 0 },
      uLight: { value: 0 },
      // the drops of all layers in a row; a flat array, not Vector3, so that
      // three uploads it as is
      uDrops: { value: new Float32Array(maxLayers * maxDrops * 3) },
    };
    for (let k = 0; k < maxLayers; k++) {
      result[`uLayer${k}`] = { value: textures[0] };
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMemo(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
    });
  }, [textures]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    uniforms.uTime.value = time;

    const s = settingsRef.current;
    uniforms.uSpeed.value = s.speed;
    uniforms.uEdge.value = s.edge;
    uniforms.uNoiseAmount.value = s.noiseAmount;
    uniforms.uNoiseScale.value = s.noiseScale;
    uniforms.uWaveAmount.value = s.waveAmount;
    uniforms.uWaveFrequency.value = s.waveFrequency;
    uniforms.uLight.value = s.light;

    // a transition that has fully come out: its image becomes the base
    while (layers.current.length && time >= layers.current[0].endsAt) {
      uniforms.uBase.value = layers.current.shift()!.texture;
    }

    const drops = uniforms.uDrops.value as Float32Array;
    for (let k = 0; k < maxLayers; k++) {
      const layer = layers.current[k];
      uniforms[`uLayer${k}`].value = layer
        ? layer.texture
        : uniforms.uBase.value;
      const offset = k * maxDrops * 3;
      for (let i = 0; i < maxDrops * 3; i++) {
        // a slot that is not used: its drops have not fallen yet
        drops[offset + i] = layer ? layer.drops[i] : i % 3 === 2 ? idle : 0.5;
      }
    }
  });

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    // all the slots are busy, wait for the oldest transition to end
    if (layers.current.length >= maxLayers || !event.uv) {
      return;
    }
    event.stopPropagation();

    const time = uniforms.uTime.value as number;
    const { x, y } = event.uv;
    const { dropsCount, dropSpread, dropDelay } = settingsRef.current;

    nextImage.current = (nextImage.current + 1) % textures.length;
    const drops = Float32Array.from({ length: maxDrops * 3 }, (_, i) =>
      i % 3 === 2 ? idle : 0.5,
    );
    const { speed } = settingsRef.current;
    for (let i = 0; i < dropsCount; i++) {
      // The first drop falls exactly where the click is. A drop inside the
      // circle of an earlier one would change nothing, so the next ones fall
      // beyond the front of the earlier drops by at least half of the spread
      // (distance in heights of the plane).
      const distance =
        i === 0
          ? 0
          : speed * dropDelay * i + dropSpread * (0.5 + Math.random() / 2);
      const angle = Math.random() * Math.PI * 2;
      drops[i * 3] = MathUtils.clamp(
        x + (Math.cos(angle) * distance) / aspect,
        0,
        1,
      );
      drops[i * 3 + 1] = MathUtils.clamp(y + Math.sin(angle) * distance, 0, 1);
      drops[i * 3 + 2] = time + i * dropDelay;
    }

    const s = settingsRef.current;
    // the front has to run the diagonal of the plane (aspect-corrected uv) and
    // leave the plane with its edge
    const duration =
      (Math.hypot(aspect, 1) + s.edge + s.noiseAmount) / s.speed +
      s.dropDelay * (s.dropsCount - 1);
    layers.current.push({
      texture: textures[nextImage.current],
      drops,
      endsAt: time + duration,
    });
  };

  // the plane is fit into the window
  const scale = Math.min(
    viewport.width / planeWidth,
    viewport.height / planeHeight,
  );

  return (
    <mesh scale={scale} onPointerDown={onPointerDown}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <shaderMaterial
        defines={{ DROPS: maxDrops, LAYERS: maxLayers }}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
      />
    </mesh>
  );
};

export const DropsScene = () => (
  <div className="drops-canvas">
    <Canvas dpr={[1, 2]}>
      <color attach="background" args={["#000"]} />
      <PerspectiveCamera makeDefault fov={50} position={[0, 0, 10]} />
      <Suspense fallback={null}>
        <Drops />
      </Suspense>
    </Canvas>
  </div>
);
