import { Html, OrbitControls } from "@react-three/drei";
import Lights from "./scene/Lights";
import { useGrowAnimation } from "./scene/GrowAnimation";
import { LSystemTree } from "./models/LSystemTree";

type MainSceneProps = {
  mainLocationName: string;
  mainLocationHeightLabel: string;
  secondaryLocationName: string;
  secondaryLocationHeightLabel: string;
  mainLocationHeightCm: number | null;
  secondaryLocationHeightCm: number | null;
  leafRustleIntensity: number;
};

const MAIN_TREE_POSITION: [number, number, number] = [0, -1.4, 0];
const MAIN_TREE_ROTATION: [number, number, number] = [0, -0.8, 0];
const MAIN_TREE_BASE_SCALE = 0.18;
const PROCEDURAL_TREE_MIN_MODEL_HEIGHT = 8;
const PROCEDURAL_TREE_MAX_MODEL_HEIGHT = 13;
const TREE_MAX_HEIGHT_REACHED_AT_M = 30;
const SECONDARY_TREE_POSITION: [number, number, number] = [-2, -2.08, -2.8];
const SECONDARY_TREE_ROTATION: [number, number, number] = [0, -0.9, 0];
const SECONDARY_TREE_BASE_SCALE = 0.12;
const HILL_1_POSITION: [number, number, number] = [3.3, -3.0, -1.4];
const HILL_1_SCALE: [number, number, number] = [5.6, 1.8, 2.2];
const HILL_2_POSITION: [number, number, number] = [0, -3.3, 0.4];
const HILL_2_SCALE: [number, number, number] = [4.2, 2.1, 2.4];
const HILL_3_POSITION: [number, number, number] = [-3.8, -3.1, -0.8];
const HILL_3_SCALE: [number, number, number] = [4.8, 1.7, 2.1];

function getModelHeightForMeters(heightCm: number | null) {
  const meters = Math.max(1, (heightCm ?? 100) / 100);
  const ratio = Math.min(1, (meters - 1) / (TREE_MAX_HEIGHT_REACHED_AT_M - 1));
  return (
    PROCEDURAL_TREE_MIN_MODEL_HEIGHT +
    (PROCEDURAL_TREE_MAX_MODEL_HEIGHT - PROCEDURAL_TREE_MIN_MODEL_HEIGHT) * ratio
  );
}

function getLabelOffsetY(treeScale: number, treeHeightCm: number | null) {
  return getModelHeightForMeters(treeHeightCm) * treeScale + 0.35;
}

const MainScene = ({
  mainLocationName,
  mainLocationHeightLabel,
  secondaryLocationName,
  secondaryLocationHeightLabel,
  mainLocationHeightCm,
  secondaryLocationHeightCm,
  leafRustleIntensity,
}: MainSceneProps) => {
  const { cameraCompensationScale } = useGrowAnimation({
    mainLocationHeightCm,
    mainTreePositionZ: MAIN_TREE_POSITION[2],
  });

  const effectiveMainTreeScale =
    MAIN_TREE_BASE_SCALE * cameraCompensationScale;
  const effectiveSecondaryTreeScale = SECONDARY_TREE_BASE_SCALE;
  const mainLabelOffsetY = getLabelOffsetY(
    effectiveMainTreeScale,
    mainLocationHeightCm,
  );
  const secondaryLabelOffsetY = getLabelOffsetY(
    effectiveSecondaryTreeScale,
    secondaryLocationHeightCm,
  );

  return (
    <>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
      <Lights />

      <mesh position={HILL_1_POSITION} scale={HILL_1_SCALE}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#46AA4A" />
      </mesh>
      <mesh position={HILL_2_POSITION} scale={HILL_2_SCALE}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#55B959" />
      </mesh>
      <mesh position={HILL_3_POSITION} scale={HILL_3_SCALE}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#46AA4A" />
      </mesh>

      <LSystemTree
        position={MAIN_TREE_POSITION}
        rotation={MAIN_TREE_ROTATION}
        scale={effectiveMainTreeScale}
        heightCm={mainLocationHeightCm}
        rustleIntensity={leafRustleIntensity}
        seed={1}
      />
      <Html
        position={[
          MAIN_TREE_POSITION[0],
          MAIN_TREE_POSITION[1] + mainLabelOffsetY,
          MAIN_TREE_POSITION[2],
        ]}
        transform
        center
        distanceFactor={1.8}
      >
        <div className="pointer-events-none text-center text-black">
          <p className="text-3xl font-bold leading-tight">{mainLocationName}</p>
          <p className="text-lg font-regular leading-tight">
            {mainLocationHeightLabel}
          </p>
        </div>
      </Html>
      <LSystemTree
        position={SECONDARY_TREE_POSITION}
        rotation={SECONDARY_TREE_ROTATION}
        scale={effectiveSecondaryTreeScale}
        heightCm={secondaryLocationHeightCm}
        rustleIntensity={0}
        seed={2}
      />
      <Html
        position={[
          SECONDARY_TREE_POSITION[0],
          SECONDARY_TREE_POSITION[1] + secondaryLabelOffsetY,
          SECONDARY_TREE_POSITION[2],
        ]}
        transform
        center
        distanceFactor={1.8}
      >
        <div className="pointer-events-none text-center text-black">
          <p className="text-3xl font-bold leading-tight">
            {secondaryLocationName}
          </p>
          <p className="text-lg font-regular leading-tight">
            {secondaryLocationHeightLabel}
          </p>
        </div>
      </Html>
    </>
  );
};

export default MainScene;
