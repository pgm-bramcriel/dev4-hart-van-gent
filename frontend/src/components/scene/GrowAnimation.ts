import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

const CM_TO_CAMERA_ZOOM_OUT = 0.003;
const MAX_CAMERA_ZOOM_OUT = 1.4;
const CAMERA_Z_LERP = 0.12;

type UseGrowAnimationParams = {
  mainLocationHeightCm: number | null;
  mainTreePositionZ: number;
};

function getCameraZoomOutForGrowth(
  currentHeightCm: number | null,
  baselineHeightCm: number | null,
) {
  if (currentHeightCm === null || baselineHeightCm === null) return 0;
  const growthCm = Math.max(0, currentHeightCm - baselineHeightCm);
  return Math.min(growthCm * CM_TO_CAMERA_ZOOM_OUT, MAX_CAMERA_ZOOM_OUT);
}

export function useGrowAnimation({
  mainLocationHeightCm,
  mainTreePositionZ,
}: UseGrowAnimationParams) {
  const { camera } = useThree();
  const baselineMainHeightCmRef = useRef<number | null>(null);
  const baseCameraZRef = useRef<number | null>(null);

  useEffect(() => {
    if (baseCameraZRef.current === null) {
      baseCameraZRef.current = camera.position.z;
    }
  }, [camera]);

  useEffect(() => {
    if (baselineMainHeightCmRef.current === null && mainLocationHeightCm !== null) {
      baselineMainHeightCmRef.current = mainLocationHeightCm;
    }
  }, [mainLocationHeightCm]);

  const baseCameraZ = baseCameraZRef.current ?? camera.position.z;
  const cameraZoomOut = getCameraZoomOutForGrowth(
    mainLocationHeightCm,
    baselineMainHeightCmRef.current,
  );
  const targetCameraZ = baseCameraZ + cameraZoomOut;

  useFrame(() => {
    camera.position.z += (targetCameraZ - camera.position.z) * CAMERA_Z_LERP;
    camera.updateProjectionMatrix();
  });

  const baseCameraDistanceToMainTree = baseCameraZ - mainTreePositionZ;
  const targetCameraDistanceToMainTree = targetCameraZ - mainTreePositionZ;
  const cameraCompensationScale =
    baseCameraDistanceToMainTree > 0 && targetCameraDistanceToMainTree > 0
      ? targetCameraDistanceToMainTree / baseCameraDistanceToMainTree
      : 1;

  return { cameraCompensationScale };
}
