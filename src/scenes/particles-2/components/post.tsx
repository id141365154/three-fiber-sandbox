import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { forwardRef, useRef } from "react";

const Pi = 3.141592654;

export const Post = forwardRef((_, forwardedRef) => {
  const ref = useRef<any>(null);
  useFrame(() => {
    if (!ref.current) {
      return;
    }

    // @ts-ignore
    const scrollVal = forwardedRef?.current?.offset || 0;
    // @ts-ignore
    const max = forwardedRef?.current?.max || window.innerHeight;

    const offset = (scrollVal * 100) / max / 100;

    const x = Pi * offset;

    const scroll = Math.abs(Math.sin(Number(x.toFixed(3))));

    ref.current.intensity = scroll * 50;
  });

  return (
    <EffectComposer>
      <Bloom
        ref={ref}
        mipmapBlur
        intensity={0} // The bloom intensity.
        luminanceThreshold={0.5}
      />
    </EffectComposer>
  );
});
