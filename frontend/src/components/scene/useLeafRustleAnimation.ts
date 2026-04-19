import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";

const BASE_RUSTLE_X = 0.022;
const BASE_RUSTLE_Y = 0.016;
const BASE_RUSTLE_Z = 0.011;
const RUSTLE_LERP = 0.085;

type UseLeafRustleAnimationParams = {
  intensity: number;
  phaseOffset?: number;
};

export function useLeafRustleAnimation({
  intensity,
  phaseOffset = 0,
}: UseLeafRustleAnimationParams) {
  const leavesGroupRef = useRef<Group | null>(null);

  useFrame(({ clock }) => {
    const leavesGroup = leavesGroupRef.current;
    if (!leavesGroup) return;

    const rustleIntensity = MathUtils.clamp(intensity, 0, 2);
    const time =
      clock.getElapsedTime() * (1 + rustleIntensity * 0.9) + phaseOffset;

    const targetX = Math.sin(time * 1.65) * BASE_RUSTLE_X * rustleIntensity;
    const targetY =
      Math.sin(time * 1.25 + 0.9) * BASE_RUSTLE_Y * rustleIntensity;
    const targetZ =
      Math.sin(time * 2.05 + 1.75) * BASE_RUSTLE_Z * rustleIntensity;

    leavesGroup.rotation.x = MathUtils.lerp(
      leavesGroup.rotation.x,
      targetX,
      RUSTLE_LERP,
    );
    leavesGroup.rotation.y = MathUtils.lerp(
      leavesGroup.rotation.y,
      targetY,
      RUSTLE_LERP,
    );
    leavesGroup.rotation.z = MathUtils.lerp(
      leavesGroup.rotation.z,
      targetZ,
      RUSTLE_LERP,
    );
  });

  return leavesGroupRef;
}
