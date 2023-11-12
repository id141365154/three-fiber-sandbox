import { Bloom } from "@react-three/postprocessing";
import { EffectComposer } from "@react-three/postprocessing";
import { BloomEffect } from "postprocessing";
import { useFrame } from "@react-three/fiber";
import { forwardRef, useRef } from "react";
import { TCubeRef } from "./components/slides";

export const Effects = forwardRef<TCubeRef>((_, forwarderRef) => {
  const bloomRef = useRef<typeof BloomEffect>(null);

  useFrame((state) => {
    if (!bloomRef.current) {
      return;
    }
    // @ts-ignore
    const scrollVal = forwarderRef?.current?.offset || 0;
    // @ts-ignore
    const max = forwarderRef?.current?.max || window.innerHeight;

    const offset = (scrollVal * 100) / max / 100;
    // eslint-disable-next-line no-console

    const period = Math.sin(offset * Math.PI);
    // @ts-ignore
    bloomRef.current.intensity = Math.abs(period * 2);
  });

  return (
    <EffectComposer>
      <Bloom ref={bloomRef} />
    </EffectComposer>
  );
});
