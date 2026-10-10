import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats, Bounds } from "@react-three/drei";
import { Slides, TCubeRef } from "./components/slides";

import "./styles.css";
import { PerspectiveCamera } from "@react-three/drei";

import { forwardRef, useCallback, useRef, useState } from "react";
import { images } from "./images";

type TSceneProps = { onReady?: () => void };

export const Scene = forwardRef<TCubeRef, TSceneProps>(
  ({ onReady }, scrollRef) => {
    return (
      <>
        <Stats />
        <color attach="background" args={["#000"]} />

        {/* margin is the ratio of the viewport to the scene: 1.25 = 80% of it */}
        <Bounds fit clip observe margin={1.1}>
          <Slides ref={scrollRef} onReady={onReady} />
        </Bounds>

        <fog attach="fog" args={["white", 50, 190]} />
        <spotLight
          visible
          position={[10, 10, 5]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        <spotLight
          visible
          position={[-10, 10, 5]}
          angle={0.15}
          penumbra={1}
          intensity={2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        <PerspectiveCamera
          makeDefault
          // aspect={window.innerWidth / window.innerHeight}

          fov={10}
          position={[18, 0, 10]}
        />
        <OrbitControls makeDefault />
      </>
    );
  },
);

export const SandImageSlider = () => {
  const scrollRef = useRef<TCubeRef | null>(null);
  const [loading, setLoading] = useState(true);
  const onReady = useCallback(() => setLoading(false), []);

  return (
    <div className="glb-models">
      <div className="canvas-container">
        <Canvas className="canvas" dpr={[1, 2]}>
          <Scene ref={scrollRef} onReady={onReady} />
        </Canvas>
        <div
          className={loading ? "loader" : "loader loader-hidden"}
          role="status"
          aria-live="polite"
        >
          <div className="loader-spinner" />
          <div className="loader-text">Loading scene</div>
        </div>
      </div>
      <div
        onScroll={(e) => {
          scrollRef.current = {
            //@ts-ignore
            offset: e.target?.scrollTop,
            //@ts-ignore
            max: e.target.offsetHeight,
          };
        }}
        className="scrollable"
      >
        {images.map((src, index) => (
          <div className="page" key={src}>
            <div className="content">{index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
