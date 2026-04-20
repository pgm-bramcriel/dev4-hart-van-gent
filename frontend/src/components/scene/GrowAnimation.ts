import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";

const CM_TO_CAMERA_ZOOM_OUT = 0.008;
const MAX_CAMERA_ZOOM_OUT = 1.4;
const CAMERA_Z_FOLLOW_SPEED = 8;
const GROWTH_KICK_RESPONSE_SPEED = 7;
const GROWTH_KICK_RETURN_SPEED = 1;

type UseGrowAnimationParams = {
  mainLocationHeightCm: number | null;
  mainTreePositionZ: number;
};

function getCameraZoomOutForGrowth(growthCm: number) {
  return Math.min(growthCm * CM_TO_CAMERA_ZOOM_OUT, MAX_CAMERA_ZOOM_OUT);
}

export function useGrowAnimation({
  mainLocationHeightCm,
  mainTreePositionZ,
}: UseGrowAnimationParams) {
  const { camera } = useThree();
  const previousMainHeightCmRef = useRef<number | null>(null);
  const baseCameraZRef = useRef<number | null>(null);
  const targetGrowthKickRef = useRef(0);
  const smoothedGrowthKickRef = useRef(0);
  const [cameraCompensationScale, setCameraCompensationScale] = useState(1);

  useEffect(() => {
    if (baseCameraZRef.current === null) {
      baseCameraZRef.current = camera.position.z;
    }
  }, [camera]);

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
      const growthKick = getCameraZoomOutForGrowth(growthCm);
      targetGrowthKickRef.current = Math.min(
        targetGrowthKickRef.current + growthKick,
        MAX_CAMERA_ZOOM_OUT,
      );
    }

    previousMainHeightCmRef.current = mainLocationHeightCm;
  }, [mainLocationHeightCm]);

  useFrame((_, delta) => {
    if (baseCameraZRef.current === null) {
      baseCameraZRef.current = camera.position.z;
    }

    const baseCameraZ = baseCameraZRef.current;
    targetGrowthKickRef.current = MathUtils.damp(
      targetGrowthKickRef.current,
      0,
      GROWTH_KICK_RETURN_SPEED,
      delta,
    );
    smoothedGrowthKickRef.current = MathUtils.damp(
      smoothedGrowthKickRef.current,
      targetGrowthKickRef.current,
      GROWTH_KICK_RESPONSE_SPEED,
      delta,
    );

    const targetCameraZ = baseCameraZ + smoothedGrowthKickRef.current;
    camera.position.z = MathUtils.damp(
      camera.position.z,
      targetCameraZ,
      CAMERA_Z_FOLLOW_SPEED,
      delta,
    );
    camera.updateProjectionMatrix();

    const baseCameraDistanceToMainTree = baseCameraZ - mainTreePositionZ;
    const currentCameraDistanceToMainTree =
      camera.position.z - mainTreePositionZ;
    const nextCameraCompensationScale =
      baseCameraDistanceToMainTree > 0 && currentCameraDistanceToMainTree > 0
        ? currentCameraDistanceToMainTree / baseCameraDistanceToMainTree
        : 1;

    setCameraCompensationScale((currentScale) =>
      Math.abs(currentScale - nextCameraCompensationScale) < 0.0005
        ? currentScale
        : nextCameraCompensationScale,
    );
  });

  return { cameraCompensationScale };
}
