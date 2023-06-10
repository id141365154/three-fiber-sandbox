import {
  ChromaticAberration,
  DepthOfField,
  Noise,
} from "@react-three/postprocessing";
import { EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { Vector2, Vector3, MathUtils } from "three";
import {
  BlendFunction,
  ChromaticAberrationEffect,
  DepthOfFieldEffect,
  NoiseEffect,
} from "postprocessing";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

const NoiseEffectComponent = () => {
  const mousePosBuf = useRef([0, 0]);
  const [opacity, setOpacity] = useState(0);
  useFrame((state) => {
    const xMovement = Math.abs(mousePosBuf.current[0] - state.pointer.x) / 10;
    const yMovement = Math.abs(mousePosBuf.current[1] - state.pointer.y) / 100;

    mousePosBuf.current = [state.pointer.x, state.pointer.y];

    const totalMovement = (xMovement + yMovement) / 2;

    setOpacity(totalMovement);
  });
  return (
    <Noise
      opacity={MathUtils.smoothstep(opacity * 200, 0, 1)}
      blendFunction={BlendFunction.DARKEN}
    />
  );
};

export const Effects = () => {
  const offset = useControls("offset", {
    value: 1,
    min: 0,
    max: 3,
    step: 1,
  });

  const depthOfField = useControls("depthOfField", {
    blur: {
      value: 0,
      min: 0,
      max: 1000,
      step: 1,
    },
    focusRange: {
      value: 1,
      min: 0,
      max: 1000,
      step: 1,
    },
    focusDistance: {
      value: 1,
      min: 0,
      max: 1000,
      step: 1,
    },
    worldFocusRange: {
      value: 1,
      min: 0,
      max: 1000,
      step: 1,
    },
    worldFocusDistance: {
      value: 3,
      min: 0,
      max: 5,
      step: 1,
    },
    bokehScale: {
      value: 10,
      min: 0,
      max: 10,
      step: 1,
    },
  });
  const aberationRef = useRef<ChromaticAberrationEffect>(null);
  const deepOfFieldRef = useRef<DepthOfFieldEffect>(null);
  const noiseRef = useRef<NoiseEffect>(null);

  const mousePosBuf = useRef([0, 0]);

  useFrame((state) => {
    if (!aberationRef.current) {
      return;
    }

    const xMovement = Math.abs(mousePosBuf.current[0] - state.pointer.x) / 10;
    const yMovement = Math.abs(mousePosBuf.current[1] - state.pointer.y) / 100;

    mousePosBuf.current = [state.pointer.x, state.pointer.y];

    const v3 = state.camera.position.lerp(
      new Vector3(-state.pointer.x, state.pointer.y, 0),
      0.01
    );

    aberationRef.current.offset.lerp(new Vector2(xMovement, yMovement), 0.08);

    if (noiseRef.current) {
      //noiseRef.current.opacity = (xMovement + yMovement) / 2;
      //console.log("noiseRef.current", noiseRef.current);
      //deepOfFieldRef.current.bokehScale = 10;
      //deepOfFieldRef.current.bokehScale = 10;
    }
  });

  const getDepthOfField = () => (
    <DepthOfField
      ref={deepOfFieldRef}
      blur={depthOfField.blur}
      focusRange={depthOfField.focusRange}
      focusDistance={depthOfField.focusDistance}
      worldFocusRange={depthOfField.worldFocusRange}
      worldFocusDistance={depthOfField.worldFocusDistance}
      //bokehScale={depthOfField.bokehScale}
    />
  );

  const getChromaticAberration = () => {
    return (
      <>
        <ChromaticAberration
          ref={aberationRef}
          radialModulation={false}
          modulationOffset={1}
          blendFunction={BlendFunction.NORMAL} // blend mode
          offset={new Vector2(offset.value * 0.001, offset.value * 0.001)} // color offset
        />
      </>
    );
  };

  //return null;
  return (
    <EffectComposer>
      {getChromaticAberration()}
      <NoiseEffectComponent />
    </EffectComposer>
  );
};
