import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";

const CM_TO_TREE_GROWTH_SCALE = 0.0008;
const MAX_TREE_GROWTH_SCALE_KICK = 0.24;
const GROWTH_KICK_RESPONSE_SPEED = 5;
const GROWTH_KICK_RETURN_SPEED = 0.4;
const GROWTH_KICK_SHRINK_DELAY_MS = 4000;

type UseGrowAnimationParams = {
  mainLocationHeightCm: number | null;
};

export function useGrowAnimation({
  mainLocationHeightCm,
}: UseGrowAnimationParams) {
  const previousMainHeightCmRef = useRef<number | null>(null);
  const targetTreeGrowthKickRef = useRef(0);
  const smoothedTreeGrowthKickRef = useRef(0);
  const lastGrowthKickAtRef = useRef(0);
  const [treeGrowthScale, setTreeGrowthScale] = useState(1);

  useEffect(() => {
    if (mainLocationHeightCm === null) return;

    if (previousMainHeightCmRef.current === null) {
      previousMainHeightCmRef.current = mainLocationHeightCm;
      return;
    }

    const growthCm = Math.max(
      0,
      mainLocationHeightCm - previousMainHeightCmRef.current,
    );

    if (growthCm > 0) {
      targetTreeGrowthKickRef.current = MathUtils.clamp(
        targetTreeGrowthKickRef.current + growthCm * CM_TO_TREE_GROWTH_SCALE,
        0,
        MAX_TREE_GROWTH_SCALE_KICK,
      );
      lastGrowthKickAtRef.current = Date.now();
    }

    previousMainHeightCmRef.current = mainLocationHeightCm;
  }, [mainLocationHeightCm]);

  useFrame((_, delta) => {
    const shrinkDelayPassed =
      Date.now() - lastGrowthKickAtRef.current >= GROWTH_KICK_SHRINK_DELAY_MS;
    if (shrinkDelayPassed) {
      targetTreeGrowthKickRef.current = MathUtils.damp(
        targetTreeGrowthKickRef.current,
        0,
        GROWTH_KICK_RETURN_SPEED,
        delta,
      );
    }
    smoothedTreeGrowthKickRef.current = MathUtils.damp(
      smoothedTreeGrowthKickRef.current,
      targetTreeGrowthKickRef.current,
      GROWTH_KICK_RESPONSE_SPEED,
      delta,
    );

    const nextTreeGrowthScale = 1 + smoothedTreeGrowthKickRef.current;
    setTreeGrowthScale((currentScale) =>
      Math.abs(currentScale - nextTreeGrowthScale) < 0.0005
        ? currentScale
        : nextTreeGrowthScale,
    );
  });

  return { treeGrowthScale };
}
