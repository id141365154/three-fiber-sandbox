import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { ChromaticAberration } from "@react-three/postprocessing";
import { useRef } from "react";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
export const Effects = () => {
  const data = useScroll();

  const ref = useRef(null);
  useFrame((state, delta) => {
    if (!ref.current) {
      return;
    }

    const scroll = Math.sin(3 * Math.PI * data.offset);
    //@ts-expect-error
    ref.current.offset = new Vector2(scroll / 100, scroll / 100);
  });
  return (
    <EffectComposer>
      <ChromaticAberration
        ref={ref}
        radialModulation={false}
        modulationOffset={5}
        blendFunction={BlendFunction.NORMAL} // blend mode
        offset={new Vector2(0, 0)} // color offset
      />
    </EffectComposer>
  );
};
